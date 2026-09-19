'use client';

import React, { useState } from 'react';
import { ComplexityLevel, DocumentSummary, GlossaryTerm } from '../../types/database';
import { BookOpen, FileText, CheckCircle2, AlertCircle, HelpCircle, Layers, Split, Eye, Check } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';

interface SimplificationViewerProps {
  initialSummary: DocumentSummary;
  allSummaries?: Record<ComplexityLevel, DocumentSummary>;
  glossary: GlossaryTerm[];
  rawText?: string;
  onLevelChange?: (level: ComplexityLevel) => void;
}

const LEVEL_LABELS: Record<ComplexityLevel, { label: string; desc: string; badge: string }> = {
  very_simple: {
    label: 'ELI5 / Very Simple',
    desc: '5th-grade plain English with direct everyday analogies.',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  student: {
    label: 'Student Overview',
    desc: 'Clear high-school level overview highlighting key provisions.',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  professional: {
    label: 'Professional',
    desc: 'Business-focused summary highlighting operational & financial terms.',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  legal_terminology: {
    label: 'Legal Breakdown',
    desc: 'Formal legal analysis retaining exact legal terms & definitions.',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
};

export const SimplificationViewer: React.FC<SimplificationViewerProps> = ({
  initialSummary,
  allSummaries,
  glossary,
  rawText = '',
  onLevelChange,
}) => {
  const [activeLevel, setActiveLevel] = useState<ComplexityLevel>(initialSummary?.complexity_level || 'very_simple');
  const [viewMode, setViewMode] = useState<'standard' | 'eli5_split'>('eli5_split');
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  const safeGlossary = Array.isArray(glossary) ? glossary : [];
  const currentSummary = (allSummaries && allSummaries[activeLevel])
    ? allSummaries[activeLevel]
    : (initialSummary || {
        complexity_level: 'very_simple',
        summary_text: '',
        key_takeaways: [],
        obligations_summary: '',
        confidence: 1.0,
      });
  const takeaways = Array.isArray(currentSummary?.key_takeaways) ? currentSummary.key_takeaways : [];

  const handleLevelSelect = (level: ComplexityLevel) => {
    setActiveLevel(level);
    if (onLevelChange) onLevelChange(level);
  };

  const rawParagraphs = (rawText || '')
    .split(/\r?\n\s*\r?\n|\n(?=[0-9]+\.)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 15);

  const clausesList = rawParagraphs.length > 0 ? rawParagraphs : [
    'STANDARD CONTRACT TERMS: The employee or tenant agrees to satisfy all primary obligations, notice windows, and payment schedules set forth in this agreement.',
    'TERMINATION AND NOTICE: Either party may terminate this agreement by providing formal written notice 30 to 60 days prior to contract expiration.',
    'GOVERNING LAW AND DISPUTES: Governed by local jurisdiction laws. Disputes resolved through legal arbitration procedures.',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Document Simplification Engine
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Translates legal text into plain language with interactive hover definitions and ELI5 side-by-side view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'eli5_split' ? 'standard' : 'eli5_split')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                viewMode === 'eli5_split'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              {viewMode === 'eli5_split' ? 'ELI5 Split-Screen Active' : 'Switch to ELI5 Split-Screen'}
            </button>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${LEVEL_LABELS[activeLevel].badge}`}>
              {LEVEL_LABELS[activeLevel].label}
            </span>
          </div>
        </div>

        {/* Complexity Level Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800" role="tablist" aria-label="Explanation Complexity Controls">
          {(Object.keys(LEVEL_LABELS) as ComplexityLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              role="tab"
              aria-selected={activeLevel === lvl}
              aria-label={`Select ${LEVEL_LABELS[lvl].label} complexity: ${LEVEL_LABELS[lvl].desc}`}
              onClick={() => handleLevelSelect(lvl)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition-all text-left border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeLevel === lvl
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-300 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-200">{LEVEL_LABELS[lvl].label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{LEVEL_LABELS[lvl].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ELI5 Split-Screen View */}
      {viewMode === 'eli5_split' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Split className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ELI5 (Explain Like I'm 5) Side-by-Side View
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any source snippet to highlight and verify in document text
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Pane: Original Legal Clauses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                <span>📄 Original Legal Clauses</span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Source Document</span>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {clausesList.map((clause, idx) => {
                  const isHighlighted = highlightedSnippet && clause.includes(highlightedSnippet);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                        isHighlighted
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 block mb-1">Clause {idx + 1}</span>
                      <HoverGlossaryText text={clause} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Simplified Conversational Explanation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                <span>💬 Simplified Plain-Language Summary</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">ELI5 Mode</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
                  <HoverGlossaryText text={currentSummary.summary_text} />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Click-to-Verify Source References
                  </span>
                  {safeGlossary.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHighlightedSnippet(g.source_reference)}
                      className="w-full text-left p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between group transition-colors shadow-xs"
                    >
                      <span className="truncate pr-2">🔍 Verify: {g.term} ({g.source_reference})</span>
                      <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Overview View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Executive Overview ({LEVEL_LABELS[activeLevel].label})
          </h3>
          <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <HoverGlossaryText text={currentSummary.summary_text} />
          </p>
        </div>
      )}

      {/* Grid: Key Takeaways & Derived Obligations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Key Takeaways
          </h3>
          <ul className="space-y-2.5">
            {takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span><HoverGlossaryText text={takeaway} /></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Summary of Obligations
            </h3>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
              Derived from X-Ray
            </span>
          </div>
          <div className="text-xs text-slate-800 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono leading-relaxed">
            <HoverGlossaryText text={currentSummary.obligations_summary} />
          </div>
        </div>
      </div>

      {/* Key Terms Glossary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Key Terms Glossary ({safeGlossary.length} defined terms)
        </h3>

        {safeGlossary.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No specialized legal terms detected in this document section.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950">
                  <th className="py-2.5 px-3">Term</th>
                  <th className="py-2.5 px-3">Plain Definition</th>
                  <th className="py-2.5 px-3">Contextual Meaning</th>
                  <th className="py-2.5 px-3">Source Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                {safeGlossary.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-300 whitespace-nowrap">{g.term}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs">{g.plain_language_definition}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs">{g.contextual_meaning}</td>
                    <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-mono whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('eli5_split');
                          setHighlightedSnippet(g.source_reference);
                        }}
                        className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2 py-0.5 rounded text-[11px] border border-indigo-200 dark:border-indigo-500/20 transition-colors cursor-pointer"
                      >
                        Verify: {g.source_reference}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
