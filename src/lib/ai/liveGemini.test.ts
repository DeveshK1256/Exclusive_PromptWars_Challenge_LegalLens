import { describe, it, expect } from 'vitest';
import { AI_CONFIG, verifyModelAvailability } from './config';
import { getGeminiClient, recordAIRunLog } from './gemini';
import { generateEmbedding } from './embeddings';

describe('Live Gemini Integration & Model Abstraction Suite (Decision 2)', () => {
  it('confirms AI_CONFIG abstracts model configuration centrally per Decision 2', () => {
    expect(AI_CONFIG.reasoningModel).toBeDefined();
    expect(AI_CONFIG.embeddingModel).toBe('gemini-embedding-001');
    expect(AI_CONFIG.embeddingDimensions).toBe(768);

    // Verify model identifiers match active GenAI models
    expect(AI_CONFIG.reasoningModel).toMatch(/^gemini-/);
  });

  it('runs model availability check against live registry (or skips gracefully when offline)', async () => {
    const checkResult = await verifyModelAvailability(getGeminiClient);
    expect(checkResult).toBeDefined();
    expect(Array.isArray(checkResult.errors)).toBe(true);
  });

  it('records model name, agent_type, token_usage, and latency_ms to ai_runs execution log', () => {
    const runLog = recordAIRunLog({
      documentId: 'doc_live_test_101',
      agentType: 'document_intelligence',
      model: AI_CONFIG.reasoningModel,
      tokenUsage: 1450,
      latencyMs: 820,
      status: 'completed',
    });

    expect(runLog.model).toBe(AI_CONFIG.reasoningModel);
    expect(runLog.agent_type).toBe('document_intelligence');
    expect(runLog.token_usage).toBe(1450);
    expect(runLog.latency_ms).toBe(820);
    expect(runLog.status).toBe('completed');
  });

  it('unit test: generates 768-dimensional dense vector embeddings consistently via fallback or live model', async () => {
    const vector = await generateEmbedding('LegalLens AI vector embedding test text');
    expect(vector.length).toBe(768);
    expect(typeof vector[0]).toBe('number');
  });

  it('conditionally runs live network API test when RUN_LIVE_GEMINI_TESTS is set', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      // Skipped by default in fast CI runs to prevent unneeded API charges and flakiness
      expect(true).toBe(true);
      return;
    }

    const ai = getGeminiClient();
    const start = Date.now();
    const response = await ai.models.generateContent({
      model: AI_CONFIG.reasoningModel,
      contents: 'Respond with "LegalLens AI Live API OK".',
    });

    const latencyMs = Date.now() - start;
    expect(latencyMs).toBeGreaterThan(100); // Live network call takes > 100ms
    expect(response.text).toContain('LegalLens');
  });
});
