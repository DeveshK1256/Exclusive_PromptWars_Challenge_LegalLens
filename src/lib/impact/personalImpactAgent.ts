import { getGeminiClient, recordAIRunLog, callGeminiWithRetry } from '../ai/gemini';
import { AI_CONFIG } from '../ai/config';
import { SYSTEM_PROMPT_PERSONAL_IMPACT } from '../ai/prompts';
import { sanitizeJurisdictionInference } from '../comparison/comparisonAgent';
import {
  PersonalImpactOptions,
  PersonalImpactResult,
  PersonalImpactItem,
} from './types';

/**
 * Personal Impact Agent (Sprint 9, Section 3.6, Decision 7 & 11)
 * Reframes pre-validated document findings into perspective-aware explanations
 * based on the user's context_role (Employee, Tenant, Freelancer, etc.).
 * Strictly adheres to the Single-Source-of-Truth principle: reads ONLY from
 * existing findings, never re-deriving unverified claims independently.
 */
export async function runPersonalImpactAgent(
  options: PersonalImpactOptions
): Promise<PersonalImpactResult> {
  const start = Date.now();
  let modelName = AI_CONFIG.reasoningModel;

  const promptInput = `${SYSTEM_PROMPT_PERSONAL_IMPACT}
Return ONLY a valid JSON object matching this schema:
{
  "impactSummary": string,
  "roleSpecificImpacts": array of {
    "finding_id": string,
    "title": string,
    "category": string,
    "severity_level": "green" | "yellow" | "orange" | "red",
    "finding_kind": "informational" | "action_required" | "deadline",
    "what_this_means_for_you": string,
    "practical_considerations": array of string,
    "source_reference": string,
    "confidence": number
  },
  "questionsToAsk": array of string,
  "confidence": number
}

Context Role: ${options.contextRole}
Input Pre-Validated Findings:
${JSON.stringify(options.findings, null, 2)}`;

  let tokenUsage = Math.ceil(JSON.stringify(options.findings).length / 4);
  const apiKey = process.env.GEMINI_API_KEY;
  const isVitest = process.env.VITEST === 'true';
  const isLiveTestMode = process.env.RUN_LIVE_GEMINI_TESTS === 'true';
  const shouldCallGemini = Boolean(
    apiKey && apiKey !== 'dummy_gemini_key' && (!isVitest || isLiveTestMode)
  );

  let aiSummary: string | null = null;
  let aiImpacts: PersonalImpactItem[] | null = null;
  let aiQuestions: string[] | null = null;
  const avgFindingConfidence = options.findings.length > 0
    ? options.findings.reduce((acc, f) => acc + (f.confidence ?? 0.95), 0) / options.findings.length
    : 0.90;
  let aiConfidence = Number(avgFindingConfidence.toFixed(2));

  if (shouldCallGemini) {
    try {
      const ai = getGeminiClient();
      const response = await callGeminiWithRetry(ai, {
        model: modelName,
        contents: promptInput,
      });

      if (response.usageMetadata?.totalTokenCount) {
        tokenUsage = response.usageMetadata.totalTokenCount;
      }

      if (response.text) {
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanedText);

        if (json.impactSummary) {
          aiSummary = json.impactSummary;
        }

        if (json.roleSpecificImpacts && Array.isArray(json.roleSpecificImpacts)) {
          aiImpacts = json.roleSpecificImpacts.map((item: any) => ({
            finding_id: item.finding_id || options.findings[0]?.id || 'fnd_001',
            title: item.title || 'Personal Impact Analysis',
            category: item.category || 'General',
            severity_level: item.severity_level || 'yellow',
            finding_kind: item.finding_kind || 'informational',
            what_this_means_for_you: item.what_this_means_for_you || 'Review this provision carefully.',
            practical_considerations: Array.isArray(item.practical_considerations)
              ? item.practical_considerations
              : ['Keep a copy for your records.'],
            source_reference: item.source_reference || 'Document Section 1',
            confidence: typeof item.confidence === 'number'
              ? Math.min(1.0, Math.max(0.0, item.confidence))
              : (options.findings.find((f) => f.id === item.finding_id)?.confidence || 0.94),
          }));
        }

        if (json.questionsToAsk && Array.isArray(json.questionsToAsk)) {
          aiQuestions = json.questionsToAsk;
        }

        if (typeof json.confidence === 'number') {
          aiConfidence = Math.min(1.0, Math.max(0.0, json.confidence));
        }
      }
    } catch (err: any) {
      if (
        process.env.RUN_LIVE_GEMINI_TESTS === 'true' &&
        !err?.message?.includes('RESOURCE_EXHAUSTED') &&
        !err?.message?.includes('429')
      ) {
        throw err;
      }
    }
  }

  const isFallbackUsed = !aiImpacts;
  const effectiveModel = isFallbackUsed ? 'heuristic_fallback' : modelName;
  const analysis_mode = isFallbackUsed ? 'fallback' : 'ai';
  const degraded = isFallbackUsed;

  const rawSummary =
    aiSummary ||
    `Personal impact evaluation for your role as ${options.contextRole} based on ${options.findings.length} document findings.`;
  const rawImpacts: PersonalImpactItem[] =
    aiImpacts || generateHeuristicPersonalImpact(options);
  const rawQuestions: string[] =
    aiQuestions ||
    options.findings.map((f) => `How does ${f.title} apply to my specific situation as a ${options.contextRole}?`);

  // Decision 10 Safety Gate: Enforce Jurisdiction Neutrality on all outputs
  const finalSummary = sanitizeJurisdictionInference(rawSummary, options.jurisdiction);
  const finalImpacts = rawImpacts.map((item) => ({
    ...item,
    what_this_means_for_you: sanitizeJurisdictionInference(item.what_this_means_for_you, options.jurisdiction),
    practical_considerations: item.practical_considerations.map((pc) =>
      sanitizeJurisdictionInference(pc, options.jurisdiction)
    ),
  }));

  const finalQuestions = rawQuestions.map((q) =>
    sanitizeJurisdictionInference(q, options.jurisdiction)
  );

  const latencyMs = Date.now() - start;

  recordAIRunLog({
    documentId: options.documentId,
    agentType: 'personal_impact_agent',
    model: effectiveModel,
    tokenUsage,
    latencyMs,
    status: 'completed',
  });

  return {
    document_id: options.documentId,
    document_version_id: options.documentVersionId,
    context_role: options.contextRole,
    impactSummary: finalSummary,
    roleSpecificImpacts: finalImpacts,
    questionsToAsk: finalQuestions,
    confidence: aiConfidence,
    modelUsed: effectiveModel,
    analysis_mode,
    degraded,
    tokenUsage,
  };
}

/**
 * Heuristic Personal Impact Reframer (Single-Source-of-Truth)
 * Reframes pre-validated findings into role-specific practical considerations
 * without introducing unverified claims or new facts.
 */
function generateHeuristicPersonalImpact(options: PersonalImpactOptions): PersonalImpactItem[] {
  return options.findings.map((f) => {
    let explanation = `As a ${options.contextRole}, this provision affects your obligations and rights regarding ${f.title}.`;
    const considerations: string[] = [
      `Review ${f.title} before committing.`,
      `Keep written records of all communications regarding this clause.`,
    ];

    if (options.contextRole === 'Employee') {
      if (f.category.toLowerCase().includes('compete') || f.title.toLowerCase().includes('compete')) {
        explanation = `As an Employee, this non-compete clause restricts where and for how long you can work after leaving this company.`;
        considerations.unshift('Check if this restricts your future career choices in your industry.');
      } else if (f.category.toLowerCase().includes('notice') || f.title.toLowerCase().includes('notice')) {
        explanation = `As an Employee, this notice requirement dictates how far in advance you or your employer must give notice before resignation or termination.`;
        considerations.unshift('Plan your job transition timeline according to this notice window.');
      }
    } else if (options.contextRole === 'Tenant') {
      if (f.category.toLowerCase().includes('notice') || f.title.toLowerCase().includes('notice')) {
        explanation = `As a Tenant, this notice provision specifies when you must notify your landlord regarding lease renewal or move-out.`;
        considerations.unshift('Mark lease renewal deadlines on your calendar.');
      }
    } else if (options.contextRole === 'Freelancer') {
      explanation = `As a Freelancer, this provision defines your scope of deliverables and payment schedules.`;
      considerations.unshift('Ensure payment milestone terms align with your invoicing schedule.');
    }

    return {
      finding_id: f.id,
      title: f.title,
      category: f.category,
      severity_level: f.severity_level,
      finding_kind: f.finding_kind,
      what_this_means_for_you: explanation,
      practical_considerations: considerations,
      source_reference: f.source_reference,
      confidence: f.confidence || (f.severity_level === 'red' ? 0.96 : f.severity_level === 'orange' ? 0.94 : 0.92),
    };
  });
}
