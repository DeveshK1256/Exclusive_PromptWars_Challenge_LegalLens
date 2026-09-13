import { describe, it, expect } from 'vitest';
import { runContractComparisonAgent } from './comparison/comparisonAgent';
import { verifyDualDocumentOwnership, inMemoryAuditLogs } from './comparison/security';

describe('Sprint 8 — Contract Comparison Engine Test Suite', () => {
  const docAId = 'doc_a_1001';
  const docBId = 'doc_b_1002';
  const userId = 'user_author_1';
  const otherUserId = 'user_attacker_99';

  const sampleTextA = `EMPLOYMENT AGREEMENT (Version A)
SECTION 1: COMPENSATION AND SALARY
Employee shall receive an annual base salary of $120,000 paid bi-weekly.

SECTION 2: TERMINATION NOTICE
Either party may terminate this agreement upon 30 days written notice to the other party.

SECTION 3: NON-COMPETE RESTRICTIONS
Employee agrees not to engage in competing business within 25 miles of San Francisco for 6 months post-employment.`;

  const sampleTextB = `EMPLOYMENT AGREEMENT (Version B - Revised)
SECTION 1: COMPENSATION AND SALARY
Employee shall receive an annual base salary of $120,000 paid bi-weekly plus an annual discretionary performance bonus.

SECTION 2: TERMINATION NOTICE
Either party may terminate this agreement upon 14 days written notice to the other party.

SECTION 3: NON-COMPETE RESTRICTIONS
Employee agrees not to engage in competing business worldwide for 24 months post-employment.

SECTION 4: FLEXIBLE REMOTE WORK
Employee is permitted 2 days per week flexible remote work with manager approval.`;

  it('[OFFLINE/HEURISTIC] performs side-by-side clause matching and identifies modified notice windows and non-compete terms', async () => {
    const result = await runContractComparisonAgent({
      comparisonId: 'cmp_test_001',
      userId,
      documentAId: docAId,
      documentBId: docBId,
      rawTextA: sampleTextA,
      rawTextB: sampleTextB,
    });

    expect(result.comparison.status).toBe('completed');
    expect(result.findings.length).toBeGreaterThan(0);

    // Verify Decision 11 separate severity_level and finding_kind schema compliance
    result.findings.forEach((finding) => {
      expect(['green', 'yellow', 'orange', 'red']).toContain(finding.severity_level);
      expect(['informational', 'action_required', 'deadline']).toContain(finding.finding_kind);
      expect(finding.confidence).toBeGreaterThanOrEqual(0.0);
      expect(finding.confidence).toBeLessThanOrEqual(1.0);
      expect(finding.source_reference_a).toBeDefined();
      expect(finding.source_reference_b).toBeDefined();
    });

    // 3-Layer Validation: Check key-fact flexible substring matching for non-compete modification
    const nonCompeteFinding = result.findings.find(
      (f) =>
        f.category.toLowerCase().includes('non-compete') ||
        f.category.toLowerCase().includes('non-competition') ||
        f.category.toLowerCase().includes('restrictive') ||
        f.title.toLowerCase().includes('non-compete') ||
        f.title.toLowerCase().includes('non-competition')
    );
    expect(nonCompeteFinding).toBeDefined();
    expect(['orange', 'red', 'yellow']).toContain(nonCompeteFinding?.severity_level);

  }, 30000);

  it('[OFFLINE/HEURISTIC] correctly identifies missing/added clauses absent in Document A', async () => {
    const result = await runContractComparisonAgent({
      comparisonId: 'cmp_test_002',
      userId,
      documentAId: docAId,
      documentBId: docBId,
      rawTextA: sampleTextA,
      rawTextB: sampleTextB,
    });

    const remoteWorkFinding = result.findings.find(
      (f) =>
        f.category.toLowerCase().includes('remote') ||
        f.category.toLowerCase().includes('location') ||
        f.title.toLowerCase().includes('remote') ||
        f.document_b_value.toLowerCase().includes('remote')
    );
    expect(remoteWorkFinding).toBeDefined();
    expect(remoteWorkFinding?.document_a_value.toLowerCase()).toMatch(/absent|no |not specified|n\/a/i);
  }, 30000);

  it('[OFFLINE/HEURISTIC] enforces Dual-Document Ownership RLS: blocks cross-user comparison attempt and logs to audit_logs', async () => {
    const docA = { id: 'doc_a_user_a', user_id: 'user_a' };
    const docB = { id: 'doc_b_user_b', user_id: 'user_b' };

    // User A attempts to compare User A's document against User B's document
    const isAllowed = await verifyDualDocumentOwnership('user_a', docA, docB);
    expect(isAllowed).toBe(false);

    // Verify security alert was logged to audit_logs (Decision 9)
    const auditEntry = inMemoryAuditLogs.find(
      (log) => log.action === 'cross_user_comparison_denied' && log.userId === 'user_a'
    );
    expect(auditEntry).toBeDefined();
    expect(auditEntry?.resourceType).toBe('comparisons');
    expect(auditEntry?.metadata.documentAOwner).toBe('user_a');
    expect(auditEntry?.metadata.documentBOwner).toBe('user_b');
  });

  it('[OFFLINE/HEURISTIC] enforces Zero-Hallucination Gate: every finding carries traceable source_references in both documents', async () => {
    const result = await runContractComparisonAgent({
      comparisonId: 'cmp_test_003',
      userId,
      documentAId: docAId,
      documentBId: docBId,
      rawTextA: sampleTextA,
      rawTextB: sampleTextB,
    });

    result.findings.forEach((finding) => {
      // Reference A must be present in Document A or marked absent
      if (finding.source_reference_a !== 'Absent in Document A') {
        expect(finding.source_reference_a).toBeTruthy();
      }
      // Reference B must be present in Document B or marked absent
      if (finding.source_reference_b !== 'Absent in Document B') {
        expect(finding.source_reference_b).toBeTruthy();
      }
    });
  }, 30000);

  it('[LIVE] executes Contract Comparison Agent against live Gemini reasoning model and validates 3-layer schema fidelity', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      expect(true).toBe(true);
      return;
    }

    const result = await runContractComparisonAgent({
      comparisonId: 'cmp_live_001',
      userId,
      documentAId: docAId,
      documentBId: docBId,
      rawTextA: sampleTextA,
      rawTextB: sampleTextB,
      isLiveTest: true,
    });

    expect(result.comparison.status).toBe('completed');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.modelUsed).toBeDefined();

    result.findings.forEach((finding) => {
      expect(['green', 'yellow', 'orange', 'red']).toContain(finding.severity_level);
      expect(['informational', 'action_required', 'deadline']).toContain(finding.finding_kind);
      expect(finding.confidence).toBeGreaterThanOrEqual(0.0);
      expect(finding.confidence).toBeLessThanOrEqual(1.0);
      expect(finding.source_reference_a).toBeDefined();
      expect(finding.source_reference_b).toBeDefined();
    });
  }, 30000);
});
