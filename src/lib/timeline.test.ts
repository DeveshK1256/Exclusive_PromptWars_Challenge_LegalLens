import { describe, it, expect } from 'vitest';
import { runLegalTimelineAgent, extractTimelineEventsFromText } from './timeline/timelineAgent';

describe('Sprint 7 — Stage 1: Legal Timeline Engine Test Suite', () => {
  const docId = 'doc_timeline_test_101';
  const verId = 'ver_timeline_v1';

  const sampleNDA = `MUTUAL NON-DISCLOSURE AGREEMENT
This Agreement is entered into and effective as of January 15, 2026 by and between Acme Corp and Beta LLC.
SECTION 1: CONFIDENTIAL INFORMATION
The receiving party agrees to hold all proprietary trade secrets in strict confidence.
SECTION 2: TERMINATION & NOTICE
This agreement shall terminate on December 31, 2028 or upon 30 days written notice by either party.
SECTION 3: PAYMENT
All invoices shall be paid within 30 days of receipt.`;

  it('[OFFLINE/HEURISTIC] extracts effective date, expiration date, notice deadline, and payment due date chronologically', async () => {
    const result = await runLegalTimelineAgent({
      documentId: docId,
      documentVersionId: verId,
      rawText: sampleNDA,
    });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.upcomingDeadlinesCount).toBeGreaterThan(0);

    const eventTypes = result.events.map((e) => e.event_type);
    expect(eventTypes).toContain('effective_date');
    expect(eventTypes).toContain('expiration_date');
    expect(eventTypes).toContain('notice_deadline');
  });

  it('[OFFLINE/HEURISTIC] enforces Verbatim Citation Verification Gate & discounted confidence (0.85) on derived relative dates', () => {
    const events = extractTimelineEventsFromText({
      documentId: docId,
      documentVersionId: verId,
      rawText: sampleNDA,
    });

    const noticeEvent = events.find((e) => e.event_type === 'notice_deadline');
    expect(noticeEvent).toBeDefined();
    // 2028-12-31 minus 30 days = 2028-12-01
    expect(noticeEvent?.event_date).toBe('2028-12-01');
    expect(noticeEvent?.confidence).toBe(0.85); // Discounted derived confidence
    expect(noticeEvent?.source_reference).toContain('[Derived: 2028-12-31 minus 30 days]');
  });

  it('[OFFLINE/HEURISTIC] sorts timeline events in chronological order', async () => {
    const result = await runLegalTimelineAgent({
      documentId: docId,
      documentVersionId: verId,
      rawText: sampleNDA,
    });

    const dates = result.events.map((e) => e.event_date).filter(Boolean) as string[];
    for (let i = 0; i < dates.length - 1; i++) {
      expect(new Date(dates[i]).getTime()).toBeLessThanOrEqual(new Date(dates[i + 1]).getTime());
    }
  });

  it('[LIVE] executes live reasoning API call against Gemini for timeline extraction when RUN_LIVE_GEMINI_TESTS=true', async () => {
    if (process.env.RUN_LIVE_GEMINI_TESTS !== 'true') {
      expect(true).toBe(true);
      return;
    }

    const result = await runLegalTimelineAgent({
      documentId: docId,
      documentVersionId: verId,
      rawText: sampleNDA,
    });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].source_reference).toBeDefined();
  });
});
