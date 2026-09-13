import { ActionPlan, ActionItem, LawyerQuestion } from '../../types/database';
import { ExtractedClauseItem } from '../intelligence/types';
import { XRayFindingCard } from '../xray/types';

export interface ActionPlanOptions {
  documentId: string;
  documentVersionId: string;
  rawText: string;
  clauses?: ExtractedClauseItem[];
  findings?: XRayFindingCard[];
}

export interface BeforeYouSignItem {
  id: string;
  title: string;
  recommendation: string;
  severity: 'yellow' | 'orange' | 'red';
  sourceReference: string;
  relatedFindingId?: string;
  checked: boolean;
}

// UI view model maintaining 1:1 schema alignment with ActionItem DB entity
export interface ActionTaskCard {
  id: string;
  action_plan_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  related_finding_id: string | null;
  source_reference: string;
  created_at: string;
  updated_at: string;
}

// UI view model maintaining 1:1 schema alignment with LawyerQuestion DB entity
export interface LawyerQuestionCard {
  id: string;
  document_id: string;
  question: string;
  reason: string;
  related_finding_id: string | null;
  priority: 'low' | 'medium' | 'high';
  source_reference: string;
  created_at: string;
}

export interface ActionPlanResult {
  actionPlan: ActionPlan;
  checklist: BeforeYouSignItem[];
  lawyerQuestions: LawyerQuestionCard[];
  actionItems: ActionTaskCard[];
}
