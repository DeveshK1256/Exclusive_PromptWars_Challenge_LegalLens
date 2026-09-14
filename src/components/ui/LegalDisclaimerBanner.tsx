import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  return (
    <div
      className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200 overflow-hidden relative"
      role="region"
      aria-label="Legal Disclaimer and Product Safety Boundaries"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" aria-hidden="true" />
        <div className="overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee motion-reduce:animate-none font-medium space-x-8">
            <span>
              <strong className="font-bold text-amber-950 dark:text-amber-100">LegalLens AI Disclaimer:</strong> LegalLens AI provides general legal information and document assistance. It does <strong>not</strong> provide legal advice and does not replace a qualified legal professional.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
