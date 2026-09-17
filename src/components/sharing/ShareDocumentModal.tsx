'use client';

import React, { useState } from 'react';
import { createSharedLink, getStoredSharedLinks, revokeSharedLink, SharedLink } from '@/lib/sharing/shareStorage';
import { Share2, Lock, Copy, Check, Trash2, ShieldAlert, X } from 'lucide-react';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  userId?: string;
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  userId = 'user_demo',
}) => {
  const [expiryDays, setExpiryDays] = useState(7);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<SharedLink[]>(() =>
    getStoredSharedLinks().filter((l) => l.document_id === documentId && l.created_by_user_id === userId)
  );

  if (!isOpen) return null;

  const handleGenerate = () => {
    const { rawToken, link } = createSharedLink(userId, documentId, 'v1', expiryDays);
    const url = `${window.location.origin}/share/${rawToken}`;
    setGeneratedUrl(url);

    const updated = getStoredSharedLinks().filter((l) => l.document_id === documentId && l.created_by_user_id === userId);
    setLinks(updated);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = (linkId: string) => {
    revokeSharedLink(userId, linkId);
    const updated = getStoredSharedLinks().filter((l) => l.document_id === documentId && l.created_by_user_id === userId);
    setLinks(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Share Read-Only Summary</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Create a secure, rate-limited read-only summary link for <span className="font-bold">{documentTitle}</span>.
            Raw document text and downloads are strictly omitted.
          </p>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Link Expiry:</label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs rounded-lg px-3 py-1.5 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value={1}>1 Day</option>
              <option value={7}>7 Days (Default)</option>
              <option value={30}>30 Days</option>
            </select>
            <button
              onClick={handleGenerate}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Generate Link
            </button>
          </div>

          {generatedUrl && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 256-bit Secure Hex Token Link Created:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs px-2.5 py-1 font-mono text-slate-700 dark:text-slate-300"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Active Links List */}
          {links.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500">Active Shared Links</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {links.map((link) => (
                  <div key={link.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Token Hash: {link.token_hash.substring(0, 10)}...
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        Views: {link.view_count} | {link.revoked_at ? 'REVOKED' : `Expires: ${new Date(link.expires_at).toLocaleDateString()}`}
                      </span>
                    </div>
                    {!link.revoked_at && (
                      <button
                        onClick={() => handleRevoke(link.id)}
                        className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
