import React from 'react';
import Link from 'next/link';
import { Shield, Eye, Compass, HelpCircle, ArrowRight, CheckCircle2, GitCompare, BookOpen, Calendar, ListChecks } from 'lucide-react';
import { Card3DPerspective } from '@/components/ui/Card3DPerspective';

export default function HomePage() {
  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 rounded-full text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>AI Legal Navigation Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Don&apos;t just read a legal document. <br className="hidden sm:inline" />
          <span className="text-brand-600 dark:text-brand-400">Understand what it means.</span>
        </h1>

        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          LegalLens AI transforms complex contracts, leases, and agreements into clear plain-language summaries, visual risk maps, grounded Q&amp;A, and practical preparation plans.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 rounded-xl shadow-sm transition-colors group"
          >
            <span>Analyze Your Document</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
          >
            <span>Learn How It Works</span>
            <Compass className="w-4 h-4 ml-2 text-slate-500 dark:text-slate-400 group-hover:rotate-45 transition-transform" />
          </Link>
        </div>

        {/* Interactive Demo Sandbox (No Login Required) */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            ⚡ Interactive Demo Sandbox (No Login Required)
          </span>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/dashboard?sample=rental_lease"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <span>🏠 Try Sample Rental Lease</span>
            </Link>
            <Link
              href="/dashboard?sample=employment_contract"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <span>💼 Try Sample Employment Contract</span>
            </Link>
            <Link
              href="/dashboard?sample=tos_privacy_policy"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <span>🔒 Try Sample App ToS &amp; Privacy Policy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* All 7 Use Cases — aligned with "AI for Legal Assistance & Access" challenge */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            7 Ways LegalLens AI Helps You
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base">
            Covering every use case in the AI for Legal Assistance &amp; Access challenge — all findings grounded in document source text.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Use Case 1: Simplification */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Use Case 1</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Simplify Legal Documents</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                4 reading-level summaries from 5th-grade plain English to Legal Terminology. Plus Key Terms Glossary and Obligations Summary.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 2: Compare */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <GitCompare className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Use Case 2</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Compare Contracts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Semantic clause-by-clause comparison between two documents. Detects modified clauses, risk changes, and missing provisions.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 3: Legal X-Ray */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Use Case 3</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Highlight Clauses &amp; Risks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Legal X-Ray classifies findings by severity (🟢🟡🟠🔴) and kind (informational / action required / deadline) with verbatim source citations.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 4: Grounded Q&A */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Use Case 4</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Answer Questions from Documents</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Grounded Q&amp;A with vector retrieval. Every answer cites exact source paragraphs. Zero-hallucination gate prevents fabricated answers.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 5: Personal Impact */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Use Case 5</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Understand Your Options</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Personal Impact reframes every finding for your role (Employee, Tenant, Freelancer, Consumer). Action Plan guides your next steps.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 6: Checklists */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ListChecks className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Use Case 6</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Generate Checklists &amp; Outputs</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                "Before You Sign" checklist, 1-click .ics calendar deadline export, and Portfolio Risk Grade (A+ to F) across all your documents.
              </p>
            </div>
          </Card3DPerspective>

          {/* Use Case 7: Lawyer Questions */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Use Case 7</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Prepare for a Legal Professional</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Generates targeted, clause-traceable questions for your attorney consultation — bridging AI assistance with professional legal advice.
              </p>
            </div>
          </Card3DPerspective>
        </div>
      </section>

      {/* Safety & Non-Goal Commitments */}
      <section className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Built with Safety and Evidence First</h2>
          <p className="text-slate-300 text-sm sm:text-base">
            LegalLens AI provides information and assistance, not professional legal advice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <strong>Source Reference:</strong> Every finding cites line-level document evidence.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <strong>Jurisdiction Neutral:</strong> Cautious, jurisdiction-neutral phrasing by default.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <strong>Data Isolation:</strong> Your documents are strictly private and isolated from other users.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <strong>Lawyer Preparation:</strong> Generates structured questions to consult a legal professional.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
