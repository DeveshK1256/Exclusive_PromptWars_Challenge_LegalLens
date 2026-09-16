'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const LEGAL_GLOSSARY_DICTIONARY: Record<string, { term: string; definition: string }> = {
  indemnification: {
    term: 'Indemnification',
    definition: 'An agreement where you promise to pay for losses or legal fees if the other party gets sued.',
  },
  indemnify: {
    term: 'Indemnify',
    definition: 'To promise to cover financial losses or legal costs if damage or lawsuits occur.',
  },
  severability: {
    term: 'Severability',
    definition: 'Ensures that if one clause is found illegal or invalid, the rest of the contract stays active.',
  },
  'liquidated damages': {
    term: 'Liquidated Damages',
    definition: 'A pre-set fixed dollar amount that must be paid as a penalty if a contract rule is broken.',
  },
  arbitration: {
    term: 'Arbitration',
    definition: 'Resolving legal disputes privately with an arbiter instead of going to a public court or jury.',
  },
  'class action': {
    term: 'Class Action Waiver',
    definition: 'Giving up your right to join other people in a combined group lawsuit against the company.',
  },
  'non-compete': {
    term: 'Non-Compete Clause',
    definition: 'A rule preventing you from working for competing businesses for a set time and geographic area.',
  },
  compete: {
    term: 'Non-Compete',
    definition: 'Restrictions on working for or starting a business in the same industry.',
  },
  'governing law': {
    term: 'Governing Law',
    definition: 'Specifies which state or country’s laws will be used to interpret and enforce the contract.',
  },
  jurisdiction: {
    term: 'Jurisdiction',
    definition: 'The specific geographical location and court system that has authority over the agreement.',
  },
  'force majeure': {
    term: 'Force Majeure',
    definition: 'Excuses obligations during major unforeseeable disasters like earthquakes, wars, or floods.',
  },
  subletting: {
    term: 'Subletting',
    definition: 'Renting out your leased apartment or property to a third party while your lease is active.',
  },
  sublet: {
    term: 'Sublet',
    definition: 'Transferring temporary occupancy of your rental space to another person.',
  },
  biometrics: {
    term: 'Biometrics',
    definition: 'Personal physical data like face scans, fingerprints, or voice patterns used for identification.',
  },
  default: {
    term: 'Default',
    definition: 'Failing to meet a required contractual duty, such as missing a rent payment or deadline.',
  },
  confidentiality: {
    term: 'Confidentiality',
    definition: 'A strict requirement to keep proprietary business information or trade secrets private.',
  },
  moonlighting: {
    term: 'Moonlighting',
    definition: 'Taking on a second job or freelance work outside of primary employment hours.',
  },
};

interface HoverGlossaryTextProps {
  text: string;
  className?: string;
}

export const HoverGlossaryText: React.FC<HoverGlossaryTextProps> = ({ text, className = '' }) => {
  const [activeTermKey, setActiveTermKey] = useState<string | null>(null);

  if (!text) return null;

  // Search for dictionary terms inside the text string
  const termKeys = Object.keys(LEGAL_GLOSSARY_DICTIONARY);
  const regexPattern = new RegExp(`\\b(${termKeys.join('|')})\\b`, 'gi');

  const parts = text.split(regexPattern);

  return (
    <span className={`inline ${className}`}>
      {parts.map((part, idx) => {
        const lowerPart = part.toLowerCase();
        const entry = LEGAL_GLOSSARY_DICTIONARY[lowerPart];

        if (!entry) {
          return <span key={idx}>{part}</span>;
        }

        const isHovered = activeTermKey === lowerPart;

        return (
          <span key={idx} className="relative inline-block group">
            <button
              type="button"
              onMouseEnter={() => setActiveTermKey(lowerPart)}
              onMouseLeave={() => setActiveTermKey(null)}
              onClick={() => setActiveTermKey(activeTermKey === lowerPart ? null : lowerPart)}
              className="border-b-2 border-dotted border-indigo-400 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold cursor-help px-0.5 rounded hover:bg-indigo-500/10 transition-colors inline-flex items-center gap-0.5"
              aria-label={`Definition for ${entry.term}`}
            >
              {part}
              <HelpCircle className="w-3 h-3 text-indigo-400 opacity-70 group-hover:opacity-100 shrink-0 inline" />
            </button>

            {/* Hover Tooltip Popover */}
            {isHovered && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700 z-50 pointer-events-none space-y-1 text-left origin-bottom animate-in fade-in zoom-in-95 duration-150">
                <span className="font-bold text-indigo-400 block flex items-center justify-between">
                  <span>📖 {entry.term}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Plain Language</span>
                </span>
                <span className="block text-slate-300 leading-normal">{entry.definition}</span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
