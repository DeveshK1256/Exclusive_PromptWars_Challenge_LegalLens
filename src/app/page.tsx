import React from 'react';
import Link from 'next/link';
import { Shield, Eye, Compass, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
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

      {/* Legal X-Ray & Core Features */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            How LegalLens AI Navigates Documents
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base">
            Every AI finding is grounded directly in document source text with verifiable evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Legal X-Ray */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Legal X-Ray</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Classifies key findings by severity (green, yellow, orange, red) and finding kind (informational, action required, deadline).
              </p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className="text-emerald-500">🟢 Standard</span>
                <span className="text-yellow-500">🟡 Important</span>
                <span className="text-orange-500">🟠 Attention</span>
                <span className="text-red-500">🔴 High-Impact</span>
              </div>
            </div>
          </Card3DPerspective>

          {/* Card 2: Personal Impact */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personal Impact</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Select your role (Employee, Tenant, Freelancer, Business owner) to understand how specific obligations and clauses affect your position.
              </p>
            </div>
          </Card3DPerspective>

          {/* Card 3: Grounded Q&A */}
          <Card3DPerspective>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Grounded Q&amp;A</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask questions directly against uploaded documents with traceable chunk citations, verified accuracy, and safety checks.
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
