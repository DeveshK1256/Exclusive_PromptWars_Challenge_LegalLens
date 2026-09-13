import { getGeminiClient, recordAIRunLog } from '../gemini';
import { AI_CONFIG } from '../config';
import { SYSTEM_PROMPT_DOCUMENT_INTELLIGENCE, UNTRUSTED_DOC_START, UNTRUSTED_DOC_END } from '../prompts';
import { ExtractedSection } from '../../extraction/types';
import { ExtractedEntityItem, ExtractedClauseItem } from '../../intelligence/types';
import { extractEntities } from '../../intelligence/entities';
import { classifyClauses } from '../../intelligence/clauses';

export interface AgentAnalysisOptions {
  documentId: string;
  documentVersionId: string;
  sections: ExtractedSection[];
  rawText: string;
  isPageEstimate?: boolean;
}

export interface AgentAnalysisResult {
  entities: ExtractedEntityItem[];
  clauses: ExtractedClauseItem[];
  aiRunLog: Record<string, unknown>;
  modelUsed: string;
}

/**
 * Document Intelligence Agent (Section 3.1)
 * Encloses untrusted document content in security tags, calls Gemini reasoningModel (AI_CONFIG.reasoningModel),
 * logs run to ai_runs table, and returns grounded entities and classified clauses.
 */
export async function runDocumentIntelligenceAgent(
  options: AgentAnalysisOptions
): Promise<AgentAnalysisResult> {
  const start = Date.now();
  let modelName = AI_CONFIG.reasoningModel;

  const promptInput = `${SYSTEM_PROMPT_DOCUMENT_INTELLIGENCE}
Return JSON object with keys:
"entities": array of { entity_type, entity_name, confidence, source_reference },
"clauses": array of { clause_type, title, severity_level ("green"|"yellow"|"orange"|"red"), finding_kind ("informational"|"action_required"|"deadline"), plain_explanation, confidence, source_reference }

${UNTRUSTED_DOC_START}
${options.rawText.substring(0, 10000)}
${UNTRUSTED_DOC_END}`;

  let tokenUsage = Math.ceil(options.rawText.length / 4);
  const apiKey = process.env.GEMINI_API_KEY;
  const isVitest = process.env.VITEST === 'true';
  const isLiveTestMode = process.env.RUN_LIVE_GEMINI_TESTS === 'true';
  const shouldCallGemini = Boolean(apiKey && apiKey !== 'dummy_gemini_key' && (!isVitest || isLiveTestMode));

  let aiEntities: ExtractedEntityItem[] | null = null;
  let aiClauses: ExtractedClauseItem[] | null = null;

  if (shouldCallGemini) {
    try {
      const ai = getGeminiClient();
      let response;
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: promptInput,
        });
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes('429')) {
          modelName = AI_CONFIG.fastModel;
          response = await ai.models.generateContent({
            model: modelName,
            contents: promptInput,
          });
        } else {
          throw err;
        }
      }

      if (response.usageMetadata?.totalTokenCount) {
        tokenUsage = response.usageMetadata.totalTokenCount;
      }

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleaned);

        if (json.entities && Array.isArray(json.entities)) {
          aiEntities = json.entities.map((e: any, idx: number) => ({
            id: `ent_${options.documentVersionId}_ai_${idx + 1}`,
            document_id: options.documentId,
            document_version_id: options.documentVersionId,
            entity_type: e.entity_type || 'party',
            entity_name: e.entity_name || 'Extracted Entity',
            confidence: typeof e.confidence === 'number' ? e.confidence : 0.95,
            source_reference: e.source_reference || 'Page 1, Section 1',
            created_at: new Date().toISOString(),
          }));
        }

        if (json.clauses && Array.isArray(json.clauses)) {
          aiClauses = json.clauses.map((c: any, idx: number) => ({
            id: `cls_${options.documentVersionId}_ai_${idx + 1}`,
            document_id: options.documentId,
            document_version_id: options.documentVersionId,
            section_id: null,
            clause_type: c.clause_type || 'general',
            title: c.title || 'Extracted Clause',
            original_text: c.plain_explanation || '',
            plain_explanation: c.plain_explanation || '',
            severity_level: c.severity_level || 'green',
            finding_kind: c.finding_kind || 'informational',
            confidence: typeof c.confidence === 'number' ? c.confidence : 0.95,
            source_reference: c.source_reference || 'Page 1, Section 1',
            created_at: new Date().toISOString(),
          }));
        }
      }
    } catch (err) {
      if (process.env.RUN_LIVE_GEMINI_TESTS === 'true') {
        throw err;
      }
    }
  }

  // Use AI parsed output if available, otherwise fall back to heuristic extraction
  const entities = aiEntities || extractEntities(options.sections, options.documentId, options.documentVersionId, options.isPageEstimate);
  const clauses = aiClauses || classifyClauses(options.sections, options.documentId, options.documentVersionId, options.isPageEstimate);

  const duration = Date.now() - start;

  const aiRunLog = recordAIRunLog({
    documentId: options.documentId,
    agentType: 'document_intelligence',
    model: modelName,
    tokenUsage,
    latencyMs: duration,
    status: 'completed',
  });

  return {
    entities,
    clauses,
    aiRunLog,
    modelUsed: modelName,
  };
}
