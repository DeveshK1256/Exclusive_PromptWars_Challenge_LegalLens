'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { NegotiationStatus, getStoredAnnotations, saveFindingAnnotation, detectPriorVersionStatusPrompt } from '@/lib/annotations/annotationStorage';
import { XRayFindingCard } from '@/lib/xray/types';

interface NegotiationStatusBadgeProps {
  finding: XRayFindingCard;
  userId?: string;
  priorFindings?: XRayFindingCard[];
  onStatusChange?: (status: NegotiationStatus) => void;
}

const STATUS_CONFIG: Record<NegotiationStatus, { label: string; color: string; badgeClass: string; icon: React.ElementType }> = {
  not_started: {
    label: 'Not Started',
    color: 'slate',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    icon: Clock,
  },
  negotiating: {
    label: 'In Negotiation',
    color: 'amber',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
    icon: RefreshCw,
  },
  resolved: {
    label: 'Resolved',
    color: 'emerald',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    icon: CheckCircle2,
  },
  accepted_risk: {
    label: 'Accepted Risk',
    color: 'blue',
    badgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30',
    icon: Check,
  },
};

export const NegotiationStatusBadge: React.FC<NegotiationStatusBadgeProps> = ({
  finding,
  userId = 'user_demo',
  priorFindings = [],
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState<NegotiationStatus>('not_started');
  const [priorPrompt, setPriorPrompt] = useState<{ priorStatus: NegotiationStatus; promptMessage: string } | null>(null);

  useEffect(() => {
    const annotations = getStoredAnnotations(userId);
    const existing = annotations.find((a) => a.finding_id === finding.id);
    if (existing) {
      setCurrentStatus(existing.negotiation_status);
    } else {
      setCurrentStatus('not_started');
      const prompt = detectPriorVersionStatusPrompt(userId, finding, priorFindings, annotations);
      setPriorPrompt(prompt);
    }
  }, [finding.id, userId, priorFindings]);

  const handleSelectStatus = (status: NegotiationStatus) => {
    setCurrentStatus(status);
    setPriorPrompt(null);
    saveFindingAnnotation(userId, finding.id, status);
    if (onStatusChange) onStatusChange(status);
  };

  const handleAdoptPriorStatus = () => {
    if (priorPrompt) {
      handleSelectStatus(priorPrompt.priorStatus);
    }
  };

  const currentConfig = STATUS_CONFIG[currentStatus];
  const IconComp = currentConfig.icon;

  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-500 font-mono">Negotiation:</span>
        <select
          value={currentStatus}
          aria-label={`Negotiation Status for ${finding.title}`}
          onChange={(e) => handleSelectStatus(e.target.value as NegotiationStatus)}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${currentConfig.badgeClass}`}
        >
          <option value="not_started">Status: Not Started</option>
          <option value="negotiating">Status: In Negotiation</option>
          <option value="resolved">Status: Resolved</option>
          <option value="accepted_risk">Status: Accepted Risk</option>
        </select>
      </div>

      {/* Decision 13 Safe Carry-Forward User Prompt */}
      {priorPrompt && currentStatus === 'not_started' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 p-2 rounded-lg text-[10px] text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{priorPrompt.promptMessage}</span>
          </span>
          <button
            type="button"
            onClick={handleAdoptPriorStatus}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] shrink-0"
          >
            Adopt Status
          </button>
        </div>
      )}
    </div>
  );
};
