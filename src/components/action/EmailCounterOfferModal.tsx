'use client';

import React, { useState } from 'react';
import { Mail, Copy, Check, X, Sparkles, Send } from 'lucide-react';
import { XRayFindingCard } from '@/lib/xray/types';

interface EmailCounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding?: XRayFindingCard | null;
  documentTitle?: string;
}

export const EmailCounterOfferModal: React.FC<EmailCounterOfferModalProps> = ({
  isOpen,
  onClose,
  finding,
  documentTitle = 'Document',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const findingTitle = finding?.title || 'High-Impact Clause';
  const quoteSnippet = finding?.source_reference || 'Clause provisions';

  // Construct polite, professional counter-offer email
  const emailSubject = `Question regarding ${documentTitle} - ${findingTitle}`;
  const emailBody = `Hi [Name / Landlord / Hiring Manager],

Thank you for sending over ${documentTitle}. I am looking forward to working together!

While reviewing the agreement, I noticed the provision regarding ${findingTitle}:
"${quoteSnippet}"

To ensure we are aligned, I wanted to propose a small adjustment:
1. Shortening the notice / restriction window or adjusting the fee structure to standard industry terms.
2. Adding a mutual clarification that protects both parties.

Would you be open to this minor adjustment before we finalize and sign?

Best regards,
[Your Name]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Email Counter-Offer Generator
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                Polite Wording
              </span>
            </h3>
            <p className="text-xs text-slate-400">Negotiate high-impact or restrictive clauses professionally</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-300 font-medium">
            <span className="text-slate-400 block mb-1">Flagged Provision:</span>
            <span className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 block text-slate-200 italic line-clamp-2">
              "{quoteSnippet}"
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Suggested Email Wording:</label>
            <textarea
              readOnly
              rows={8}
              value={emailBody}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Counter-Offer Text
              </>
            )}
          </button>

          <a
            href={mailtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.97] text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Open Email App
          </a>
        </div>
      </div>
    </div>
  );
};
