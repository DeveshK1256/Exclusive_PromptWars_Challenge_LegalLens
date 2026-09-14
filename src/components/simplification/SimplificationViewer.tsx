'use client';

import React, { useState } from 'react';
import { ComplexityLevel, DocumentSummary, GlossaryTerm } from '../../types/database';
import { BookOpen, FileText, CheckCircle2, AlertCircle, HelpCircle, Layers } from 'lucide-react';

interface SimplificationViewerProps {
  initialSummary: DocumentSummary;
  allSummaries?: Record<ComplexityLevel, DocumentSummary>;
  glossary: GlossaryTerm[];
  onLevelChange?: (level: ComplexityLevel) => void;
}

const LEVEL_LABELS: Record<ComplexityLevel, { label: string; desc: string; badge: string }> = {
  very_simple: {
    label: 'Very Simple',
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
  onLevelChange,
}) => {
  const [activeLevel, setActiveLevel] = useState<ComplexityLevel>(initialSummary.complexity_level || 'very_simple');

  const currentSummary = allSummaries ? allSummaries[activeLevel] : initialSummary;

  const handleLevelSelect = (level: ComplexityLevel) => {
    setActiveLevel(level);
    if (onLevelChange) onLevelChange(level);
  };

  return (
    <div className="space-y-6">
      {/* Header & Level Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Document Simplification Engine
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Adjust explanation complexity from plain language to formal legal terms.
            </p>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${LEVEL_LABELS[activeLevel].badge}`}
          >
            Level: {LEVEL_LABELS[activeLevel].label}
          </span>
        </div>

        {/* Complexity Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800" role="tablist" aria-label="Explanation Complexity Controls">
          {(Object.keys(LEVEL_LABELS) as ComplexityLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              role="tab"
              aria-selected={activeLevel === lvl}
              aria-label={`Select ${LEVEL_LABELS[lvl].label} complexity: ${LEVEL_LABELS[lvl].desc}`}
              onClick={() => handleLevelSelect(lvl)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all text-left border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeLevel === lvl
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="font-semibold">{LEVEL_LABELS[lvl].label}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{LEVEL_LABELS[lvl].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Text Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Executive Overview ({LEVEL_LABELS[activeLevel].label})
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          {currentSummary.summary_text}
        </p>
      </div>

      {/* Grid: Key Takeaways & Derived Obligations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Takeaways */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Key Takeaways
          </h3>
          <ul className="space-y-2.5">
            {currentSummary.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-semibold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Derived Obligations Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Summary of Obligations
            </h3>
            <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Derived from X-Ray
            </span>
          </div>
          <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/50 font-mono leading-relaxed">
            {currentSummary.obligations_summary}
          </div>
        </div>
      </div>

      {/* Key Terms Glossary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Key Terms Glossary ({glossary.length} defined terms)
        </h3>

        {glossary.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No specialized legal terms detected in this document section.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-2.5 px-3">Term</th>
                  <th className="py-2.5 px-3">Plain Definition</th>
                  <th className="py-2.5 px-3">Contextual Meaning</th>
                  <th className="py-2.5 px-3">Source Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {glossary.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-indigo-300 whitespace-nowrap">{g.term}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs">{g.plain_language_definition}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs">{g.contextual_meaning}</td>
                    <td className="py-3 px-3 text-indigo-400 font-mono whitespace-nowrap">
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded text-[11px] border border-indigo-500/20">
                        {g.source_reference}
                      </span>
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
