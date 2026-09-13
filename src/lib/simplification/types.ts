import { ComplexityLevel, DocumentSummary, GlossaryTerm } from '../../types/database';
import { ExtractedClauseItem } from '../intelligence/types';
import { XRayFindingCard } from '../xray/types';

export interface SimplificationOptions {
  documentId: string;
  documentVersionId: string;
  rawText: string;
  complexityLevel?: ComplexityLevel;
  clauses?: ExtractedClauseItem[];
  findings?: XRayFindingCard[];
}

export interface SimplificationResult {
  summary: DocumentSummary;
  glossary: GlossaryTerm[];
  allSummaries: Record<ComplexityLevel, DocumentSummary>;
}
