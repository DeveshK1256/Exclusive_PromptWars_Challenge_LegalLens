'use client';

import React, { useState } from 'react';
import { GitCompare, FileText, CheckCircle, AlertTriangle, ArrowRight, Shield } from 'lucide-react';

export default function ComparePage() {
  const [docA, setDocA] = useState('Standard_Employment_Agreement_2026.pdf');
  const [docB, setDocB] = useState('Revised_Offer_Letter_2026.pdf');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-indigo-400" />
          Contract Comparison Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compare two legal document versions side-by-side to highlight clause modifications, risk alterations, and key differences.
        </p>
      </div>

      {/* Document Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Document Version A</span>
          <div className="flex items-center space-x-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">{docA}</p>
              <p className="text-xs text-slate-400">Uploaded Feb 1, 2026 • Employment Contract</p>
            </div>
          </div>
        </div>

        {/* Document B */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Document Version B</span>
          <div className="flex items-center space-x-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <FileText className="w-5 h-5 text-purple-400" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">{docB}</p>
              <p className="text-xs text-slate-400">Uploaded Feb 14, 2026 • Amendment / Counter-offer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Comparison Findings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Semantic Clause Differences (2 Differences Found)
        </h3>

        <div className="space-y-4">
          {/* Finding 1 */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                MODIFIED CLAUSE • Orange Risk Increase
              </span>
              <span className="text-xs text-slate-400 font-mono">Category: Non-Compete Scope</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Doc A (Original):</span>
                <p className="text-slate-200">Non-compete restricted within 25 miles of San Francisco for 6 months post-employment.</p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-500/30">
                <span className="text-amber-300 font-semibold block mb-1">Doc B (Revised):</span>
                <p className="text-slate-200">Non-compete expanded to worldwide restriction for 24 months post-employment.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <strong className="text-indigo-400">Analysis: </strong> Document B significantly expands non-compete duration (6m $\rightarrow$ 24m) and geographic reach. Potential enforceability issue under California jurisdiction.
            </p>
          </div>

          {/* Finding 2 */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                ADDED CLAUSE • Green Informational
              </span>
              <span className="text-xs text-slate-400 font-mono">Category: Remote Work Allowance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Doc A (Original):</span>
                <p className="text-slate-400 italic">No explicit remote work provision.</p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/30">
                <span className="text-emerald-300 font-semibold block mb-1">Doc B (Revised):</span>
                <p className="text-slate-200">Employee permitted 2 days per week flexible remote work with manager approval.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <strong className="text-indigo-400">Analysis: </strong> Document B grants hybrid remote flexibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
