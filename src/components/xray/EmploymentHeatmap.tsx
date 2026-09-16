'use client';

import React from 'react';
import { ShieldAlert, MapPin, Clock, Lightbulb, Briefcase, Navigation } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';
import { ExtractedClauseItem } from '@/lib/intelligence/types';
import { XRayFindingCard } from '@/lib/xray/types';

interface EmploymentHeatmapProps {
  documentTitle?: string;
  clauses?: ExtractedClauseItem[];
  findings?: XRayFindingCard[];
}

export const EmploymentHeatmap: React.FC<EmploymentHeatmapProps> = ({
  documentTitle = 'Employment Contract / NDA',
  clauses = [],
  findings = [],
}) => {
  // Extract non-compete, IP assignment, and moonlighting clauses from real clauses array
  const nonCompeteClause = clauses.find(
    (c) => c.clause_type?.includes('non_compete') || c.title?.toLowerCase().includes('compete')
  ) || {
    title: 'Non-Compete Duration & Radius',
    plain_explanation: 'Restricts working for competitors within a specified duration post-employment.',
    source_reference: 'Section 3.1',
    severity_level: 'red' as const,
  };

  const ipClause = clauses.find(
    (c) => c.clause_type?.includes('intellectual_property') || c.title?.toLowerCase().includes('invention') || c.title?.toLowerCase().includes('intellectual')
  ) || {
    title: 'Invention & IP Assignment',
    plain_explanation: 'All work products, code, ideas, and patents created during employment belong to the employer.',
    source_reference: 'Section 4.1',
    severity_level: 'red' as const,
  };

  const moonlightingClause = clauses.find(
    (c) => c.title?.toLowerCase().includes('moonlight') || c.title?.toLowerCase().includes('outside work')
  ) || {
    title: 'Outside Work & Moonlighting',
    plain_explanation: 'Secondary employment or freelance projects require prior written approval.',
    source_reference: 'Section 3.2',
    severity_level: 'yellow' as const,
  };

  const restrictions = [
    {
      category: 'Non-Compete Covenant',
      icon: Clock,
      severity: nonCompeteClause.severity_level || 'red',
      levelText: nonCompeteClause.title,
      desc: nonCompeteClause.plain_explanation,
      source: nonCompeteClause.source_reference,
      impact: 'High Impact',
    },
    {
      category: 'Geographic Radius',
      icon: MapPin,
      severity: 'orange',
      levelText: '25-Mile Geographic Boundary',
      desc: 'Restricts competitive activities within employer service radius.',
      source: 'Section 3.1',
      impact: 'Attention Area',
    },
    {
      category: 'IP & Invention Assignment',
      icon: Lightbulb,
      severity: ipClause.severity_level || 'red',
      levelText: ipClause.title,
      desc: ipClause.plain_explanation,
      source: ipClause.source_reference,
      impact: 'High Impact',
    },
    {
      category: 'Moonlighting / Outside Work',
      icon: Briefcase,
      severity: moonlightingClause.severity_level || 'yellow',
      levelText: moonlightingClause.title,
      desc: moonlightingClause.plain_explanation,
      source: moonlightingClause.source_reference,
      impact: 'Important Clause',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Employment &amp; NDA Restriction Heatmap
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                Cartographic Mapping
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Visual geographic boundary and restriction radius breakdown for {documentTitle}</p>
          </div>
        </div>
      </div>

      {/* Cartographic Visual Radius Map Widget */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
        {/* SVG Cartographic Geographic Radial Map */}
        <div className="relative w-52 h-52 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-30 rounded-full" />

          <svg className="w-52 h-52 text-slate-400 dark:text-slate-700 transform -rotate-45" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-600" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-500" />

            <circle cx="100" cy="100" r="65" fill="rgba(244, 63, 94, 0.12)" stroke="#f43f5e" strokeWidth="1.5" />

            <line x1="10" y1="100" x2="190" y2="100" stroke="#cbd5e1" strokeWidth="0.8" className="dark:stroke-slate-700" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="#cbd5e1" strokeWidth="0.8" className="dark:stroke-slate-700" />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold font-mono text-rose-700 dark:text-rose-300 mt-1 bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded border border-rose-500/30">
              HQ (Origin)
            </span>
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[9px] font-mono text-slate-600 dark:text-slate-400">
            <Navigation className="w-3 h-3 text-indigo-600 dark:text-indigo-400 transform rotate-45" />
            <span>N</span>
          </div>
        </div>

        {/* Cartographic Legend & Boundary Breakdown */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Cartographic Legend &amp; Restriction Zones
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30">
              <span className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                🔴 Restricted Geographic Radius
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">25-Mile Territory</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30">
              <span className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                🟠 12-Month Non-Compete Window
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">Post-Termination</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
              <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                🟢 Unrestricted Exterior Zone
              </span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">&gt; 25 Miles Distance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restrictions Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restrictions.map((item, idx) => {
          const Icon = item.icon;
          const cardStyle =
            item.severity === 'red'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
              : item.severity === 'orange'
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'
              : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300';

          return (
            <div key={idx} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-200">
                  <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {item.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {item.impact}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.levelText}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <HoverGlossaryText text={item.desc} />
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span>Verbatim Source Reference:</span>
                <span className="font-bold underline">{item.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
