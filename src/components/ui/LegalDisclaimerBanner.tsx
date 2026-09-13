import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs sm:text-sm text-amber-900 flex items-center justify-center gap-2 text-center" role="region" aria-label="Legal Disclaimer">
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span>
        <strong>Legal Lens AI Disclaimer:</strong> LegalLens AI provides general legal information and document assistance. It does <strong>not</strong> provide legal advice and does not replace a qualified legal professional.
      </span>
    </div>
  );
};
