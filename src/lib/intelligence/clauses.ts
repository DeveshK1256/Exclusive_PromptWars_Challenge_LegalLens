import { ExtractedSection } from '../extraction/types';
import { ExtractedClauseItem } from './types';
import { SeverityLevel, FindingKind } from '@/types/database';

/**
 * Clause Classification Engine for LegalLens AI (Sprint 4)
 * Classifies clauses into distinct severity_level (green/yellow/orange/red)
 * AND finding_kind (informational/action_required/deadline) as SEPARATE fields.
 * Every clause carries a valid source_reference, confidence float (0.0-1.0), and document_version_id.
 */
export function classifyClauses(
  sections: ExtractedSection[],
  documentId: string,
  documentVersionId: string,
  isPageEstimate = false
): ExtractedClauseItem[] {
  const clauses: ExtractedClauseItem[] = [];
  const confidenceMultiplier = isPageEstimate ? 0.9 : 1.0;

  sections.forEach((section) => {
    const pageText = `p.${section.page_start}${section.page_start !== section.page_end ? `-${section.page_end}` : ''}${isPageEstimate ? ' (est)' : ''}`;
    const sectionRef = section.title ? `Section "${section.title}" (${pageText})` : `Section (index ${section.order_index}, ${pageText})`;

    const textLower = section.content.toLowerCase();
    const titleLower = (section.title || '').toLowerCase();

    // Determine Clause Type
    let clauseType = 'general_terms';
    let severityLevel: SeverityLevel = 'green';
    let findingKind: FindingKind = 'informational';
    let explanation = 'Standard general provision in the agreement.';

    if (titleLower.includes('termination') || textLower.includes('terminate') || textLower.includes('cancellation')) {
      clauseType = 'termination';
      severityLevel = textLower.includes('immediate') || textLower.includes('without cause') ? 'red' : 'orange';
      findingKind = textLower.includes('notice') || textLower.includes('days') ? 'deadline' : 'action_required';
      explanation = 'Specifies conditions under which either party can cancel or terminate this agreement.';
    } else if (titleLower.includes('payment') || titleLower.includes('compensation') || textLower.includes('fee') || textLower.includes('salary')) {
      clauseType = 'payment_terms';
      severityLevel = textLower.includes('penalty') || textLower.includes('interest') ? 'orange' : 'yellow';
      findingKind = textLower.includes('due date') || textLower.includes('within') ? 'deadline' : 'informational';
      explanation = 'Outlines financial obligations, payment schedules, and associated compensation terms.';
    } else if (titleLower.includes('confidential') || textLower.includes('nondisclosure') || textLower.includes('secret')) {
      clauseType = 'confidentiality';
      severityLevel = 'yellow';
      findingKind = 'action_required';
      explanation = 'Requires parties to protect sensitive proprietary information and refrain from unauthorized disclosure.';
    } else if (titleLower.includes('liability') || textLower.includes('indemnify') || textLower.includes('hold harmless')) {
      clauseType = 'liability_indemnification';
      severityLevel = textLower.includes('unlimited') || textLower.includes('waive') ? 'red' : 'orange';
      findingKind = 'action_required';
      explanation = 'Allocates financial responsibility and legal risk between the parties in case of disputes or damages.';
    } else if (titleLower.includes('governing law') || titleLower.includes('dispute') || textLower.includes('arbitration')) {
      clauseType = 'dispute_resolution';
      severityLevel = textLower.includes('arbitration') ? 'orange' : 'yellow';
      findingKind = 'informational';
      explanation = 'Establishes jurisdiction and procedures for resolving legal disagreements.';
    } else if (titleLower.includes('definition') || section.section_type === 'definitions') {
      clauseType = 'definitions';
      severityLevel = 'green';
      findingKind = 'informational';
      explanation = 'Defines key terms used throughout the legal document.';
    }

    const excerpt = section.content.length > 150 ? section.content.substring(0, 150) + '...' : section.content;

    clauses.push({
      id: `cls_${documentVersionId}_${clauses.length + 1}`,
      document_id: documentId,
      document_version_id: documentVersionId,
      section_id: section.id,
      clause_type: clauseType,
      title: section.title || `Clause ${clauses.length + 1}`,
      original_text: section.content,
      plain_explanation: explanation,
      severity_level: severityLevel,
      finding_kind: findingKind,
      confidence: Number((0.92 * confidenceMultiplier).toFixed(2)),
      source_reference: `${sectionRef}: "${excerpt.replace(/\n/g, ' ')}"`,
    });
  });

  return clauses;
}
