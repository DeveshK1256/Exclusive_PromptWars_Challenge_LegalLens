export type ComparisonStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ComparisonSeverityLevel = 'green' | 'yellow' | 'orange' | 'red';
export type ComparisonFindingKind = 'informational' | 'action_required' | 'deadline';

export interface ComparisonRecord {
  id: string;
  user_id: string;
  document_a_id: string;
  document_b_id: string;
  document_a_version_id?: string;
  document_b_version_id?: string;
  status: ComparisonStatus;
  created_at: string;
}

export interface ComparisonFinding {
  id: string;
  comparison_id: string;
  category: string;
  title: string;
  document_a_value: string;
  document_b_value: string;
  difference_summary: string;
  severity_level: ComparisonSeverityLevel; // Decision 11
  finding_kind: ComparisonFindingKind;     // Decision 11
  confidence: number;                       // Decision 12: float 0.0 - 1.0
  source_reference_a: string;              // Quote/ref in Doc A
  source_reference_b: string;              // Quote/ref in Doc B
  created_at: string;
}

export interface ContractComparisonResult {
  comparison: ComparisonRecord;
  findings: ComparisonFinding[];
  similaritiesCount: number;
  differencesCount: number;
  questionsForLawyer: string[];
  recommendedActionItems: string[];
  modelUsed: string;
  tokenUsage: number;
}

export interface ComparisonOptions {
  comparisonId: string;
  userId: string;
  documentAId: string;
  documentBId: string;
  rawTextA: string;
  rawTextB: string;
  titleA?: string;
  titleB?: string;
  isLiveTest?: boolean;
}
