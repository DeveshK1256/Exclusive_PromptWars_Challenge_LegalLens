'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  FileText,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  CheckSquare,
  Lock,
} from 'lucide-react';
import { ContractComparisonResult, ComparisonFinding } from '@/lib/comparison/types';

export default function ComparePage() {
  const [docAId, setDocAId] = useState('doc_emp_2026_v1');
  const [docBId, setDocBId] = useState('doc_emp_2026_v2');
  const [docATitle, setDocATitle] = useState('Standard_Employment_Agreement_2026.pdf');
  const [docBTitle, setDocBTitle] = useState('Revised_Offer_Letter_2026.pdf');

  const [rawTextA, setRawTextA] = useState(
    `EMPLOYMENT AGREEMENT (Original Version)
1. Compensation: Annual salary of $120,000 paid bi-weekly.
2. Termination Notice: Either party may terminate this agreement upon 30 days written notice.
3. Non-Compete: Employee agrees not to engage in competing business within 25 miles of San Francisco for 6 months post-employment.`
  );

  const [rawTextB, setRawTextB] = useState(
    `EMPLOYMENT AGREEMENT (Revised Version)
1. Compensation: Annual salary of $120,000 paid bi-weekly plus target bonus of $15,000.
2. Termination Notice: Either party may terminate this agreement upon 14 days written notice.
3. Non-Compete: Employee agrees not to engage in competing business worldwide for 24 months post-employment.
4. Remote Work: Employee is permitted 2 days per week flexible remote work with manager approval.`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ContractComparisonResult | null>(null);

  const handleRunComparison = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentAId: docAId,
          documentBId: docBId,
          rawTextA,
          rawTextB,
          titleA: docATitle,
          titleB: docBTitle,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to compare documents');
      }

      setComparisonResult(resJson.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while executing contract comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string, kind: string) => {
    switch (severity) {
      case 'red':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Red High Severity: </span>
            [RED: High Severity] HIGH IMPACT • {kind.toUpperCase()}
          </span>
        );
      case 'orange':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Orange Attention Area: </span>
            [ORANGE: Attention Area] MODIFIED CLAUSE • {kind.toUpperCase()}
          </span>
        );
      case 'yellow':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full flex items-center gap-1">
            <HelpCircle className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Yellow Review Needed: </span>
            [YELLOW: Review Needed] ATTENTION AREA • {kind.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Green Standard Provision: </span>
            [GREEN: Standard Provision] ADDED / STANDARD • {kind.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Contract Comparison Engine
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Compare two legal document versions side-by-side to highlight clause modifications, risk alterations, and key differences.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRunComparison}
          disabled={isLoading}
          aria-label="Run side-by-side contract comparison"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              Comparing Contracts...
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" aria-hidden="true" />
              Run Side-by-Side Comparison
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm flex items-center gap-3" role="alert" aria-live="assertive">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dual Document Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Document Version A (Base)</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> RLS Owned</span>
          </div>
          <div className="space-y-2">
            <label htmlFor="doc-a-title" className="sr-only">Document A Title</label>
            <input
              id="doc-a-title"
              type="text"
              value={docATitle}
              onChange={(e) => setDocATitle(e.target.value)}
              aria-label="Document A Title"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor="doc-a-text" className="sr-only">Document A Raw Content</label>
            <textarea
              id="doc-a-text"
              rows={4}
              value={rawTextA}
              onChange={(e) => setRawTextA(e.target.value)}
              placeholder="Paste raw text for Document A..."
              aria-label="Document A Raw Content"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Document B */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Document Version B (Target / Revision)</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" aria-hidden="true" /> RLS Owned</span>
          </div>
          <div className="space-y-2">
            <label htmlFor="doc-b-title" className="sr-only">Document B Title</label>
            <input
              id="doc-b-title"
              type="text"
              value={docBTitle}
              onChange={(e) => setDocBTitle(e.target.value)}
              aria-label="Document B Title"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="doc-b-text" className="sr-only">Document B Raw Content</label>
            <textarea
              id="doc-b-text"
              rows={4}
              value={rawTextB}
              onChange={(e) => setRawTextB(e.target.value)}
              placeholder="Paste raw text for Document B..."
              aria-label="Document B Raw Content"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult ? (
        <div className="space-y-6">
          {/* Degraded / Fallback Mode Warning Banner */}
          {comparisonResult.degraded && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <strong className="block font-bold text-amber-950 dark:text-amber-300 text-sm">
                  AI-Powered Comparison Temporarily Unavailable
                </strong>
                Showing a basic keyword comparison (fallback mode). Please try again shortly for full Gemini AI reasoning.
              </div>
            </div>
          )}

          {/* Summary Overview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Comparison Summary
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>Model: <span className="text-slate-900 dark:text-slate-200 font-mono">{comparisonResult.modelUsed}</span></span>
                <span>•</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  comparisonResult.analysis_mode === 'ai'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {comparisonResult.analysis_mode === 'ai' ? 'LIVE AI MODE' : 'HEURISTIC FALLBACK MODE'}
                </span>
                <span>•</span>
                <span>Token Usage: {comparisonResult.tokenUsage}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 block">Identified Differences</span>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{comparisonResult.differencesCount}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-600 dark:text-slate-400 block">Matching Provisions</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{comparisonResult.similaritiesCount}</span>
              </div>
            </div>
          </div>

          {/* Semantic Clause Differences List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Semantic Clause Differences ({comparisonResult.findings.length} Items Found)
            </h3>

            <div className="space-y-4">
              {comparisonResult.findings.map((f, idx) => (
                <div
                  key={f.id || idx}
                  className={`bg-slate-50 dark:bg-slate-950 border rounded-xl p-4 space-y-3 ${
                    f.severity_level === 'red'
                      ? 'border-red-500/30'
                      : f.severity_level === 'orange'
                      ? 'border-amber-500/30'
                      : f.severity_level === 'yellow'
                      ? 'border-yellow-500/30'
                      : 'border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {getSeverityBadge(f.severity_level, f.finding_kind)}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Category: {f.category}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.title}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold block mb-1">Doc A ({docATitle}):</span>
                      <p className="text-slate-800 dark:text-slate-200">{f.document_a_value}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-2">Ref: {f.source_reference_a}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-purple-300 dark:border-purple-500/30">
                      <span className="text-purple-600 dark:text-purple-300 font-semibold block mb-1">Doc B ({docBTitle}):</span>
                      <p className="text-slate-800 dark:text-slate-200">{f.document_b_value}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-2">Ref: {f.source_reference_b}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <strong className="text-indigo-600 dark:text-indigo-400">Difference Analysis: </strong> {f.difference_summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lawyer Questions & Action Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Questions for Legal Professional */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Questions for a Legal Professional
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {comparisonResult.questionsForLawyer.map((q, idx) => (
                  <li key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action Items */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Recommended Action Items
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {comparisonResult.recommendedActionItems.map((item, idx) => (
                  <li key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
          <GitCompare className="w-12 h-12 text-indigo-500/50 dark:text-indigo-400/50 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">Ready to Compare Contracts</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Click &quot;Run Side-by-Side Comparison&quot; to execute semantic clause matching, risk alteration detection, and missing section analysis using the Gemini reasoning model.
          </p>
        </div>
      )}
    </div>
  );
}
