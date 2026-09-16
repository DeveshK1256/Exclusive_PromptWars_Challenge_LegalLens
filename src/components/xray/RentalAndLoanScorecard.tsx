'use client';

import React, { useState } from 'react';
import { Calendar, Calculator, Download, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';

interface DeadlineItem {
  title: string;
  dateStr: string;
  description: string;
  noticeWindow: string;
}

interface RentalAndLoanScorecardProps {
  documentTitle?: string;
  documentType?: string;
}

export const RentalAndLoanScorecard: React.FC<RentalAndLoanScorecardProps> = ({
  documentTitle = 'Rental & Lease Agreement',
  documentType = 'rental_lease',
}) => {
  const [rentAmount, setRentAmount] = useState(2500);
  const [daysLate, setDaysLate] = useState(5);

  const isLoan = documentType?.includes('loan');
  const isService = documentType?.includes('service');
  const isPolicy = documentType?.includes('policy');

  const sampleDeadlines: DeadlineItem[] = isLoan
    ? [
        {
          title: 'Monthly Installment Payment Due Date',
          dateStr: '15th of every month',
          description: 'Monthly loan principal & interest payment of $370 due on 15th.',
          noticeWindow: '10 Days Grace Period',
        },
        {
          title: 'Grace Period Cutoff & Late Fee Trigger',
          dateStr: '25th of every month',
          description: 'Payments received after the 25th incur a $35 late charge.',
          noticeWindow: 'Late Fee Cutoff Date',
        },
        {
          title: 'Default Cure Deadline',
          dateStr: '15 Calendar Days Post Notice',
          description: 'Borrower must cure overdue balance within 15 days of default notice.',
          noticeWindow: '15 Days Cure Window',
        },
        {
          title: 'Final Maturity & Full Payoff Date',
          dateStr: 'October 15, 2030 (Final Last Date)',
          description: 'Final payoff date for remaining principal balance and interest.',
          noticeWindow: 'Contract Expiration Date',
        },
      ]
    : isService
    ? [
        {
          title: 'Service Fee Payment Due Date',
          dateStr: '30 Days Net Invoice',
          description: 'Invoices payable within 30 days of billing issuance.',
          noticeWindow: 'Net 30 Days',
        },
        {
          title: 'Contract Termination Notice Window',
          dateStr: '30 Days Prior Written Notice',
          description: 'Required advance written notice prior to service cancellation.',
          noticeWindow: '30 Days Notice Window',
        },
        {
          title: 'Service Agreement End Date / Last Date',
          dateStr: '1 Year From Effective Date',
          description: 'Contract expiration and SLA review date.',
          noticeWindow: 'Expiration Last Date',
        },
      ]
    : [
        {
          title: 'Monthly Rent Payment Due Date',
          dateStr: '1st of every month',
          description: 'Rent payment due in full on 1st of calendar month.',
          noticeWindow: '5 Days Grace Period',
        },
        {
          title: 'Lease Renewal Written Notice Window',
          dateStr: '60 Days Prior to Lease Expiration',
          description: 'Must send formal written notice to landlord if renewing or vacating.',
          noticeWindow: '60 Days Required Notice',
        },
        {
          title: 'Security Deposit Refund Cutoff Date',
          dateStr: 'Within 21 Days Post Move-Out',
          description: 'Landlord must return deposit check with itemized repair statement.',
          noticeWindow: '21 Days Post Move-Out',
        },
      ];

  // Calculate late fee estimate
  const graceDays = 3;
  const isPastGrace = daysLate > graceDays;
  const flatLateFee = isPastGrace ? 50 : 0;
  const dailyInterest = isPastGrace ? (daysLate - graceDays) * 10 : 0;
  const totalPenalty = flatLateFee + dailyInterest;

  // Generate Google Calendar Link
  const createGoogleCalendarLink = (item: DeadlineItem) => {
    const title = encodeURIComponent(`LegalLens Alert: ${item.title} (${documentTitle})`);
    const details = encodeURIComponent(`${item.description} - Source: ${documentTitle}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  // Generate .ics file download
  const downloadIcsFile = (item: DeadlineItem) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LegalLens AI//Deadline Notification//EN',
      'BEGIN:VEVENT',
      `SUMMARY:LegalLens Alert: ${item.title}`,
      `DESCRIPTION:${item.description}`,
      `DTSTART:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      `DTEND:${new Date(Date.now() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${item.title.replace(/\s+/g, '_')}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Obligation & Deadline Timeline with 1-Click Sync */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Visual Obligation &amp; Deadline Timeline
                <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                  1-Click Calendar Sync
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Extracted critical payment windows and notice deadlines for {documentTitle}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sampleDeadlines.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                    {item.noticeWindow}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <HoverGlossaryText text={item.description} />
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Key Date: {item.dateStr}</span>
                </div>
              </div>

              {/* 1-Click Sync Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={createGoogleCalendarLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Google Cal
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcsFile(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  .ICS File
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Penalty Calculator Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Penalty &amp; Late Fee Calculator Widget
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Estimate potential late fees, interest charges, and default triggers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rent-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Payment ($)</label>
                <input
                  id="rent-input"
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(Number(e.target.value))}
                  aria-label="Monthly Payment amount in dollars"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="days-late-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Days Past Due</label>
                <input
                  id="days-late-input"
                  type="number"
                  min="0"
                  max="60"
                  value={daysLate}
                  onChange={(e) => setDaysLate(Number(e.target.value))}
                  aria-label="Days Past Due"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-200 block">Default Trigger Conditions:</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                <HoverGlossaryText text="Payments overdue by 15+ days trigger a formal Notice to Cure or Quit. Failure to cure within 3 business days constitutes contract default." />
              </p>
            </div>
          </div>

          {/* Calculator Output */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estimated Penalty Impact</span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400">${totalPenalty}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                <div>Flat Late Charge: ${flatLateFee}</div>
                <div>Daily Interest ({daysLate} days): ${dailyInterest}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Based on standard lease clause terms.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
