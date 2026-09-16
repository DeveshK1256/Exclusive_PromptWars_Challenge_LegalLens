'use client';

import React from 'react';
import { ShieldAlert, MapPin, Clock, Lightbulb, Briefcase } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';

interface EmploymentHeatmapProps {
  documentTitle?: string;
}

export const EmploymentHeatmap: React.FC<EmploymentHeatmapProps> = ({
  documentTitle = 'Employment Contract / NDA',
}) => {
  const restrictions = [
    {
      category: 'Non-Compete Duration',
      icon: Clock,
      severity: 'red',
      levelText: '12 Months Post-Employment',
      desc: 'Restricts you from working for direct competitors for 1 full year after leaving the company.',
      impact: 'High Impact',
    },
    {
      category: 'Geographic Boundary',
      icon: MapPin,
      severity: 'orange',
      levelText: '25-Mile Radius (San Francisco)',
      desc: 'Applies within a 25-mile radius of company headquarters or active service territories.',
      impact: 'Attention Area',
    },
    {
      category: 'IP & Invention Assignment',
      icon: Lightbulb,
      severity: 'red',
      levelText: '100% Comprehensive Assignment',
      desc: 'All work products, code, ideas, and patents created during employment belong solely to the employer.',
      impact: 'High Impact',
    },
    {
      category: 'Moonlighting / Outside Work',
      icon: Briefcase,
      severity: 'yellow',
      levelText: 'Prior Manager Written Approval',
      desc: 'Secondary employment or freelance projects require explicit advance written consent from management.',
      impact: 'Important Clause',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Employment &amp; NDA Restriction Heatmap
              <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                Employment &amp; NDA Tailored
              </span>
            </h3>
            <p className="text-xs text-slate-400">Visual mapping of non-compete, geographic, IP, and moonlighting boundaries in {documentTitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restrictions.map((item, idx) => {
          const Icon = item.icon;
          const cardStyle =
            item.severity === 'red'
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              : item.severity === 'orange'
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300';

          return (
            <div key={idx} className={`p-4 rounded-xl border ${cardStyle} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Icon className="w-4 h-4 text-purple-400" />
                  {item.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-slate-950/60 border-slate-800 text-slate-300">
                  {item.impact}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-100">{item.levelText}</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <HoverGlossaryText text={item.desc} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
