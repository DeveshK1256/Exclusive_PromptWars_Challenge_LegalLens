import { GoogleGenAI } from '@google/genai';
import { env } from '../env';
import { AI_CONFIG } from './config';

/**
 * Initializes Google Gen AI SDK instance using GEMINI_API_KEY
 */
export function getGeminiClient() {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'dummy_gemini_key';
  return new GoogleGenAI({ apiKey });
}

export interface AIRunLog {
  documentId: string;
  agentType: string;
  model: string;
  tokenUsage: number;
  latencyMs: number;
  status: 'completed' | 'failed';
}

/**
 * Helper to record AI Execution Run to ai_runs table (Section 9.1)
 */
export function recordAIRunLog(log: AIRunLog) {
  return {
    id: `run_${Date.now()}`,
    document_id: log.documentId,
    agent_type: log.agentType,
    model: log.model || AI_CONFIG.reasoningModel,
    token_usage: log.tokenUsage,
    latency_ms: log.latencyMs,
    status: log.status,
    created_at: new Date().toISOString(),
  };
}

/**
 * Resilient helper to call Gemini generateContent with 429 rate limit backoff
 */
export async function callGeminiWithRetry(
  ai: ReturnType<typeof getGeminiClient>,
  options: { model: string; contents: string },
  maxRetries = 3
) {
  let model = options.model;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents: options.contents,
      });
    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('Quota exceeded');

      if (is429 && attempt < maxRetries) {
        const delay = (attempt + 1) * 3000;
        await new Promise((res) => setTimeout(res, delay));
        model = AI_CONFIG.fastModel;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Exceeded max retries calling Gemini API');
}

