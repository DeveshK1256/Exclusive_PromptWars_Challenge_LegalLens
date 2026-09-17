'use client';

import React from 'react';
import { DocumentDiffResult, DiffHunk } from '@/lib/diff/documentDiff';
import { FileCode, PlusCircle, MinusCircle, FileText, Sparkles, CheckCircle } from 'lucide-react';

interface DocumentRedlineViewerProps {
  diff: DocumentDiffResult;
  titleA?: string;
  titleB?: string;
}

export const DocumentRedlineViewer: React.FC<DocumentRedlineViewerProps> = ({
  diff,
  titleA = 'Version 1',
  titleB = 'Version 2',
}) => {
  return (
    <div className="space-y-6 w-full">
      {/* Header Summary & Metrics */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCode className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              Document Redline Diff: {titleA} vs {titleB}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic line-by-line redline comparison across document versions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <PlusCircle className="w-3.5 h-3.5" />+{diff.addedLinesCount} Added
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <MinusCircle className="w-3.5 h-3.5" />-{diff.deletedLinesCount} Removed
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {diff.unchangedLinesCount} Unchanged
            </span>
          </div>
        </div>

        {/* AI Grounded Summary */}
        <div className="p-4 bg-brand-50/60 dark:bg-brand-950/40 rounded-lg border border-brand-200 dark:border-brand-900 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-brand-800 dark:text-brand-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Grounded Change Summary
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-200 dark:bg-brand-900 text-brand-900 dark:text-brand-200">
              {diff.summary.modeLabel}
            </span>
          </div>
          <p>{diff.summary.text}</p>
          {diff.summary.sourceReferences.length > 0 && (
            <div className="pt-2 border-t border-brand-200/60 dark:border-brand-900/60 text-[11px] text-slate-500">
              <span className="font-semibold">Source Pointers:</span> {diff.summary.sourceReferences.join(' | ')}
            </div>
          )}
        </div>
      </div>

      {/* Redline Code View */}
      <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-md overflow-hidden font-mono text-xs">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-slate-400 flex items-center justify-between text-[11px]">
          <span>REDLINE COMPARISON VIEW</span>
          <span>GREEN = ADDITION | RED = DELETION</span>
        </div>
        <div className="p-4 overflow-x-auto space-y-1">
          {diff.hunks.map((hunk, idx) => {
            if (hunk.type === 'added') {
              return (
                <div key={idx} className="bg-emerald-950/70 text-emerald-300 px-3 py-1 rounded flex items-start gap-3 border-l-4 border-emerald-500">
                  <span className="select-none text-emerald-500 font-bold shrink-0">+</span>
                  <span className="select-none text-slate-500 w-8 text-right shrink-0">{hunk.lineNumberNew}</span>
                  <span className="whitespace-pre-wrap">{hunk.text}</span>
                </div>
              );
            } else if (hunk.type === 'deleted') {
              return (
                <div key={idx} className="bg-rose-950/70 text-rose-300 px-3 py-1 rounded flex items-start gap-3 border-l-4 border-rose-500 line-through opacity-80">
                  <span className="select-none text-rose-500 font-bold shrink-0">-</span>
                  <span className="select-none text-slate-500 w-8 text-right shrink-0">{hunk.lineNumberOld}</span>
                  <span className="whitespace-pre-wrap">{hunk.text}</span>
                </div>
              );
            } else {
              return (
                <div key={idx} className="text-slate-400 px-3 py-0.5 flex items-start gap-3 hover:bg-slate-800/50 rounded">
                  <span className="select-none text-slate-600 shrink-0">&nbsp;</span>
                  <span className="select-none text-slate-600 w-8 text-right shrink-0">{hunk.lineNumberNew}</span>
                  <span className="whitespace-pre-wrap">{hunk.text}</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
