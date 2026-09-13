import { describe, it, expect } from 'vitest';
import { runLegalXRayAgent, sanitizeSafetyLanguage } from './xray/legalXRayAgent';
import { ExtractedClauseItem } from './intelligence/types';

describe('Sprint 5 — Legal X-Ray Test Suite', () => {
  const docId = 'doc_xray_test_101';
  const verId = 'ver_xray_test_v1';

  const mockClauses: ExtractedClauseItem[] = [
    {
      id: 'cls_1',
      document_id: docId,
      document_version_id: verId,
      section_id: 'sec_1',
      clause_type: 'termination',
      title: 'SECTION 1: IMMEDIATE TERMINATION',
      original_text: 'Either party may terminate immediately without cause.',
      plain_explanation: 'Allows immediate cancellation of the agreement.',
      severity_level: 'red',
      finding_kind: 'action_required',
      confidence: 0.95,
      source_reference: 'Section "SECTION 1: IMMEDIATE TERMINATION" (p.1): "Either party may terminate immediately without cause."',
    },
    {
      id: 'cls_2',
      document_id: docId,
      document_version_id: verId,
      section_id: 'sec_2',
      clause_type: 'payment_terms',
      title: 'SECTION 2: PAYMENT DEADLINE',
      original_text: 'Payment is due within 14 days of invoice receipt.',
      plain_explanation: 'Payment must be completed within 14 days.',
      severity_level: 'orange',
      finding_kind: 'deadline',
      confidence: 0.92,
      source_reference: 'Section "SECTION 2: PAYMENT DEADLINE" (p.1): "Payment is due within 14 days of invoice receipt."',
    },
    {
      id: 'cls_3',
      document_id: docId,
      document_version_id: verId,
      section_id: 'sec_3',
      clause_type: 'definitions',
      title: 'SECTION 3: DEFINITIONS',
      original_text: 'Company means Acme Corp.',
      plain_explanation: 'Defines Company as Acme Corp.',
      severity_level: 'green',
      finding_kind: 'informational',
      confidence: 0.98,
      source_reference: 'Section "SECTION 3: DEFINITIONS" (p.2): "Company means Acme Corp."',
    },
  ];

  it('runs Legal X-Ray Agent and classifies findings by separate severity_level and finding_kind', async () => {
    const overview = await runLegalXRayAgent(docId, verId, mockClauses, 'Sample Raw Document Text');

    expect(overview.high_impact_count).toBe(1); // 🔴 red
    expect(overview.attention_area_count).toBe(1); // 🟠 orange
    expect(overview.general_count).toBe(1); // 🟢 green
    expect(overview.deadlines_count).toBe(1); // deadline
    expect(overview.action_items_count).toBe(1); // action_required

    // Verify finding structure
    const redFinding = overview.findings.find((f) => f.severity === 'red');
    expect(redFinding).toBeDefined();
    expect(redFinding?.finding_kind).toBe('action_required');
    expect(redFinding?.finding_type).toBe('recommendation');
  }, 30000);

  it('enforces Zero-Hallucination Gate: every finding carries a valid source_reference', async () => {
    const overview = await runLegalXRayAgent(docId, verId, mockClauses, 'Sample Raw Document Text');

    overview.findings.forEach((finding) => {
      expect(finding.source_reference).toBeDefined();
      expect(finding.source_reference.length).toBeGreaterThan(10);
      expect(finding.source_reference).toContain('p.');
      expect(finding.confidence).toBeGreaterThan(0.0);
    });
  }, 30000);

  it('enforces Safety Language Rules (Decision 6): sanitizes illegal/invalid/enforceable assertions to jurisdiction-neutral phrasing', () => {
    const unsafeText1 = 'This clause is illegal under state law.';
    const safeText1 = sanitizeSafetyLanguage(unsafeText1);
    expect(safeText1).toContain('potential attention area requiring review');
    expect(safeText1).not.toContain('illegal');

    const unsafeText2 = 'The penalty is unenforceable.';
    const safeText2 = sanitizeSafetyLanguage(unsafeText2);
    expect(safeText2).toContain('may be subject to review');
    expect(safeText2).not.toContain('unenforceable');
  });

  it('[OFFLINE/HEURISTIC] visually separates fact vs ai_interpretation vs recommendation finding_types', async () => {
    const overview = await runLegalXRayAgent(docId, verId, mockClauses, 'Sample Raw Document Text');

    const factFinding = overview.findings.find((f) => f.finding_type === 'fact');
    expect(factFinding?.severity).toBe('green');

    const recFinding = overview.findings.find((f) => f.finding_type === 'recommendation');
    expect(recFinding?.severity).toBe('red');
  }, 30000);

  it('[LIVE] executes Legal X-Ray Agent against live Gemini reasoning model and validates structural finding schema', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      expect(true).toBe(true);
      return;
    }

    const overview = await runLegalXRayAgent(docId, verId, mockClauses, 'Sample contract text for live X-Ray analysis');
    expect(overview.findings.length).toBeGreaterThan(0);
    overview.findings.forEach((finding) => {
      expect(['green', 'yellow', 'orange', 'red']).toContain(finding.severity);
      expect(['informational', 'action_required', 'deadline']).toContain(finding.finding_kind);
      expect(finding.source_reference).toBeDefined();
      expect(finding.confidence).toBeGreaterThanOrEqual(0.0);
      expect(finding.confidence).toBeLessThanOrEqual(1.0);
    });
  }, 30000);
});
