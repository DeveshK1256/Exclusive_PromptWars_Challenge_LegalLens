'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { SafetyScore3DOrb } from '@/components/3d/SafetyScore3DOrb';
import { calculateSafetyScore, FindingLike } from '@/lib/xray/safetyScore';

interface SafetyScoreGaugeProps {
  score?: number; // Optional override
  highImpactCount?: number;
  attentionAreaCount?: number;
  findings?: FindingLike[];
}

export const SafetyScoreGauge: React.FC<SafetyScoreGaugeProps> = ({
  score,
  highImpactCount = 0,
  attentionAreaCount = 0,
  findings = [],
}) => {
  // If findings are provided, use pure deterministic calculation engine
  let result = calculateSafetyScore(findings);

  // If explicit score override is passed (e.g. from legacy state), use it unless findings exist
  let calculatedScore = findings.length > 0 ? result.score : (score ?? 82);

  if (findings.length === 0) {
    if (highImpactCount > 0) {
      calculatedScore = Math.min(calculatedScore, 45);
    } else if (attentionAreaCount >= 2) {
      calculatedScore = Math.min(calculatedScore, 68);
    }
    // Re-evaluate result object for visual labels
    result = calculateSafetyScore([
      ...Array(highImpactCount).fill({ severity_level: 'red' }),
      ...Array(attentionAreaCount).fill({ severity_level: 'orange' }),
    ]);
    result.score = calculatedScore;
  }

  const { ratingLabel, badgeColor, strokeColor, summaryDesc } = result;
  const IconComponent = calculatedScore < 50 ? ShieldAlert : calculatedScore < 75 ? AlertTriangle : ShieldCheck;

  // SVG Gauge calculations (semi-circle)
  const radius = 40;
  const circumference = Math.PI * radius; // 125.66
  const strokeDashoffset = circumference - (calculatedScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* 3D Animated Interactive Particle Orb */}
        <div className="shrink-0">
          <SafetyScore3DOrb score={calculatedScore} size={90} />
        </div>

        {/* Semi-circle Gauge SVG */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0 hidden sm:flex">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset="0"
              className="dark:stroke-slate-800"
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
              className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{calculatedScore}</span>
            <span className="text-[9px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">/ 100</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {ratingLabel}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200">Deterministic Document Fairness Gauge</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">{summaryDesc}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Calculated Score Breakdown:</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <span>🔴 Red (-15): {result.breakdown.red}</span>
          <span>🟠 Orange (-8): {result.breakdown.orange}</span>
          <span>🟡 Yellow (-3): {result.breakdown.yellow}</span>
          <span>🟢 Green (+1): {result.breakdown.green}</span>
        </div>
      </div>
    </div>
  );
};
