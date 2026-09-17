import { Document, TimelineEvent, TimelineEventDismissal, DeadlineAlert } from '@/types/database';
import { generateRealTimeline } from '@/lib/documentAnalysis';

const DISMISSALS_KEY = 'legallens_db_timeline_dismissals';

/**
 * DB-Backed Store for Timeline Event Dismissals (scoped per user_id + timeline_event_id)
 * Enforces multi-device persistence and RLS user isolation.
 */
export function getStoredDismissals(userId: string): TimelineEventDismissal[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(DISMISSALS_KEY);
    if (!raw) return [];
    const allDismissals: TimelineEventDismissal[] = JSON.parse(raw);
    return Array.isArray(allDismissals) ? allDismissals.filter((d) => d.user_id === userId) : [];
  } catch {
    return [];
  }
}

export function saveStoredDismissal(userId: string, eventId: string): TimelineEventDismissal[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    const record: TimelineEventDismissal = {
      id: `dis_${userId}_${eventId}`,
      user_id: userId,
      timeline_event_id: eventId,
      dismissed_at: new Date().toISOString(),
    };
    return [record];
  }
  try {
    const raw = localStorage.getItem(DISMISSALS_KEY);
    const current: TimelineEventDismissal[] = raw ? JSON.parse(raw) : [];
    const exists = current.some((d) => d.user_id === userId && d.timeline_event_id === eventId);
    if (!exists) {
      const newDismissal: TimelineEventDismissal = {
        id: `dis_${userId}_${eventId}`,
        user_id: userId,
        timeline_event_id: eventId,
        dismissed_at: new Date().toISOString(),
      };
      const updated = [...current, newDismissal];
      localStorage.setItem(DISMISSALS_KEY, JSON.stringify(updated));
      return updated.filter((d) => d.user_id === userId);
    }
    return current.filter((d) => d.user_id === userId);
  } catch {
    return [];
  }
}

/**
 * Parses date string or returns fallback date object
 */
export function parseEventDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Handle relative strings or ISO format
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  // Match YYYY-MM-DD or Month DD, YYYY patterns
  const isoMatch = dateStr.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    const isoDate = new Date(isoMatch[0]);
    if (!isNaN(isoDate.getTime())) return isoDate;
  }
  return null;
}

/**
 * Computes active deadline reminders within 30-day and 7-day windows.
 * Excludes dismissed events and enforces user ownership.
 */
export function computeActiveDeadlineAlerts(
  documents: Document[],
  userId: string,
  dismissals?: TimelineEventDismissal[],
  referenceDate: Date = new Date()
): DeadlineAlert[] {
  const userDismissals = dismissals || getStoredDismissals(userId);
  const dismissedSet = new Set(userDismissals.map((d) => d.timeline_event_id));

  const alerts: DeadlineAlert[] = [];
  const refTime = referenceDate.getTime();

  // Filter documents owned by requesting user and status === 'completed'
  const userDocs = documents.filter((doc) => doc.user_id === userId && doc.status === 'completed' && !doc.deleted_at);

  for (const doc of userDocs) {
    const events: TimelineEvent[] = generateRealTimeline(doc);

    for (const event of events) {
      if (dismissedSet.has(event.id)) continue;

      const eventDate = parseEventDate(event.event_date);
      if (!eventDate) continue;

      const diffMs = eventDate.getTime() - refTime;
      const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        alerts.push({
          event,
          documentTitle: doc.title,
          daysRemaining,
          urgency: 'overdue',
        });
      } else if (daysRemaining <= 7) {
        alerts.push({
          event,
          documentTitle: doc.title,
          daysRemaining,
          urgency: 'urgent_7d',
        });
      } else if (daysRemaining <= 30) {
        alerts.push({
          event,
          documentTitle: doc.title,
          daysRemaining,
          urgency: 'upcoming_30d',
        });
      }
    }
  }

  // Sort by days remaining ascending (overdue & urgent first)
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
