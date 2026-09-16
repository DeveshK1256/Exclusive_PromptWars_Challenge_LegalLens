export interface TimelineEventLike {
  title: string;
  event_date?: string | null;
  dateStr?: string | null;
  description: string;
  notice_window?: string | null;
  source_reference?: string | null;
}

/**
 * Deterministic iCalendar (.ics) and Google Calendar export generator (Sprint 13 Feature Epic)
 * Converts timeline events into standard RFC 5545 .ics file content or Google Calendar URL.
 * NO AI / LLM call is involved.
 */
export function generateICSContent(events: TimelineEventLike[], docTitle: string = 'Legal Document'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LegalLens AI//Legal Timeline Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Legal Deadlines - ${docTitle.replace(/[\r\n]/g, ' ')}`,
  ];

  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  events.forEach((evt, idx) => {
    const rawDate = evt.event_date || evt.dateStr || 'TBD';
    const dateObj = parseEventDate(rawDate);
    
    // Format DTSTART and DTEND (1-hour block on date or default 30 days out)
    const dtStart = formatDateForICS(dateObj);
    const dtEnd = formatDateForICS(new Date(dateObj.getTime() + 60 * 60 * 1000));

    const cleanTitle = (evt.title || 'Legal Deadline').replace(/[\r\n]/g, ' ');
    const cleanDesc = `${evt.description || ''}${evt.notice_window ? `\nNotice Window: ${evt.notice_window}` : ''}${evt.source_reference ? `\nSource: ${evt.source_reference}` : ''}`
      .replace(/[\r\n]/g, '\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:legallens_${Date.now()}_${idx}@legallens.ai`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:LegalLens: ${cleanTitle}`);
    lines.push(`DESCRIPTION:${cleanDesc}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(events: TimelineEventLike[], docTitle: string = 'Legal Document') {
  const content = generateICSContent(events, docTitle);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deadlines.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(event: TimelineEventLike, docTitle: string = 'Legal Document'): string {
  const dateObj = parseEventDate(event.event_date || event.dateStr || 'TBD');
  const isoStart = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const isoEnd = new Date(dateObj.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');

  const title = encodeURIComponent(`LegalLens: ${event.title || 'Legal Deadline'} (${docTitle})`);
  const details = encodeURIComponent(`${event.description || ''}\nNotice Window: ${event.notice_window || 'N/A'}\nSource: ${event.source_reference || 'N/A'}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${isoStart}/${isoEnd}&details=${details}`;
}

function parseEventDate(dateStr: string): Date {
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed);

  // If date string contains a year like 2025/2026/2027
  const yearMatch = dateStr.match(/\b(202\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return new Date(year, 0, 15);
  }

  // Default fallback to 30 days from today
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  return fallback;
}

function formatDateForICS(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
