'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, Bell, X, FileText, ChevronRight } from 'lucide-react';
import { Document, DeadlineAlert, TimelineEventDismissal } from '@/types/database';
import { computeActiveDeadlineAlerts, saveStoredDismissal, getStoredDismissals } from '@/lib/deadlines/deadlineNotifier';

interface DeadlineReminderBannerProps {
  documents: Document[];
  userId?: string;
  onNavigateTab?: (tab: 'timeline' | 'xray') => void;
}

export const DeadlineReminderBanner: React.FC<DeadlineReminderBannerProps> = ({
  documents,
  userId = 'user_demo',
  onNavigateTab,
}) => {
  const [dismissals, setDismissals] = useState<TimelineEventDismissal[]>([]);
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([]);

  useEffect(() => {
    const userDismissals = getStoredDismissals(userId);
    setDismissals(userDismissals);
    const activeAlerts = computeActiveDeadlineAlerts(documents, userId, userDismissals);
    setAlerts(activeAlerts);
  }, [documents, userId]);

  const handleDismiss = (eventId: string) => {
    const updated = saveStoredDismissal(userId, eventId);
    setDismissals(updated);
    setAlerts(computeActiveDeadlineAlerts(documents, userId, updated));
  };

  if (alerts.length === 0) return null;

  const overdueCount = alerts.filter((a) => a.urgency === 'overdue').length;
  const urgent7dCount = alerts.filter((a) => a.urgency === 'urgent_7d').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Upcoming Deadline Reminders</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {alerts.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Automated date-window tracker for contract cancellation, renewal, and notice deadlines (30d / 7d windows).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {overdueCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-500/30 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{overdueCount} Overdue</span>
            </span>
          )}
          {urgent7dCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{urgent7dCount} Due in &le; 7 Days</span>
            </span>
          )}
        </div>
      </div>

      {/* Alert Items List */}
      <div className="space-y-2.5" role="region" aria-label="Active Deadline Reminders">
        {alerts.slice(0, 4).map((alert) => {
          const badgeStyles = {
            overdue: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
            urgent_7d: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
            upcoming_30d: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
          }[alert.urgency];

          return (
            <div
              key={alert.event.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${badgeStyles}`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {alert.event.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border bg-white dark:bg-slate-900">
                    {alert.daysRemaining < 0
                      ? `${Math.abs(alert.daysRemaining)} Days Past Due`
                      : alert.daysRemaining === 0
                      ? 'Due Today!'
                      : `${alert.daysRemaining} Days Remaining`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Doc: {alert.documentTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  {alert.event.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('timeline')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDismiss(alert.event.id)}
                  aria-label={`Dismiss deadline reminder for ${alert.event.title}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                  title="Dismiss Reminder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
