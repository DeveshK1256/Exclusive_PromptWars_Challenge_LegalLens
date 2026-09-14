import { describe, it, expect } from 'vitest';
import { runPersonalImpactAgent } from './impact/personalImpactAgent';
import { ContextRole } from './impact/types';

describe('Sprint 9 — Personal Impact & Journey Navigator Test Suite', () => {
  const documentId = 'doc_test_impact_1001';
  const sampleFindings = [
    {
      id: 'fnd_xray_001',
      category: 'Restrictive Covenants',
      title: 'Expanded Non-Compete Restriction',
      description: 'Employee restricted from competing within 25 miles for 12 months post-employment.',
      severity_level: 'orange' as const,
      finding_kind: 'action_required' as const,
      source_reference: 'Section 3: "within 25 miles of San Francisco for 12 months"',
    },
    {
      id: 'fnd_xray_002',
      category: 'Termination Notice',
      title: '30-Day Resignation Notice',
      description: 'Either party must give 30 days written notice prior to termination.',
      severity_level: 'yellow' as const,
      finding_kind: 'deadline' as const,
      source_reference: 'Section 2: "30 days written notice"',
    },
  ];

  it('[OFFLINE/HEURISTIC] reframes pre-validated findings based on context_role without introducing unverified claims', async () => {
    const roles: ContextRole[] = ['Employee', 'Tenant', 'Freelancer'];

    for (const role of roles) {
      const result = await runPersonalImpactAgent({
        documentId,
        contextRole: role,
        findings: sampleFindings,
      });

      expect(result.context_role).toBe(role);
      expect(result.roleSpecificImpacts.length).toBe(sampleFindings.length);

      // Verify Single-Source-of-Truth principle & Decision 12 per-item confidence
      result.roleSpecificImpacts.forEach((impactItem) => {
        const matchingInputFinding = sampleFindings.find((f) => f.id === impactItem.finding_id);
        expect(matchingInputFinding).toBeDefined();
        expect(impactItem.source_reference).toBe(matchingInputFinding?.source_reference);
        expect(impactItem.what_this_means_for_you).toBeTruthy();
        expect(impactItem.practical_considerations.length).toBeGreaterThan(0);
        expect(impactItem.confidence).toBeGreaterThanOrEqual(0.0);
        expect(impactItem.confidence).toBeLessThanOrEqual(1.0);
      });
    }
  });

  it('[OFFLINE/HEURISTIC] enforces honest fallback metadata: modelUsed is heuristic_fallback, analysis_mode is fallback, degraded is true', async () => {
    const result = await runPersonalImpactAgent({
      documentId,
      contextRole: 'Employee',
      findings: sampleFindings,
    });

    expect(result.modelUsed).toBe('heuristic_fallback');
    expect(result.analysis_mode).toBe('fallback');
    expect(result.degraded).toBe(true);
  });

  it('[OFFLINE/HEURISTIC] enforces Decision 10 Jurisdiction Neutrality across Personal Impact explanations', async () => {
    const result = await runPersonalImpactAgent({
      documentId,
      contextRole: 'Employee',
      findings: sampleFindings,
      jurisdiction: null, // null jurisdiction
    });

    result.roleSpecificImpacts.forEach((item) => {
      expect(item.what_this_means_for_you).not.toMatch(/California law|B&P 16600|Section 16600/i);
      item.practical_considerations.forEach((pc) => {
        expect(pc).not.toMatch(/California law|B&P 16600|Section 16600/i);
      });
    });
  });

  it('[LIVE] executes real unmocked Gemini call for Personal Impact when RUN_LIVE_GEMINI_TESTS is enabled', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      return;
    }

    const result = await runPersonalImpactAgent({
      documentId,
      contextRole: 'Employee',
      findings: sampleFindings,
      isLiveTest: true,
    });

    expect(result.roleSpecificImpacts.length).toBeGreaterThan(0);
    expect(result.analysis_mode).toBe('ai');
    expect(result.degraded).toBe(false);
    expect(result.confidence).toBeGreaterThan(0.0);
  });
});
