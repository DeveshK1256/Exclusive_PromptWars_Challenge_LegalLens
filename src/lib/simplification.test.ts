import { describe, it, expect } from 'vitest';
import {
  runSimplificationAgent,
  synthesizeObligationsFromFindings,
  auditSummaryFactualFidelity,
  extractKeyTermsGlossary,
} from './simplification/simplificationAgent';
import { ExtractedClauseItem } from './intelligence/types';
import { XRayFindingCard } from './xray/types';

describe('Sprint 6 — Multi-Level Simplification & Glossary Test Suite', { timeout: 60000 }, () => {
  const docId = 'doc_simp_test_101';
  const verId = 'ver_simp_v1';

  const rawText = `MUTUAL NON-DISCLOSURE AGREEMENT
This Non-Disclosure Agreement is executed between Acme Corp and Beta LLC on January 15, 2026.
SECTION 1: CONFIDENTIAL INFORMATION
The receiving party agrees to hold in confidence all proprietary technical and trade secret information.
SECTION 2: TERMINATION & NOTICE
This agreement shall terminate on December 31, 2028 or upon 30 days written notice by either party.
SECTION 3: INDEMNIFICATION & GOVERNING LAW
Each party agrees to indemnify the other against third-party claims. This agreement shall be governed by California law.`;

  const mockClauses: ExtractedClauseItem[] = [
    {
      id: 'c1',
      document_id: docId,
      document_version_id: verId,
      section_id: 's2',
      clause_type: 'termination',
      title: 'Termination Notice Requirement',
      original_text: 'This agreement shall terminate upon 30 days written notice by either party.',
      plain_explanation: 'Either party can cancel by providing 30 days written warning.',
      severity_level: 'yellow',
      finding_kind: 'action_required',
      confidence: 0.95,
      source_reference: 'Page 1, Section 2',
    },
  ];

  const mockFindings: XRayFindingCard[] = [
    {
      id: 'f1',
      document_id: docId,
      document_version_id: verId,
      clause_id: 'c1',
      category: 'Termination & Cancellation',
      severity: 'yellow',
      finding_kind: 'action_required',
      title: '30-Day Cancellation Notice Required',
      description: 'You must provide written notice 30 days prior to ending the contract.',
      finding_type: 'fact',
      confidence: 0.95,
      source_reference: 'Page 1, Section 2',
      created_at: new Date().toISOString(),
    },
  ];

  it('generates 4 distinct complexity levels (very_simple, student, professional, legal_terminology)', async () => {
    const result = await runSimplificationAgent({
      documentId: docId,
      documentVersionId: verId,
      rawText,
      clauses: mockClauses,
      findings: mockFindings,
    });

    expect(result.allSummaries.very_simple).toBeDefined();
    expect(result.allSummaries.student).toBeDefined();
    expect(result.allSummaries.professional).toBeDefined();
    expect(result.allSummaries.legal_terminology).toBeDefined();

    expect(result.allSummaries.very_simple.complexity_level).toBe('very_simple');
    expect(result.allSummaries.legal_terminology.complexity_level).toBe('legal_terminology');
  });

  it('verifies Obligations Summary is derived directly from validated clauses/findings rows', () => {
    const synthesized = synthesizeObligationsFromFindings(mockClauses, mockFindings, rawText);

    expect(synthesized).toContain('30-Day Cancellation Notice Required');
    expect(synthesized).toContain('Page 1, Section 2');
    expect(synthesized).not.toBe('');
  });

  it('enforces Factual Summary Auditing: flags ungrounded numeric claims absent from source text', () => {
    const textWithFabricatedAmount = 'The employee will receive an annual salary of $950,000 upon 30 days written notice.';
    const audited = auditSummaryFactualFidelity(textWithFabricatedAmount, rawText);

    // $950,000 is absent from rawText, so it must be sanitized out
    expect(audited).not.toContain('$950,000');
    expect(audited).toContain('[stated term in text]');
  });

  it('extracts Key Terms Glossary with traceable source_reference citations', () => {
    const glossary = extractKeyTermsGlossary(rawText, docId, verId, mockClauses);

    expect(glossary.length).toBeGreaterThan(0);
    const termNames = glossary.map((g) => g.term);
    expect(termNames).toContain('Indemnification');
    expect(termNames).toContain('Termination Notice');

    glossary.forEach((item) => {
      expect(item.source_reference).toBeDefined();
      expect(item.source_reference.length).toBeGreaterThan(0);
    });
  });

  it('[LIVE] Simplification: sends text to live Gemini reasoning model and verifies 4 complexity levels when RUN_LIVE_GEMINI_TESTS=true', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      console.log('Skipping [LIVE] Simplification test (RUN_LIVE_GEMINI_TESTS is not true)');
      return;
    }
    try {
      const result = await runSimplificationAgent({
        documentId: docId,
        documentVersionId: verId,
        rawText,
        clauses: mockClauses,
        findings: mockFindings,
      });
      expect(result.allSummaries.very_simple).toBeDefined();
      expect(result.allSummaries.legal_terminology).toBeDefined();
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn('Live Gemini API quota limit reached (HTTP 429). Skipped hard failure gracefully.');
        expect(true).toBe(true);
        return;
      }
      throw err;
    }
  });
});

