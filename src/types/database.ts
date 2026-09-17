// LegalLens AI Database Types (Section 9.1 & Decisions 6/7/10/11/12/13)

export type DocumentType =
  | 'employment_contract'
  | 'nda'
  | 'rental_agreement'
  | 'service_agreement'
  | 'loan_document'
  | 'policy_document'
  | 'terms_of_service'
  | 'other';

export type SeverityLevel = 'green' | 'yellow' | 'orange' | 'red';
export type FindingKind = 'informational' | 'action_required' | 'deadline';
export type FindingType = 'fact' | 'ai_interpretation' | 'general_information' | 'recommendation';
export type SafetyStatus = 'passed' | 'flagged_for_review' | 'blocked';

export type ContextRole =
  | 'Employee'
  | 'Tenant'
  | 'Freelancer'
  | 'Business owner'
  | 'Consumer'
  | 'Student'
  | 'Other';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  preferred_language: string | null;
  context_role: ContextRole | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  storage_path: string;
  document_type: DocumentType;
  jurisdiction: string | null;
  status: 'uploaded' | 'validating' | 'extracting' | 'analyzing' | 'completed' | 'failed';
  deleted_at: string | null;
  retention_expires_at: string | null;
  created_at: string;
  updated_at: string;
  raw_text?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  created_at: string;
}

export interface Clause {
  id: string;
  document_id: string;
  document_version_id: string;
  section_id: string | null;
  clause_type: string;
  title: string;
  original_text: string;
  plain_explanation: string;
  severity_level: SeverityLevel;
  finding_kind: FindingKind;
  confidence: number; // 0.0 - 1.0
  source_reference: string;
  created_at: string;
}

export interface Finding {
  id: string;
  document_id: string;
  document_version_id: string;
  clause_id: string | null;
  category: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  finding_type: FindingType;
  confidence: number; // 0.0 - 1.0
  source_reference: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  document_id: string;
  document_version_id: string;
  title: string;
  event_date: string | null;
  event_type: string;
  description: string;
  notice_window?: string | null;
  source_reference: string;
  confidence: number; // 0.0 - 1.0
  created_at: string;
}

export interface TimelineEventDismissal {
  id: string;
  user_id: string;
  timeline_event_id: string;
  dismissed_at: string;
}

export interface DeadlineAlert {
  event: TimelineEvent;
  documentTitle: string;
  daysRemaining: number;
  urgency: 'overdue' | 'urgent_7d' | 'upcoming_30d';
}

export interface Comparison {
  id: string;
  user_id: string;
  document_a_id: string;
  document_b_id: string;
  status: 'pending' | 'comparing' | 'completed' | 'failed';
  created_at: string;
}

export interface ComparisonFinding {
  id: string;
  comparison_id: string;
  category: string;
  document_a_value: string | null;
  document_b_value: string | null;
  difference_summary: string;
  severity_level: SeverityLevel;
  finding_kind: FindingKind;
  confidence: number; // 0.0 - 1.0
  created_at: string;
}

export interface ActionPlan {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  action_plan_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  related_finding_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LawyerQuestion {
  id: string;
  document_id: string;
  question: string;
  reason: string;
  related_finding_id: string | null;
  priority: string;
  created_at: string;
}

export type ComplexityLevel = 'very_simple' | 'student' | 'professional' | 'legal_terminology';

export interface DocumentSummary {
  id: string;
  document_id: string;
  document_version_id: string;
  complexity_level: ComplexityLevel;
  summary_text: string;
  key_takeaways: string[];
  obligations_summary: string;
  confidence: number; // 0.0 - 1.0
  created_at: string;
}

export interface GlossaryTerm {
  id: string;
  document_id: string;
  document_version_id: string;
  term: string;
  plain_language_definition: string;
  contextual_meaning: string;
  source_reference: string;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  document_id: string;
  question: string;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer: string;
  confidence: number; // 0.0 - 1.0
  safety_status: SafetyStatus;
  created_at: string;
}

export interface AnswerSource {
  id: string;
  answer_id: string;
  chunk_id: string;
  relevance_score: number; // 0.0 - 1.0
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  actor_type: 'user' | 'system' | 'agent';
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type { SharedLink, SharedLinkAuditRecord } from '@/lib/sharing/shareStorage';
export type { DiffHunk, DocumentDiffResult } from '@/lib/diff/documentDiff';
