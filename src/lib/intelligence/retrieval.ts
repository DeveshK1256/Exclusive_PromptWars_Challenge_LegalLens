import { ExtractedChunkItem } from './types';
import { generateEmbedding, cosineSimilarity } from '../ai/embeddings';

export interface RetrievalResult {
  chunk: ExtractedChunkItem;
  relevanceScore: number; // Float 0.0 - 1.0
}

/**
 * Vector Retrieval Engine for LegalLens AI (Sprint 4)
 * Computes dense vector embeddings and cosine similarity scores for grounded Q&A.
 */
export async function retrieveRelevantChunks(
  query: string,
  chunks: ExtractedChunkItem[],
  topK = 3,
  minScore = 0.0
): Promise<RetrievalResult[]> {
  if (!query || chunks.length === 0) {
    return [];
  }

  const STOP_WORDS = new Set([
    'what', 'where', 'when', 'which', 'that', 'this', 'from', 'have', 'with', 'will', 'would', 'should', 'could', 'about', 'does', 'your', 'their', 'them',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'at', 'by', 'it', 'its', 'as', 'be'
  ]);

  // Generate vector embedding for user query
  const queryVector = await generateEmbedding(query);
  const queryWords = new Set(
    query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );

  // Compute cosine similarity for each chunk
  const scoredResults = await Promise.all(
    chunks.map(async (chunk) => {
      const chunkVector = await generateEmbedding(chunk.content);
      const similarity = cosineSimilarity(queryVector, chunkVector);

      // Compute keyword overlap ratio with word stem matching (e.g., terminate/termination)
      const chunkTextLower = chunk.content.toLowerCase();
      let matchCount = 0;
      queryWords.forEach((qw) => {
        const stem = qw.length > 4 ? qw.substring(0, 4) : qw;
        if (chunkTextLower.includes(stem)) matchCount++;
      });

      const keywordRatio = queryWords.size > 0 ? matchCount / queryWords.size : 0;

      // If query has non-stop words but ZERO match in chunk, penalize score to prevent false 50%+ similarity on completely unrelated topics
      let combinedScore = similarity;
      if (queryWords.size > 0) {
        if (matchCount === 0) {
          combinedScore = similarity * 0.2; // Penalize unrelated topics below 0.50 threshold
        } else {
          combinedScore = Math.max(similarity, similarity + keywordRatio * 0.5);
        }
      }

      // Relevance score float 0.0 - 1.0
      const score = Number(Math.max(0.0, Math.min(1.0, combinedScore)).toFixed(2));

      return {
        chunk,
        relevanceScore: score,
      };
    })
  );

  // Filter by minScore and sort by vector relevance score descending
  const filtered = scoredResults.filter((r) => r.relevanceScore >= minScore);
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return filtered.slice(0, topK);
}
