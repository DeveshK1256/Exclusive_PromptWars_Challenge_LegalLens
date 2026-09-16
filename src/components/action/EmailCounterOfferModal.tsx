'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, X, Send, AlertTriangle } from 'lucide-react';
import { XRayFindingCard } from '@/lib/xray/types';
import { sanitizeJurisdictionInference } from '@/lib/config';

interface EmailCounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  finding?: XRayFindingCard | null;
  documentTitle?: string;
  userJurisdiction?: string;
}

export const EmailCounterOfferModal: React.FC<EmailCounterOfferModalProps> = ({
  isOpen,
  onClose,
  finding,
  documentTitle = 'Document',
  userJurisdiction,
}) => {
  const [copied, setCopied] = useState(false);
  const [editedBody, setEditedBody] = useState('');

  const findingTitle = finding?.title || 'High-Impact Clause';
  const quoteSnippet = finding?.source_reference || 'Clause provisions';

  useEffect(() => {
    if (finding) {
      const rawDraft = `Hi [Name / Landlord / Hiring Manager],

Thank you for sending over ${documentTitle}. I am looking forward to working together!

While reviewing the agreement, I noticed the provision regarding ${findingTitle}:
"${quoteSnippet}"

To ensure we are aligned, I wanted to propose a small adjustment:
1. Shortening the notice / restriction window or adjusting the fee structure to standard industry terms.
2. Adding a mutual clarification that protects both parties.

Would you be open to this minor adjustment before we finalize and sign?

Best regards,
[Your Name]`;

      // Pass draft through sanitizeJurisdictionInference to preserve Decision 10 neutrality
      const sanitized = sanitizeJurisdictionInference(rawDraft, userJurisdiction);
      setEditedBody(sanitized);
    }
  }, [finding, documentTitle, userJurisdiction]);

  if (!isOpen) return null;

  const emailSubject = `Question regarding ${documentTitle} - ${findingTitle}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(editedBody)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Email Counter-Offer Generator
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                EDITABLE DRAFT / TEMPLATE ONLY
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Politely negotiate high-impact or restrictive clauses</p>
          </div>
        </div>

        {/* Legal Disclaimer Callout */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Legal Disclaimer:</strong> This AI-generated template is provided for informational and drafting assistance only. It does NOT constitute legal advice or formal representation. Always review and personalize before sending.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Grounded Provision (Source Reference):</span>
            <span className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 block text-slate-800 dark:text-slate-200 italic line-clamp-2">
              "{quoteSnippet}"
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="counter-offer-textarea" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Editable Email Draft:</label>
              <span className="text-[10px] text-slate-500 font-mono">You can edit text directly below</span>
            </div>
            <textarea
              id="counter-offer-textarea"
              rows={8}
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied Draft to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Draft Wording
              </>
            )}
          </button>

          <a
            href={mailtoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.97] text-slate-700 dark:text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Open Email App
          </a>
        </div>
      </div>
    </div>
  );
};
