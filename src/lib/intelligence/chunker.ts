import { ExtractedSection } from '../extraction/types';
import { ExtractedChunkItem } from './types';
import { estimateTokenCount } from '../extraction/normalizer';

/**
 * Creates semantic chunks from document sections (~400-800 tokens per chunk)
 * Scoped to document_version_id (Decision 13)
 */
export function chunkSections(
  sections: ExtractedSection[],
  documentId: string,
  documentVersionId: string,
  targetChunkTokens = 500
): ExtractedChunkItem[] {
  const chunks: ExtractedChunkItem[] = [];
  let globalChunkIndex = 0;

  sections.forEach((section) => {
    const sectionText = section.content;
    const estimatedTokens = estimateTokenCount(sectionText);

    if (estimatedTokens <= targetChunkTokens || !sectionText.includes('\n')) {
      // Section fits cleanly in one chunk
      chunks.push({
        id: `chunk_${documentVersionId}_${++globalChunkIndex}`,
        document_id: documentId,
        document_version_id: documentVersionId,
        section_id: section.id,
        content: sectionText,
        chunk_index: globalChunkIndex,
        embedding_reference: `emb_${documentVersionId}_${globalChunkIndex}`,
        page_start: section.page_start,
        page_end: section.page_end,
        token_count: estimatedTokens,
      });
    } else {
      // Split section by paragraphs or sentences
      const paragraphs = sectionText.split(/\n\s*\n/);
      let currentChunkText: string[] = [];
      let currentChunkTokenCount = 0;

      paragraphs.forEach((paragraph) => {
        const paragraphTokens = estimateTokenCount(paragraph);

        if (currentChunkTokenCount + paragraphTokens > targetChunkTokens && currentChunkText.length > 0) {
          const chunkContent = currentChunkText.join('\n\n').trim();
          chunks.push({
            id: `chunk_${documentVersionId}_${++globalChunkIndex}`,
            document_id: documentId,
            document_version_id: documentVersionId,
            section_id: section.id,
            content: chunkContent,
            chunk_index: globalChunkIndex,
            embedding_reference: `emb_${documentVersionId}_${globalChunkIndex}`,
            page_start: section.page_start,
            page_end: section.page_end,
            token_count: estimateTokenCount(chunkContent),
          });
          currentChunkText = [];
          currentChunkTokenCount = 0;
        }

        currentChunkText.push(paragraph);
        currentChunkTokenCount += paragraphTokens;
      });

      if (currentChunkText.length > 0) {
        const chunkContent = currentChunkText.join('\n\n').trim();
        chunks.push({
          id: `chunk_${documentVersionId}_${++globalChunkIndex}`,
          document_id: documentId,
          document_version_id: documentVersionId,
          section_id: section.id,
          content: chunkContent,
          chunk_index: globalChunkIndex,
          embedding_reference: `emb_${documentVersionId}_${globalChunkIndex}`,
          page_start: section.page_start,
          page_end: section.page_end,
          token_count: estimateTokenCount(chunkContent),
        });
      }
    }
  });

  return chunks;
}
