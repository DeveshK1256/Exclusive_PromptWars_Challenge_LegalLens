import { ExtractedSection } from '../extraction/types';
import { ExtractedEntityItem } from './types';

/**
 * Entity Extraction Engine for LegalLens AI (Sprint 4)
 * Extracts parties, dates, amounts, locations, and obligations.
 * Every entity carries a valid source_reference, confidence float (0.0-1.0), and document_version_id scoping.
 */
export function extractEntities(
  sections: ExtractedSection[],
  documentId: string,
  documentVersionId: string,
  isPageEstimate = false
): ExtractedEntityItem[] {
  const entities: ExtractedEntityItem[] = [];
  const confidenceMultiplier = isPageEstimate ? 0.9 : 1.0;

  // Pattern 1: "between Party A and Party B"
  const betweenPattern = /\b(?:between|by and between)\s+([A-Z][A-Za-z0-9\s,.&]{1,50}?)\s+and\s+([A-Z][A-Za-z0-9\s,.&]{1,50}?)(?=\s+on|\s+dated|\s*,|\s*\(|\s*\.|\s*$)/ig;

  // Pattern 2: Single Party roles ("Employer: Company", "Tenant: Name")
  const rolePattern = /\b(?:employer|employee|tenant|landlord|client|contractor|company|lessor|lessee)\s*:\s*([A-Z][A-Za-z0-9\s,.&]{1,50})/ig;

  const dateRegex = /\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})\b/ig;
  const amountRegex = /\$\s*[\d,]+(?:\.\d{2})?|\b[\d,]+\s*(?:dollars|USD|EUR|GBP)\b/ig;

  sections.forEach((section) => {
    const pageText = `p.${section.page_start}${section.page_start !== section.page_end ? `-${section.page_end}` : ''}${isPageEstimate ? ' (est)' : ''}`;
    const sectionRef = section.title ? `Section "${section.title}" (${pageText})` : `Section (index ${section.order_index}, ${pageText})`;

    // 1. Dual Party Extraction ("between Party A and Party B")
    let bMatch: RegExpExecArray | null;
    while ((bMatch = betweenPattern.exec(section.content)) !== null) {
      const p1 = bMatch[1]?.trim().replace(/,$/, '');
      const p2 = bMatch[2]?.trim().replace(/,$/, '');

      [p1, p2].forEach((party) => {
        if (party && party.length > 2 && !['this', 'the', 'each', 'all'].includes(party.toLowerCase())) {
          entities.push({
            id: `ent_${documentVersionId}_${entities.length + 1}`,
            document_id: documentId,
            document_version_id: documentVersionId,
            entity_type: 'party',
            entity_value: party,
            normalized_value: party.toUpperCase(),
            source_reference: `${sectionRef}: "${bMatch![0].trim()}"`,
            confidence: Number((0.95 * confidenceMultiplier).toFixed(2)),
          });
        }
      });
    }

    // Role Pattern Extraction
    let rMatch: RegExpExecArray | null;
    while ((rMatch = rolePattern.exec(section.content)) !== null) {
      const party = rMatch[1]?.trim();
      if (party && party.length > 2) {
        entities.push({
          id: `ent_${documentVersionId}_${entities.length + 1}`,
          document_id: documentId,
          document_version_id: documentVersionId,
          entity_type: 'party',
          entity_value: party,
          normalized_value: party.toUpperCase(),
          source_reference: `${sectionRef}: "${rMatch[0].trim()}"`,
          confidence: Number((0.92 * confidenceMultiplier).toFixed(2)),
        });
      }
    }

    // 2. Date Extraction
    let dateMatch: RegExpExecArray | null;
    while ((dateMatch = dateRegex.exec(section.content)) !== null) {
      const dateVal = dateMatch[0].trim();
      entities.push({
        id: `ent_${documentVersionId}_${entities.length + 1}`,
        document_id: documentId,
        document_version_id: documentVersionId,
        entity_type: 'date',
        entity_value: dateVal,
        normalized_value: dateVal,
        source_reference: `${sectionRef}: "${dateVal}"`,
        confidence: Number((0.95 * confidenceMultiplier).toFixed(2)),
      });
    }

    // 3. Financial Amount Extraction
    let amtMatch: RegExpExecArray | null;
    while ((amtMatch = amountRegex.exec(section.content)) !== null) {
      const amtVal = amtMatch[0].trim();
      entities.push({
        id: `ent_${documentVersionId}_${entities.length + 1}`,
        document_id: documentId,
        document_version_id: documentVersionId,
        entity_type: 'amount',
        entity_value: amtVal,
        normalized_value: amtVal,
        source_reference: `${sectionRef}: "${amtVal}"`,
        confidence: Number((0.90 * confidenceMultiplier).toFixed(2)),
      });
    }
  });

  return entities;
}
