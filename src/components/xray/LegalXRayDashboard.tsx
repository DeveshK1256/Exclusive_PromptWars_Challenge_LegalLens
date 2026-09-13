'use client';

import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Clock, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { LegalXRayOverview, XRayFindingCard } from '@/lib/xray/types';

interface LegalXRayDashboardProps {
  overview: LegalXRayOverview;
}

export const LegalXRayDashboard: React.FC<LegalXRayDashboardProps> = ({ overview }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'red' | 'orange' | 'yellow' | 'green'>('all');
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

  const filteredFindings = selectedFilter === 'all'
    ? overview.findings
    : overview.findings.filter((f) => f.severity === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Overview Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedFilter('red')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedFilter === 'red' ? 'ring-2 ring-red-500 bg-red-50/50' : 'bg-white hover:bg-slate-50'
          } border-red-200`}
        >
          <div className="flex justify-between items-center text-red-600 mb-1">
            <AlertOctagon className="w-5 h-5" />
            <span className="text-2xl font-extrabold">{overview.high_impact_count}</span>
          </div>
          <p className="text-xs font-bold text-red-900">High-Impact Areas</p>
          <p className="text-[11px] text-red-700">🔴 Urgent attention</p>
        </button>

        <button
          onClick={() => setSelectedFilter('orange')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedFilter === 'orange' ? 'ring-2 ring-orange-500 bg-orange-50/50' : 'bg-white hover:bg-slate-50'
          } border-orange-200`}
        >
          <div className="flex justify-between items-center text-orange-600 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-2xl font-extrabold">{overview.attention_area_count}</span>
          </div>
          <p className="text-xs font-bold text-orange-900">Attention Areas</p>
          <p className="text-[11px] text-orange-700">🟠 Review carefully</p>
        </button>

        <button
          onClick={() => setSelectedFilter('yellow')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedFilter === 'yellow' ? 'ring-2 ring-amber-500 bg-amber-50/50' : 'bg-white hover:bg-slate-50'
          } border-amber-200`}
        >
          <div className="flex justify-between items-center text-amber-600 mb-1">
            <Info className="w-5 h-5" />
            <span className="text-2xl font-extrabold">{overview.important_count}</span>
          </div>
          <p className="text-xs font-bold text-amber-900">Important Clauses</p>
          <p className="text-[11px] text-amber-700">🟡 Key provisions</p>
        </button>

        <button
          onClick={() => setSelectedFilter('green')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedFilter === 'green' ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : 'bg-white hover:bg-slate-50'
          } border-emerald-200`}
        >
          <div className="flex justify-between items-center text-emerald-600 mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-2xl font-extrabold">{overview.general_count}</span>
          </div>
          <p className="text-xs font-bold text-emerald-900">General Terms</p>
          <p className="text-[11px] text-emerald-700">🟢 Standard provisions</p>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Findings ({overview.findings.length})
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{overview.deadlines_count} Deadlines</span>
          </span>
          <span className="flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
            <span>{overview.action_items_count} Action Items</span>
          </span>
        </div>
      </div>

      {/* Finding Cards List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <FindingCardItem
            key={finding.id}
            finding={finding}
            isExpanded={activeFindingId === finding.id}
            onToggle={() => setActiveFindingId(activeFindingId === finding.id ? null : finding.id)}
          />
        ))}
      </div>
    </div>
  );
};

const FindingCardItem: React.FC<{ finding: XRayFindingCard; isExpanded: boolean; onToggle: () => void }> = ({
  finding,
  isExpanded,
  onToggle,
}) => {
  const severityStyles = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-800', icon: AlertOctagon },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800', icon: Info },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  }[finding.severity];

  const IconComp = severityStyles.icon;

  return (
    <div className={`bg-white rounded-2xl border ${severityStyles.border} shadow-sm overflow-hidden transition-all`}>
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2.5 rounded-xl ${severityStyles.badge}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base">{finding.title}</h4>

                {/* Finding Kind Badge */}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                  {finding.finding_kind.replace('_', ' ')}
                </span>

                {/* Finding Type Tag (Fact vs AI Interpretation vs Recommendation) */}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                  finding.finding_type === 'fact' ? 'bg-blue-100 text-blue-800' : finding.finding_type === 'recommendation' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {finding.finding_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{finding.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-500" title="Source Confidence">
              {(finding.confidence * 100).toFixed(0)}% conf
            </span>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Grounded Source Evidence Drawer */}
      {isExpanded && (
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>Document Source Evidence (Verbatim Citation)</span>
          </div>
          <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 font-mono leading-relaxed">
            {finding.source_reference}
          </p>
        </div>
      )}
    </div>
  );
};
