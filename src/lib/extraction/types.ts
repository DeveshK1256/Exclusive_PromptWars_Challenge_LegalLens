// LegalLens AI Document Extraction Types (Sprint 3 & Section 2.3)

export interface ExtractedSection {
  id: string;
  title: string | null;
  section_type: string; // e.g. 'article', 'section', 'clause', 'paragraph', 'header'
  order_index: number;
  content: string;
  page_start: number;
  page_end: number;
  is_page_estimate?: boolean;
}

export interface ExtractionMetadata {
  pageCount: number;
  characterCount: number;
  tokenCount: number;
  isPageEstimate: boolean; // True for DOCX/TXT (heuristic estimation), False for PDF (native page boundaries)
  title?: string | null;
  author?: string | null;
  creationDate?: string | null;
  modificationDate?: string | null;
  documentTypeDetected?: string;
}

export interface ExtractionResult {
  status: 'completed' | 'failed';
  rawText: string;
  normalizedText: string;
  sections: ExtractedSection[];
  metadata: ExtractionMetadata;
  error?: string;
}
