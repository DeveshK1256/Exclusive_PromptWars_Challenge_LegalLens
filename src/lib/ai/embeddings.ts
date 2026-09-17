import { getGeminiClient } from './gemini';
import { AI_CONFIG } from './config';

/**
 * Computes cosine similarity between two vector embedding arrays
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory vector embedding cache for high-efficiency retrieval
const embeddingCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 500;

/**
 * Generates vector embedding array for text using Gemini text-embedding model
 * Consumes AI_CONFIG.embeddingModel and enforces AI_CONFIG.embeddingDimensions (768)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cacheKey = (text || '').trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isVitest = process.env.VITEST === 'true';
  const isLiveTestMode = process.env.RUN_LIVE_GEMINI_TESTS === 'true';
  const shouldCallGemini = Boolean(apiKey && apiKey !== 'dummy_gemini_key' && (!isVitest || isLiveTestMode));

  let vectorResult: number[];

  if (!shouldCallGemini) {
    vectorResult = generateHeuristicVector(text, AI_CONFIG.embeddingDimensions);
  } else {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.embedContent({
        model: AI_CONFIG.embeddingModel,
        contents: text,
      });

      const resObj = response as unknown as {
        embedding?: { values: number[] };
        embeddings?: Array<{ values: number[] }>;
      };

      if (resObj.embedding?.values) {
        vectorResult = resObj.embedding.values.slice(0, AI_CONFIG.embeddingDimensions);
      } else if (resObj.embeddings?.[0]?.values) {
        vectorResult = resObj.embeddings[0].values.slice(0, AI_CONFIG.embeddingDimensions);
      } else {
        vectorResult = generateHeuristicVector(text, AI_CONFIG.embeddingDimensions);
      }
    } catch (err) {
      if (process.env.RUN_LIVE_GEMINI_TESTS === 'true') {
        throw err;
      }
      vectorResult = generateHeuristicVector(text, AI_CONFIG.embeddingDimensions);
    }
  }

  // Cache result for O(1) retrieval
  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = embeddingCache.keys().next().value;
    if (oldestKey) embeddingCache.delete(oldestKey);
  }
  embeddingCache.set(cacheKey, vectorResult);

  return vectorResult;
}

function generateHeuristicVector(text: string = '', dimensions = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = (text || '').toLowerCase().split(/\W+/);

  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  });

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    return vector.map((val) => Number((val / norm).toFixed(4)));
  }
  return vector;
}
