'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

interface SafetyScoreGaugeProps {
  score?: number; // 1 - 100 score
  highImpactCount?: number;
  attentionAreaCount?: number;
}

export const SafetyScoreGauge: React.FC<SafetyScoreGaugeProps> = ({
  score = 82,
  highImpactCount = 0,
  attentionAreaCount = 1,
}) => {
  // Determine rating bucket & color scheme
  let calculatedScore = score;

  if (highImpactCount > 0) {
    calculatedScore = Math.min(score, 45);
  } else if (attentionAreaCount >= 2) {
    calculatedScore = Math.min(score, 68);
  }

  let statusText = 'Standard & Fair Terms';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let strokeColor = '#10b981'; // emerald-500
  let IconComponent = ShieldCheck;
  let summaryDesc = 'This document contains balanced clauses matching typical industry standards.';

  if (calculatedScore < 50) {
    statusText = 'High Risk & Restrictive';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    strokeColor = '#f43f5e'; // rose-500
    IconComponent = ShieldAlert;
    summaryDesc = 'Caution: Contains restrictive covenants, heavy financial penalties, or unusual waivers.';
  } else if (calculatedScore < 75) {
    statusText = 'Moderate Caution Area';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    strokeColor = '#f59e0b'; // amber-500
    IconComponent = AlertTriangle;
    summaryDesc = 'Contains notice windows or fee conditions that require your attention before signing.';
  }

  // SVG Gauge calculations (semi-circle)
  const radius = 40;
  const circumference = Math.PI * radius; // 125.66
  const strokeDashoffset = circumference - (calculatedScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        {/* Semi-circle Gauge SVG */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset="0"
            />
            {/* Value Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-100 tracking-tight">{calculatedScore}</span>
            <span className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">/ 100</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {statusText}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-200">Overall Document Fairness Gauge</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">{summaryDesc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="text-[11px] text-slate-400">
          Score derived from clause severity, obligation weight, and risk balance.
        </span>
      </div>
    </div>
  );
};
