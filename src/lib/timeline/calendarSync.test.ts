import { describe, it, expect } from 'vitest';
import { generateICSContent, generateGoogleCalendarUrl } from './calendarSync';

describe('1-Click Calendar Sync (.ics Export Generator)', () => {
  const mockEvents = [
    {
      title: 'Rent Due Date',
      event_date: 'October 1, 2026',
      description: 'Monthly rent payment due in full.',
      notice_window: '5 Days Grace Period',
      source_reference: 'Section 2.1',
    },
    {
      title: 'Lease Renewal Notice Window',
      event_date: 'August 1, 2026',
      description: 'Must provide 60 days written notice prior to lease expiration.',
      notice_window: '60 Days Notice',
      source_reference: 'Section 4.2',
    },
  ];

  it('generates valid RFC 5545 iCalendar (.ics) content', () => {
    const ics = generateICSContent(mockEvents, 'Apartment Lease Agreement');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//LegalLens AI//Legal Timeline Calendar Export//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:LegalLens: Rent Due Date');
    expect(ics).toContain('SUMMARY:LegalLens: Lease Renewal Notice Window');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('generates a valid Google Calendar URL', () => {
    const url = generateGoogleCalendarUrl(mockEvents[0], 'Apartment Lease Agreement');
    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('LegalLens');
    expect(url).toContain('Rent%20Due%20Date');
  });
});
