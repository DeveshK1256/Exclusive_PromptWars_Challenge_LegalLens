'use client';

import React from 'react';
import { TimelineEvent } from '../../types/database';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, ChevronRight } from 'lucide-react';

interface LegalTimelineViewerProps {
  events: TimelineEvent[];
  upcomingDeadlinesCount?: number;
}

const EVENT_TYPE_BADGES: Record<string, { label: string; style: string }> = {
  effective_date: {
    label: 'Effective Date',
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  expiration_date: {
    label: 'Expiration Date',
    style: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  notice_deadline: {
    label: 'Notice Deadline',
    style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  renewal_deadline: {
    label: 'Renewal Deadline',
    style: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  payment_due_date: {
    label: 'Payment Due',
    style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  milestone: {
    label: 'Milestone',
    style: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  },
};

export const LegalTimelineViewer: React.FC<LegalTimelineViewerProps> = ({
  events,
  upcomingDeadlinesCount = 0,
}) => {
  return (
    <div className="space-y-6" role="region" aria-label="Legal Document Timeline">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Legal Document Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Chronological schedule of key dates, deadlines, and renewal milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Total Milestones: </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{events.length}</span>
          </div>
          {upcomingDeadlinesCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-semibold" role="status">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{upcomingDeadlinesCount} Deadlines Requiring Action</span>
            </div>
          )}
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">No specific calendar dates or deadlines were detected in this document.</p>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800" role="list">
            {events.map((evt, idx) => {
              const badgeInfo = EVENT_TYPE_BADGES[evt.event_type] || EVENT_TYPE_BADGES.milestone;

              return (
                <div key={evt.id || idx} className="relative group" role="listitem">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 group-hover:border-indigo-400 group-hover:scale-110 transition-all flex items-center justify-center" aria-hidden="true">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </div>

                  {/* Event Card */}
                  <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-750 p-4 rounded-xl space-y-2.5 transition-all shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${badgeInfo.style}`}>
                          [{badgeInfo.label}]
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">{evt.title}</h3>
                      </div>

                      {evt.event_date && (
                        <div className="text-xs font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {evt.event_date}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{evt.description}</p>

                    {/* Source Citation Badge */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-500" aria-hidden="true" />
                        Ref: {evt.source_reference}
                      </span>
                      <span className="text-[10px] text-slate-500">Confidence: {(evt.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
