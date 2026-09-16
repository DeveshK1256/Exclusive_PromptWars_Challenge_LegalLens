'use client';

import React from 'react';
import { FileText, Printer, Download, HelpCircle, Shield, CheckCircle2 } from 'lucide-react';
import { ActionPlanResult } from '@/lib/action/types';
import { LegalXRayOverview } from '@/lib/xray/types';

interface AttorneyPrepSheetProps {
  documentTitle?: string;
  documentType?: string;
  jurisdiction?: string;
  overview?: LegalXRayOverview;
  actionPlanData?: ActionPlanResult;
}

export const AttorneyPrepSheet: React.FC<AttorneyPrepSheetProps> = ({
  documentTitle = 'Document',
  documentType = 'Agreement',
  jurisdiction = 'Jurisdiction Neutral',
  overview,
  actionPlanData,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const highImpactFindings = overview?.findings.filter((f) => f.severity === 'red') || [];
  const lawyerQuestions = actionPlanData?.lawyerQuestions || [
    {
      question: `How is the primary restrictive clause in ${documentTitle} enforced under local ${jurisdiction} law?`,
      reason: 'Clarify legal enforceability and potential impact.',
      source_reference: 'Section 1',
    },
    {
      question: `What notice procedure or cure window applies if a dispute arises regarding ${documentTitle}?`,
      reason: 'Ensure compliance with required timeline procedures.',
      source_reference: 'Section 2',
    },
    {
      question: 'Are there any hidden financial penalties or fee escalations in this contract?',
      reason: 'Verify total monetary liability exposure.',
      source_reference: 'Section 3',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            1-Page "Attorney Prep Sheet" (Print / Export)
          </h2>
          <p className="text-xs text-slate-400">Export a clean summary packet with specific questions to ask a lawyer</p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Prep Sheet
        </button>
      </div>

      {/* Printable Sheet Card */}
      <div id="printable-attorney-sheet" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-100 shadow-sm print:bg-white print:text-black print:p-0 print:border-none">
        {/* Header Header */}
        <div className="border-b border-slate-800 print:border-gray-300 pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400 print:text-blue-600" />
              <h3 className="text-lg font-bold text-slate-100 print:text-black">LegalLens AI — Attorney Consultation Prep Sheet</h3>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
              Document: <strong className="text-slate-200 print:text-black">{documentTitle}</strong> ({documentType}) | Jurisdiction: {jurisdiction}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 print:bg-gray-100 print:text-gray-800 px-2 py-1 rounded border border-indigo-500/20">
            Prep Packet
          </span>
        </div>

        {/* High-Impact Flags Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 print:text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔴 Primary High-Impact Clauses Identified ({highImpactFindings.length})</span>
          </h4>
          {highImpactFindings.length > 0 ? (
            <div className="space-y-2">
              {highImpactFindings.map((f, i) => (
                <div key={i} className="bg-slate-950 print:bg-gray-50 p-3 rounded-xl border border-slate-800 print:border-gray-300 text-xs space-y-1">
                  <div className="font-bold text-rose-400 print:text-red-700">{f.title}</div>
                  <div className="text-slate-300 print:text-gray-800">{f.description}</div>
                  <div className="text-[11px] text-slate-400 print:text-gray-600 font-mono italic">Source: "{f.source_reference}"</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-950 print:bg-gray-50 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
              Standard contract terms identified. No critical high-impact red flags detected.
            </div>
          )}
        </div>

        {/* Top Questions to Ask Attorney */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 print:text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-400 print:text-blue-600" />
            <span>Top 3–5 Specific Questions for Legal Counsel</span>
          </h4>
          <div className="space-y-2.5">
            {lawyerQuestions.map((q, idx) => (
              <div key={idx} className="bg-slate-950 print:bg-gray-50 p-3.5 rounded-xl border border-slate-800 print:border-gray-300 text-xs space-y-1">
                <div className="font-bold text-slate-100 print:text-black flex items-start gap-2">
                  <span className="text-indigo-400 print:text-blue-600 font-mono">Q{idx + 1}:</span>
                  <span>{q.question}</span>
                </div>
                {q.reason && (
                  <p className="text-slate-400 print:text-gray-600 pl-6 text-[11px]">
                    <strong>Why Ask:</strong> {q.reason}
                  </p>
                )}
                {q.source_reference && (
                  <p className="text-slate-500 print:text-gray-500 pl-6 text-[10px] font-mono italic">
                    Referenced Quote: "{q.source_reference}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Footer Disclaimer */}
        <div className="pt-3 border-t border-slate-800 print:border-gray-300 text-[10px] text-slate-500 print:text-gray-500 flex items-center justify-between">
          <span>Generated by LegalLens AI — Informational Preparation Packet</span>
          <span>Does not replace professional legal advice.</span>
        </div>
      </div>
    </div>
  );
};
