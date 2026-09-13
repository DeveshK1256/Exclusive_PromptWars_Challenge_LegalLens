import { SeverityLevel, FindingKind, FindingType } from '@/types/database';

export interface XRayFindingCard {
  id: string;
  document_id: string;
  document_version_id: string;
  clause_id: string | null;
  category: string; // e.g. 'Termination & Notice', 'Financial Obligations', 'Liability & Risk', 'Confidentiality', 'Dispute Resolution'
  severity: SeverityLevel; // green, yellow, orange, red
  finding_kind: FindingKind; // informational, action_required, deadline
  title: string;
  description: string;
  finding_type: FindingType; // fact, ai_interpretation, general_information, recommendation
  confidence: number; // Float 0.0 - 1.0
  source_reference: string; // Line/section/page quotation
  created_at: string;
}

export interface LegalXRayOverview {
  document_id: string;
  document_version_id: string;
  high_impact_count: number; // 🔴 red
  attention_area_count: number; // 🟠 orange
  important_count: number; // 🟡 yellow
  general_count: number; // 🟢 green
  deadlines_count: number;
  action_items_count: number;
  findings: XRayFindingCard[];
}
