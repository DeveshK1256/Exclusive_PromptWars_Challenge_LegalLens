// LegalLens AI Model Configuration (Decision 2 — Model Config Abstraction)
// Central single source of truth for all Gemini models and embedding settings.

export const AI_CONFIG = {
  // Reasoning & Classification Model (Document Intelligence, Legal X-Ray, Simplification, Q&A)
  reasoningModel: process.env.GEMINI_REASONING_MODEL || 'gemini-3.1-pro-preview',

  // Fast Classification Model for lightweight checks
  fastModel: process.env.GEMINI_FAST_MODEL || 'gemini-3.6-flash',

  // Vector Embedding Model (GA replacement for text-embedding-004)
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',

  // Fixed Vector Embedding Dimensionality (stored consistently)
  embeddingDimensions: 768,

  // Token Budget Alert Threshold per Document
  perDocumentTokenAlertLimit: 500000,
};

/**
 * Validates configured model strings against live Gemini API model registry.
 * Fails loudly if a configured model is missing or unsupported when an API key is present.
 */
export async function verifyModelAvailability(getGeminiClient: () => any): Promise<{
  valid: boolean;
  activeModels: string[];
  errors: string[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_key') {
    return {
      valid: true,
      activeModels: [],
      errors: ['GEMINI_API_KEY is unset or dummy; live model verification skipped in offline mode.'],
    };
  }

  const errors: string[] = [];
  const activeModels: string[] = [];

  try {
    const ai = getGeminiClient();
    const modelsResponse = await ai.models.list({});
    for await (const model of modelsResponse) {
      if (model.name) activeModels.push(model.name.replace('models/', ''));
    }

    const configuredModels = [
      { key: 'reasoningModel', name: AI_CONFIG.reasoningModel },
      { key: 'fastModel', name: AI_CONFIG.fastModel },
      { key: 'embeddingModel', name: AI_CONFIG.embeddingModel },
    ];

    for (const { key, name } of configuredModels) {
      const isAvailable = activeModels.some(
        (m) => m === name || m.includes(name) || name.includes(m)
      );
      if (!isAvailable) {
        errors.push(`Configured ${key} '${name}' was not found in live API model list.`);
      }
    }
  } catch (err: any) {
    errors.push(`Failed to reach Gemini list-models endpoint: ${err?.message || String(err)}`);
  }

  return {
    valid: errors.length === 0,
    activeModels,
    errors,
  };
}
