import { describe, it, expect } from 'vitest';
import {
  saveFindingAnnotation,
  getStoredAnnotations,
  detectPriorVersionStatusPrompt,
  FindingAnnotation,
} from './annotationStorage';
import { XRayFindingCard } from '@/lib/xray/types';

describe('Feature 2 — Negotiation Status Tracker & Version Upgrade Safety', () => {
  const userA = 'user_alice_999';
  const userB = 'user_bob_888';
  const findingId1 = 'fnd_doc1_v1_red_1';

  it('1. Persists negotiation status correctly per finding for a user', () => {
    const updated = saveFindingAnnotation(userA, findingId1, 'negotiating', 'Requested 60-day notice');
    expect(updated.length).toBeGreaterThan(0);

    const saved = updated.find((a) => a.finding_id === findingId1);
    expect(saved).toBeDefined();
    expect(saved?.negotiation_status).toBe('negotiating');
    expect(saved?.notes).toBe('Requested 60-day notice');
  });

  it('2. Enforces strict RLS User Isolation — User B cannot see User A finding annotations', () => {
    saveFindingAnnotation(userA, 'fnd_private_1', 'resolved');

    const bobAnnotations = getStoredAnnotations(userB);
    const leak = bobAnnotations.some((a) => a.finding_id === 'fnd_private_1');
    expect(leak).toBe(false);
  });

  it('3. Decision 13 Version Upgrade Safety — Does NOT silently auto-carry-forward; returns explicit confirmation prompt', () => {
    const v1Finding: XRayFindingCard = {
      id: 'fnd_doc_v1_1',
      document_id: 'doc_1',
      document_version_id: 'ver_1',
      clause_id: 'c1',
      category: 'Restrictive Covenants',
      severity: 'red',
      finding_kind: 'action_required',
      title: 'Broad Non-Compete Clause',
      description: '12-month non-compete provision',
      finding_type: 'recommendation',
      confidence: 0.95,
      source_reference: 'Section 4.1',
      created_at: new Date().toISOString(),
    };

    const v2Finding: XRayFindingCard = {
      ...v1Finding,
      id: 'fnd_doc_v2_1',
      document_version_id: 'ver_2',
    };

    // Annotate v1 finding as resolved
    const annotations = saveFindingAnnotation(userA, v1Finding.id, 'resolved');

    // 1. Explicitly assert that v2Finding has NO auto-created annotation in database
    const v2DirectAnnotation = getStoredAnnotations(userA).find((a) => a.finding_id === v2Finding.id);
    expect(v2DirectAnnotation).toBeUndefined(); // CONFIRMED: NOT silently carried forward!

    // 2. Assert that detectPriorVersionStatusPrompt returns explicit user confirmation prompt
    const promptResult = detectPriorVersionStatusPrompt(userA, v2Finding, [v1Finding], annotations);

    expect(promptResult).not.toBeNull();
    expect(promptResult?.priorStatus).toBe('resolved');
    expect(promptResult?.promptMessage).toContain('Prior version was marked "Resolved" — Confirm to adopt status');
  });
});
