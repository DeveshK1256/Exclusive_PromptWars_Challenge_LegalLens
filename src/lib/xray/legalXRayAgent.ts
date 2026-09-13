import { ExtractedClauseItem } from '../intelligence/types';
import { XRayFindingCard, LegalXRayOverview } from './types';
import { getGeminiClient, recordAIRunLog } from '../ai/gemini';
import { AI_CONFIG } from '../ai/config';
import { SYSTEM_PROMPT_LEGAL_XRAY, UNTRUSTED_DOC_START, UNTRUSTED_DOC_END } from '../ai/prompts';

/**
 * Legal X-Ray Agent (Section 3.3, Decision 6 & 11)
 * Classifies document findings into 4 severity levels (🟢 🟡 🟠 🔴) and 3 finding kinds (informational, action_required, deadline).
 * Consumes AI_CONFIG.reasoningModel and logs execution runs to ai_runs table.
 */
export async function runLegalXRayAgent(
  documentId: string,
  documentVersionId: string,
  clauses: ExtractedClauseItem[],
  rawText: string,
  jurisdiction?: string | null
): Promise<LegalXRayOverview> {
  const start = Date.now();
  const modelName = AI_CONFIG.reasoningModel;

  const promptInput = `${SYSTEM_PROMPT_LEGAL_XRAY}
Jurisdiction Context: ${jurisdiction || 'Jurisdiction Neutral (Default)'}
Return ONLY a valid JSON array of objects with keys:
"category", "severity" ("green"|"yellow"|"orange"|"red"), "finding_kind" ("informational"|"action_required"|"deadline"), "title", "description", "confidence", "source_reference".

${UNTRUSTED_DOC_START}
${rawText.substring(0, 10000)}
${UNTRUSTED_DOC_END}`;

  let tokenUsage = Math.ceil(rawText.length / 4);
  const apiKey = process.env.GEMINI_API_KEY;
  let aiFindings: XRayFindingCard[] | null = null;

  if (apiKey && apiKey !== 'dummy_gemini_key') {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: promptInput,
      });

      if (response.usageMetadata?.totalTokenCount) {
        tokenUsage = response.usageMetadata.totalTokenCount;
      }

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleaned);

        if (Array.isArray(json)) {
          aiFindings = json.map((f: any, idx: number) => {
            const sanitizedTitle = sanitizeSafetyLanguage(f.title || 'Legal Provision');
            const sanitizedDesc = sanitizeSafetyLanguage(f.description || '');
            const sev = (f.severity as 'green' | 'yellow' | 'orange' | 'red') || 'green';

            return {
              id: `fnd_${documentVersionId}_ai_${idx + 1}`,
              document_id: documentId,
              document_version_id: documentVersionId,
              clause_id: `c_${idx + 1}`,
              category: f.category || 'General Provisions',
              severity: sev,
              finding_kind: (f.finding_kind as 'informational' | 'action_required' | 'deadline') || 'informational',
              title: sanitizedTitle,
              description: sanitizedDesc,
              finding_type: sev === 'green' ? 'fact' : sev === 'red' ? 'recommendation' : 'ai_interpretation',
              confidence: typeof f.confidence === 'number' ? f.confidence : 0.95,
              source_reference: f.source_reference || 'Page 1, Section 1',
              created_at: new Date().toISOString(),
            };
          });
        }
      }
    } catch (err) {
      if (process.env.RUN_LIVE_GEMINI_TESTS === 'true') {
        throw err;
      }
    }
  }

  // Fall back to heuristic transformation of clauses if AI output is empty/offline
  const findings: XRayFindingCard[] = aiFindings || clauses.map((clause, idx) => {
    const sanitizedTitle = sanitizeSafetyLanguage(clause.title);
    const sanitizedDescription = sanitizeSafetyLanguage(clause.plain_explanation);

    return {
      id: `fnd_${documentVersionId}_${idx + 1}`,
      document_id: documentId,
      document_version_id: documentVersionId,
      clause_id: clause.id,
      category: mapClauseCategory(clause.clause_type),
      severity: clause.severity_level,
      finding_kind: clause.finding_kind,
      title: sanitizedTitle,
      description: sanitizedDescription,
      finding_type: clause.severity_level === 'green' ? 'fact' : clause.severity_level === 'red' ? 'recommendation' : 'ai_interpretation',
      confidence: clause.confidence,
      source_reference: clause.source_reference,
      created_at: new Date().toISOString(),
    };
  });

  const duration = Date.now() - start;

  recordAIRunLog({
    documentId,
    agentType: 'legal_xray',
    model: modelName,
    tokenUsage,
    latencyMs: duration,
    status: 'completed',
  });

  return {
    document_id: documentId,
    document_version_id: documentVersionId,
    high_impact_count: findings.filter((f) => f.severity === 'red').length,
    attention_area_count: findings.filter((f) => f.severity === 'orange').length,
    important_count: findings.filter((f) => f.severity === 'yellow').length,
    general_count: findings.filter((f) => f.severity === 'green').length,
    deadlines_count: findings.filter((f) => f.finding_kind === 'deadline').length,
    action_items_count: findings.filter((f) => f.finding_kind === 'action_required').length,
    findings,
  };
}

/**
 * Enforces Safety Language Rules (Decision 6):
 * Replaces illegal/invalid/enforceable assertions with jurisdiction-neutral caution phrasing.
 */
export function sanitizeSafetyLanguage(text: string): string {
  if (!text) return '';

  return text
    .replace(/\b(?:is illegal|are illegal)\b/gi, 'is a potential attention area requiring review')
    .replace(/\b(?:is invalid|are invalid)\b/gi, 'may have significant impact to clarify')
    .replace(/\b(?:is unenforceable|are unenforceable)\b/gi, 'may be subject to review under relevant rules')
    .replace(/\b(?:is enforceable|are enforceable)\b/gi, 'appears standard; consider reviewing');
}

function mapClauseCategory(clauseType: string): string {
  switch (clauseType) {
    case 'termination':
      return 'Termination & Cancellation';
    case 'payment_terms':
    case 'financial':
      return 'Payment & Compensation';
    case 'confidentiality':
      return 'Confidentiality & Non-Disclosure';
    case 'liability_indemnification':
      return 'Liability & Risk Allocation';
    case 'dispute_resolution':
      return 'Governing Law & Disputes';
    default:
      return 'General Provisions';
  }
}
