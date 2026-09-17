'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield, Lock, Eye, AlertCircle, FileText, CheckCircle2, RotateCw } from 'lucide-react';

export default function PublicSharedSummaryPage() {
  const params = useParams();
  const token = (params?.token as string) || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);

  const fetchSharedData = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shared/${token}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'This link is invalid or expired.');
      } else {
        setShareData(json.data);
      }
    } catch (err) {
      setError('Failed to load shared summary.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSharedData();
  }, [fetchSharedData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Verifying secure summary link token...</div>
        ) : error ? (
          <div className="p-8 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <h2 className="font-bold text-base">Access Denied / Invalid Link</h2>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchSharedData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Read-Only Shared Summary
                </span>
                <span className="text-xs text-slate-500">
                  Scope: Summary & X-Ray Scorecard Only
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {shareData.document.title}
              </h1>
              <p className="text-xs text-slate-500 capitalize">
                Document Type: {shareData.document.document_type.replace('_', ' ')} | Jurisdiction: {shareData.document.jurisdiction || 'Jurisdiction-Neutral'}
              </p>
            </div>

            {/* Plain-Language Summary Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Executive Summary
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {shareData.summaryText}
              </p>

              {shareData.keyTakeaways && shareData.keyTakeaways.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-500">Key Takeaways</h3>
                  <ul className="space-y-1.5">
                    {shareData.keyTakeaways.map((point: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* X-Ray Scorecards */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Legal X-Ray Risk Scorecard
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 text-center">
                  <span className="text-2xl font-bold text-rose-600">{shareData.xrayOverview.critical_count}</span>
                  <span className="block text-[11px] font-semibold text-rose-700 dark:text-rose-300">Red Flags</span>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900 text-center">
                  <span className="text-2xl font-bold text-orange-600">{shareData.xrayOverview.attention_count}</span>
                  <span className="block text-[11px] font-semibold text-orange-700 dark:text-orange-300">Orange Flags</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900 text-center">
                  <span className="text-2xl font-bold text-amber-600">{shareData.xrayOverview.important_count}</span>
                  <span className="block text-[11px] font-semibold text-amber-700 dark:text-amber-300">Yellow Flags</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900 text-center">
                  <span className="text-2xl font-bold text-emerald-600">{shareData.xrayOverview.general_count}</span>
                  <span className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Green Flags</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
