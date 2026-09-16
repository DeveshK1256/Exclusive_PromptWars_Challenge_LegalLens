'use client';

import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Clock, ShieldAlert, FileText, ChevronRight, Mail, Printer } from 'lucide-react';
import { LegalXRayOverview, XRayFindingCard } from '@/lib/xray/types';
import { SafetyScoreGauge } from '@/components/xray/SafetyScoreGauge';
import { TermsOfServiceScorecard } from '@/components/xray/TermsOfServiceScorecard';
import { RentalAndLoanScorecard } from '@/components/xray/RentalAndLoanScorecard';
import { EmploymentHeatmap } from '@/components/xray/EmploymentHeatmap';
import { EmailCounterOfferModal } from '@/components/action/EmailCounterOfferModal';
import { AttorneyPrepSheet } from '@/components/action/AttorneyPrepSheet';
import { DocumentSpatial3DMap } from '@/components/3d/DocumentSpatial3DMap';

interface LegalXRayDashboardProps {
  overview: LegalXRayOverview;
  documentTitle?: string;
  documentType?: string;
  jurisdiction?: string;
}

export const LegalXRayDashboard: React.FC<LegalXRayDashboardProps> = ({
  overview,
  documentTitle = 'Uploaded Document',
  documentType = 'rental_lease',
  jurisdiction = 'Jurisdiction Neutral',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'red' | 'orange' | 'yellow' | 'green'>('all');
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [activeCounterFinding, setActiveCounterFinding] = useState<XRayFindingCard | null>(null);

  const filteredFindings = selectedFilter === 'all'
    ? overview.findings
    : overview.findings.filter((f) => f.severity === selectedFilter);

  const handleOpenCounterOffer = (finding: XRayFindingCard) => {
    setActiveCounterFinding(finding);
    setCounterModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Overall Safety Score Gauge */}
      <SafetyScoreGauge
        highImpactCount={overview.high_impact_count}
        attentionAreaCount={overview.attention_area_count}
      />

      {/* 2. Dynamic Domain Scorecard / Heatmap based on documentType */}
      {(documentType === 'tos_privacy_policy' || documentType === 'terms_of_service' || documentType === 'privacy_policy' || documentType === 'policy_document' || documentType.includes('terms') || documentType.includes('privacy')) && (
        <TermsOfServiceScorecard documentTitle={documentTitle} />
      )}

      {(documentType === 'rental_lease' || documentType === 'rental_agreement' || documentType === 'loan_document' || documentType === 'loan_agreement' || documentType === 'service_agreement' || documentType === 'service_contract') && (
        <RentalAndLoanScorecard documentTitle={documentTitle} documentType={documentType} />
      )}

      {(documentType === 'employment_contract' || documentType === 'nda') && (
        <EmploymentHeatmap documentTitle={documentTitle} />
      )}

      {/* 3D Spatial Document Layer Map Visualizer */}
      <DocumentSpatial3DMap
        documentTitle={documentTitle}
        documentType={documentType}
        findings={overview.findings}
      />

      {/* Overview Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" role="region" aria-label="Finding Severity Breakdown">
        <button
          type="button"
          onClick={() => setSelectedFilter('red')}
          aria-label={`Filter by Red High-Impact Areas: ${overview.high_impact_count} items`}
          className={`p-4 rounded-2xl border text-left transition-[transform,opacity,background-color,border-color] duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            selectedFilter === 'red'
              ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/50'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 mb-1">
            <AlertOctagon className="w-5 h-5" aria-hidden="true" />
            <span className="text-2xl font-extrabold">{overview.high_impact_count}</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">High-Impact Areas</p>
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">🔴 Urgent [High Impact]</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('orange')}
          aria-label={`Filter by Orange Attention Areas: ${overview.attention_area_count} items`}
          className={`p-4 rounded-2xl border text-left transition-[transform,opacity,background-color,border-color] duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
            selectedFilter === 'orange'
              ? 'ring-2 ring-orange-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 mb-1">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <span className="text-2xl font-extrabold">{overview.attention_area_count}</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Attention Areas</p>
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">🟠 Review [Attention Area]</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('yellow')}
          aria-label={`Filter by Yellow Important Clauses: ${overview.important_count} items`}
          className={`p-4 rounded-2xl border text-left transition-[transform,opacity,background-color,border-color] duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
            selectedFilter === 'yellow'
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 mb-1">
            <Info className="w-5 h-5" aria-hidden="true" />
            <span className="text-2xl font-extrabold">{overview.important_count}</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Important Clauses</p>
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">🟡 Key [Important Clause]</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('green')}
          aria-label={`Filter by Green General Terms: ${overview.general_count} items`}
          className={`p-4 rounded-2xl border text-left transition-[transform,opacity,background-color,border-color] duration-150 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
            selectedFilter === 'green'
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/50'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span className="text-2xl font-extrabold">{overview.general_count}</span>
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">General Terms</p>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">🟢 Standard [General Provision]</p>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
            }`}
          >
            All Findings ({overview.findings.length})
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>{overview.deadlines_count} Deadlines</span>
          </span>
          <span className="flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <span>{overview.action_items_count} Action Items</span>
          </span>
        </div>
      </div>

      {/* Finding Cards List */}
      <div className="space-y-4" role="region" aria-label="Legal X-Ray Findings List">
        {filteredFindings.map((finding) => (
          <FindingCardItem
            key={finding.id}
            finding={finding}
            isExpanded={activeFindingId === finding.id}
            onToggle={() => setActiveFindingId(activeFindingId === finding.id ? null : finding.id)}
            onCounterOffer={() => handleOpenCounterOffer(finding)}
          />
        ))}
      </div>

      {/* 3. Attorney Prep Sheet PDF / Printable Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <AttorneyPrepSheet
          documentTitle={documentTitle}
          documentType={documentType}
          jurisdiction={jurisdiction}
          overview={overview}
        />
      </div>

      {/* Email Counter-Offer Modal */}
      <EmailCounterOfferModal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        finding={activeCounterFinding}
        documentTitle={documentTitle}
      />
    </div>
  );
};

const FindingCardItem: React.FC<{
  finding: XRayFindingCard;
  isExpanded: boolean;
  onToggle: () => void;
  onCounterOffer: () => void;
}> = ({ finding, isExpanded, onToggle, onCounterOffer }) => {
  const severityStyles = {
    red: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-500/30', text: 'text-rose-900 dark:text-rose-200', badge: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20', label: 'High Impact / Urgent', icon: AlertOctagon },
    orange: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-900 dark:text-amber-200', badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', label: 'Attention Area / Review', icon: AlertTriangle },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-900 dark:text-amber-200', badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', label: 'Important / Key Term', icon: Info },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-900 dark:text-emerald-200', badge: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', label: 'General / Standard Term', icon: CheckCircle2 },
  }[finding.severity];

  const IconComp = severityStyles.icon;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border ${severityStyles.border} shadow-sm overflow-hidden transition-all`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={`finding-evidence-${finding.id}`}
          aria-label={`${finding.title} - Severity: ${severityStyles.label}. Click to ${isExpanded ? 'collapse' : 'expand'} verbatim source citation.`}
          className="flex-1 text-left focus:outline-none flex items-start space-x-3 group"
        >
          <div className={`p-2.5 rounded-xl border ${severityStyles.badge} shrink-0 mt-0.5`}>
            <IconComp className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{finding.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${severityStyles.badge}`}>
                [{severityStyles.label}]
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
                Kind: {finding.finding_kind.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{finding.description}</p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0 sm:pt-1">
          {finding.severity === 'red' && (
            <button
              type="button"
              onClick={onCounterOffer}
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              Counter-Offer
            </button>
          )}

          <button
            type="button"
            onClick={onToggle}
            aria-label={`Toggle verbatim source citation details for ${finding.title}`}
            aria-expanded={isExpanded}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Grounded Source Evidence Drawer */}
      {isExpanded && (
        <div id={`finding-evidence-${finding.id}`} className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2" role="region" aria-label={`Evidence Citation for ${finding.title}`}>
          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-300">
            <div className="flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>Document Source Evidence (Verbatim Citation)</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
              {(finding.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>
          <p className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
            {finding.source_reference}
          </p>
        </div>
      )}
    </div>
  );
};
