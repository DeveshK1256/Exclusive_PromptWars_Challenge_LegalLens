import React from 'react';
import Link from 'next/link';
import { Shield, FileCheck, Eye, Compass, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          <span>AI Legal Navigation Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Don&apos;t just read a legal document. <br className="hidden sm:inline" />
          <span className="text-brand-600">Understand what it means.</span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed">
          LegalLens AI transforms complex contracts, leases, and agreements into clear plain-language summaries, visual risk maps, grounded Q&A, and practical preparation plans.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors group"
          >
            <span>Analyze Your Document</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Learn How It Works
          </Link>
        </div>
      </section>

      {/* Legal X-Ray & Core Features */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How LegalLens AI Navigates Documents
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every AI finding is grounded directly in document source text with verifiable evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Legal X-Ray</h3>
            <p className="text-sm text-slate-600">
              Classifies findings by severity level (🟢 standard, 🟡 important, 🟠 attention, 🔴 high-impact) and finding kind (informational, action required, deadline).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personal Impact</h3>
            <p className="text-sm text-slate-600">
              Select your context role (Employee, Tenant, Freelancer, Business owner) to understand how specific obligations and clauses affect your position.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Grounded Q&A</h3>
            <p className="text-sm text-slate-600">
              Ask questions directly against uploaded documents with traceable chunk citations, zero-hallucination guarantees, and safety checks.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Non-Goal Commitments */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold">Built with Safety and Evidence First</h2>
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
              <strong>Data Isolation:</strong> Strict user-level Row-Level Security (RLS).
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
