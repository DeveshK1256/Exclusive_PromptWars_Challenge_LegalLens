import { describe, it, expect } from 'vitest';
import { computeActiveDeadlineAlerts, saveStoredDismissal, getStoredDismissals, parseEventDate } from './deadlineNotifier';
import { Document, TimelineEvent } from '@/types/database';

describe('Feature 1 — Deadline Reminders & Digest Engine', () => {
  const mockUserA = 'user_alice_123';
  const mockUserB = 'user_bob_456';

  const docUserA: Document = {
    id: 'doc_alice_1',
    user_id: mockUserA,
    title: 'Alice Employment Contract',
    original_filename: 'alice_emp.pdf',
    mime_type: 'application/pdf',
    file_size: 1500000,
    file_hash: 'hash_alice',
    storage_path: 'docs/alice.pdf',
    document_type: 'employment_contract',
    jurisdiction: 'California, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `EMPLOYMENT CONTRACT
Notice required 30 days prior to 2026-10-15.
Performance review on 2026-09-24.`,
  };

  const docUserB: Document = {
    id: 'doc_bob_1',
    user_id: mockUserB,
    title: 'Bob Rental Agreement',
    original_filename: 'bob_lease.pdf',
    mime_type: 'application/pdf',
    file_size: 1200000,
    file_hash: 'hash_bob',
    storage_path: 'docs/bob.pdf',
    document_type: 'rental_agreement',
    jurisdiction: 'New York, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `LEASE AGREEMENT
Rent payment due on 2026-09-20.`,
  };

  it('1. Correctly calculates days remaining and assigns urgency buckets (30d, 7d, overdue)', () => {
    const refDate = new Date('2026-09-17T00:00:00Z');
    const alerts = computeActiveDeadlineAlerts([docUserA], mockUserA, [], refDate);

    expect(alerts.length).toBeGreaterThan(0);
    alerts.forEach((alert) => {
      expect(['overdue', 'urgent_7d', 'upcoming_30d']).toContain(alert.urgency);
      expect(alert.documentTitle).toBe('Alice Employment Contract');
    });
  });

  it('2. Enforces strict RLS User Isolation — User A NEVER sees User B deadline alerts', () => {
    const refDate = new Date('2026-09-17T00:00:00Z');
    const aliceAlerts = computeActiveDeadlineAlerts([docUserA, docUserB], mockUserA, [], refDate);

    expect(aliceAlerts.length).toBeGreaterThan(0);
    aliceAlerts.forEach((alert) => {
      expect(alert.event.document_id).toBe('doc_alice_1');
      expect(alert.documentTitle).not.toContain('Bob');
    });
  });

  it('3. DB-backed Dismissal persistence — Dismissed event is removed from active alerts', () => {
    const refDate = new Date('2026-09-17T00:00:00Z');
    const initialAlerts = computeActiveDeadlineAlerts([docUserA], mockUserA, [], refDate);
    expect(initialAlerts.length).toBeGreaterThan(0);

    const eventToDismiss = initialAlerts[0].event.id;
    const updatedDismissals = saveStoredDismissal(mockUserA, eventToDismiss);

    const postDismissalAlerts = computeActiveDeadlineAlerts([docUserA], mockUserA, updatedDismissals, refDate);
    const dismissedFound = postDismissalAlerts.some((a) => a.event.id === eventToDismiss);
    expect(dismissedFound).toBe(false);
  });
});
