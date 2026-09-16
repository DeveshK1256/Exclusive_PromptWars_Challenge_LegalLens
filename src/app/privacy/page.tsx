import React from 'react';
import Link from 'next/link';
import { Shield, Lock, EyeOff, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Strict Data Isolation Policy</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">LegalLens AI — Privacy &amp; Data Security Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Last Updated: September 2026 | Document Isolation &amp; Zero Public Model Training Commitment
        </p>
      </div>

      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Key Guarantees Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Zero Public Model Training</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your uploaded document content is NEVER used to train, fine-tune, or improve public AI foundational models.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Strict User Isolation &amp; RLS</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Every document is tied strictly to your user ID with Row-Level Security (RLS). No other user can access your documents.
            </p>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            1. Document Storage &amp; Encryption
          </h2>
          <p>
            All uploaded legal contracts, leases, and agreements are stored in private, signed-URL Supabase buckets. Documents are encrypted in transit via TLS 1.3 and at rest via AES-256 encryption.
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            2. Retention &amp; Soft-Delete Policies
          </h2>
          <p>
            You maintain full control over your data. Deleting a document from your dashboard triggers a soft-delete retention window, after which all document chunks, metadata, and vectors are permanently purged.
          </p>
        </section>
      </div>
    </div>
  );
}
