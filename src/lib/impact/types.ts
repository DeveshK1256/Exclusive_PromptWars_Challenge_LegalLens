export type ContextRole =
  | 'Employee'
  | 'Tenant'
  | 'Freelancer'
  | 'Business owner'
  | 'Consumer'
  | 'Student'
  | 'Other';

export interface PersonalImpactItem {
  finding_id: string;
  title: string;
  category: string;
  severity_level: 'green' | 'yellow' | 'orange' | 'red';
  finding_kind: 'informational' | 'action_required' | 'deadline';
  what_this_means_for_you: string;
  practical_considerations: string[];
  source_reference: string;
  confidence: number; // Decision 12: Float 0.0 - 1.0 per item
}

export interface PersonalImpactResult {
  document_id: string;
  document_version_id?: string;
  context_role: ContextRole;
  impactSummary: string;
  roleSpecificImpacts: PersonalImpactItem[];
  questionsToAsk: string[];
  confidence: number;
  modelUsed: string;
  analysis_mode: 'ai' | 'fallback';
  degraded: boolean;
  tokenUsage: number;
}

export interface PersonalImpactOptions {
  documentId: string;
  documentVersionId?: string;
  contextRole: ContextRole;
  findings: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity_level: 'green' | 'yellow' | 'orange' | 'red';
    finding_kind: 'informational' | 'action_required' | 'deadline';
    source_reference: string;
    confidence?: number;
  }>;
  jurisdiction?: string | null;
  isLiveTest?: boolean;
}
