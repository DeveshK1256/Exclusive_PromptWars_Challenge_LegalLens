import { TimelineEvent } from '../../types/database';
import { ExtractedSection } from '../extraction/types';
import { ExtractedEntityItem, ExtractedClauseItem } from '../intelligence/types';

export type TimelineEventType =
  | 'effective_date'
  | 'expiration_date'
  | 'renewal_deadline'
  | 'notice_deadline'
  | 'payment_due_date'
  | 'milestone';

export interface TimelineExtractionOptions {
  documentId: string;
  documentVersionId: string;
  rawText: string;
  sections?: ExtractedSection[];
  entities?: ExtractedEntityItem[];
  clauses?: ExtractedClauseItem[];
}

export interface TimelineResult {
  documentId: string;
  documentVersionId: string;
  events: TimelineEvent[];
  upcomingDeadlinesCount: number;
}
