import { SeverityLevel, FindingKind, DocumentType } from '@/types/database';
import { ExtractedSection } from '../extraction/types';

export interface ExtractedEntityItem {
  id: string;
  document_id: string;
  document_version_id: string;
  entity_type: 'party' | 'organization' | 'person' | 'date' | 'amount' | 'location' | 'obligation';
  entity_value: string;
  normalized_value: string;
  source_reference: string; // Line/section/page citation
  confidence: number; // Float 0.0 - 1.0
}

export interface ExtractedClauseItem {
  id: string;
  document_id: string;
  document_version_id: string;
  section_id: string | null;
  clause_type: string;
  title: string;
  original_text: string;
  plain_explanation: string;
  severity_level: SeverityLevel; // green, yellow, orange, red
  finding_kind: FindingKind; // informational, action_required, deadline
  confidence: number; // Float 0.0 - 1.0
  source_reference: string;
}

export interface ExtractedChunkItem {
  id: string;
  document_id: string;
  document_version_id: string;
  section_id: string | null;
  content: string;
  chunk_index: number;
  embedding_reference: string;
  page_start: number;
  page_end: number;
  token_count: number;
}

export interface DocumentManifest {
  document_id: string;
  document_version_id: string;
  document_type: DocumentType;
  parties: string[];
  important_dates: string[];
  total_tokens: number;
  sections_count: number;
  clauses_count: number;
  entities_count: number;
  chunks_count: number;
  created_at: string;
}
