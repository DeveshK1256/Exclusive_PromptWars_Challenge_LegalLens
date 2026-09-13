import { DocumentType } from '@/types/database';
import { ExtractedEntityItem, ExtractedClauseItem, ExtractedChunkItem, DocumentManifest } from './types';

/**
 * Builds document intelligence manifest summarizing document structure, parties, dates, and token count.
 */
export function buildDocumentManifest(
  documentId: string,
  documentVersionId: string,
  detectedDocumentType: DocumentType,
  entities: ExtractedEntityItem[],
  clauses: ExtractedClauseItem[],
  chunks: ExtractedChunkItem[]
): DocumentManifest {
  const parties = Array.from(
    new Set(
      entities
        .filter((e) => e.entity_type === 'party')
        .map((e) => e.entity_value)
    )
  );

  const importantDates = Array.from(
    new Set(
      entities
        .filter((e) => e.entity_type === 'date')
        .map((e) => e.entity_value)
    )
  );

  const totalTokens = chunks.reduce((sum, c) => sum + c.token_count, 0);

  return {
    document_id: documentId,
    document_version_id: documentVersionId,
    document_type: detectedDocumentType,
    parties,
    important_dates: importantDates,
    total_tokens: totalTokens,
    sections_count: new Set(chunks.map((c) => c.section_id)).size,
    clauses_count: clauses.length,
    entities_count: entities.length,
    chunks_count: chunks.length,
    created_at: new Date().toISOString(),
  };
}
