'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Document, Finding } from '@/types/database';
import { getCurrentUserEmail, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import { generateRealXRayOverview } from '@/lib/documentAnalysis';
import {
  generatePortfolioReport,
  PortfolioRiskReport,
  PortfolioGrade,
} from '@/lib/portfolio/portfolioAggregator';
import { Shield, PieChart, AlertTriangle, AlertCircle, Info, CheckCircle2, FileText, ArrowUpDown, ChevronRight } from 'lucide-react';

const GRADE_COLORS: Record<PortfolioGrade, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  B: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
  C: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  D: { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800' },
  F: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
};

import { createClient } from '@/lib/supabase/client';

export default function PortfolioPage() {
  const [report, setReport] = useState<PortfolioRiskReport | null>(null);
  const [sortField, setSortField] = useState<'score' | 'title' | 'redCount'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function loadPortfolio() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || getCurrentUserEmail();
      const userId = user?.id || userEmail;

      if (!userEmail && !user) {
        setReport(generatePortfolioReport('anonymous', [], []));
        return;
      }

      let docs: Document[] = [];
      if (user) {
        const { data: dbDocs } = await supabase.from('documents').select('*');
        if (dbDocs) {
          docs = dbDocs as Document[];
        }
      }

    // Collect all findings across user documents
    const allFindings: Finding[] = [];

    docs.forEach((doc) => {
      const xray = generateRealXRayOverview(doc);
      xray.findings.forEach((f) => {
        allFindings.push({
          id: f.id,
          document_id: doc.id,
          document_version_id: doc.id + '_v1',
          clause_id: f.clause_id,
          category: f.category,
          severity: f.severity,
          title: f.title,
          description: f.description,
          finding_type: f.finding_type,
          confidence: f.confidence,
          source_reference: f.source_reference,
          created_at: f.created_at,
        });
      });
    });

      const generated = generatePortfolioReport(userId, docs, allFindings);
      setReport(generated);
    }

    loadPortfolio();
  }, []);

  const sortedSummaries = React.useMemo(() => {
    if (!report) return [];
    return [...report.documentSummaries].sort((a, b) => {
      if (sortField === 'score') {
        return sortDirection === 'desc' ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
      } else if (sortField === 'title') {
        return sortDirection === 'desc'
          ? b.document.title.localeCompare(a.document.title)
          : a.document.title.localeCompare(b.document.title);
      } else {
        return sortDirection === 'desc' ? b.redCount - a.redCount : a.redCount - b.redCount;
      }
    });
  }, [report, sortField, sortDirection]);

  const toggleSort = (field: 'score' | 'title' | 'redCount') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getAriaSort = (field: 'score' | 'title' | 'redCount') => {
    if (sortField !== field) return 'none';
    return sortDirection === 'desc' ? 'descending' : 'ascending';
  };

  const gradeStyle = report ? GRADE_COLORS[report.portfolioGrade] : GRADE_COLORS['A'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Page Title - ALWAYS rendered */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <PieChart className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              Portfolio Risk Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Deterministic risk aggregation across all completed legal agreements in your portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              Document X-Ray
            </Link>
          </div>
        </div>

        {!report ? (
          <div className="p-8 text-center text-slate-500">
            Calculating portfolio risk metrics...
          </div>
        ) : report.totalDocuments === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto">
              <PieChart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Documents in Portfolio</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Upload legal agreements to calculate aggregate risk scores, determine portfolio grades, and monitor obligations across your entire contract portfolio.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard?tab=upload"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
              >
                Upload Your First Document
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Score & Grade Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Grade Card */}
              <div className={`p-6 rounded-xl border ${gradeStyle.border} ${gradeStyle.bg} flex flex-col justify-between shadow-sm`}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Overall Health Grade
                  </span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className={`text-5xl font-black ${gradeStyle.text}`}>Grade {report.portfolioGrade}</span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      (Score: {report.overallPortfolioScore})
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold mt-4 text-slate-700 dark:text-slate-300">
                  {report.gradeDescription}
                </p>
              </div>

              {/* Red Findings Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-950 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Red Flags (15 pts)
                  </span>
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-4xl font-bold text-rose-700 dark:text-rose-400 mt-3">{report.totalRedFindings}</span>
                <span className="text-xs text-slate-500 mt-2">High-risk liabilities requiring immediate review</span>
              </div>

              {/* Orange Findings Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-950 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Orange Flags (7 pts)
                  </span>
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-4xl font-bold text-orange-700 dark:text-orange-400 mt-3">{report.totalOrangeFindings}</span>
                <span className="text-xs text-slate-500 mt-2">Action required / significant terms</span>
              </div>

              {/* Yellow/Green Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Informational Flags
                  </span>
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-4 mt-3">
                  <div>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{report.totalYellowFindings}</span>
                    <span className="text-xs text-slate-500 ml-1">Yellow</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{report.totalGreenFindings}</span>
                    <span className="text-xs text-slate-500 ml-1">Green</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 mt-2">Routine terms & low impact obligations</span>
              </div>
            </div>

            {/* Formula Transparency Box */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">Zero-Hallucination Formula Guarantee:</span>{' '}
                Portfolio Score = <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Sum(CompletedDocumentRiskScores) / Max(1, CompletedDocuments)</code> where{' '}
                <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">DocumentRiskScore = (Red * 15) + (Orange * 7) + (Yellow * 2)</code>.{' '}
                {report.excludedDocumentsCount > 0 && (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    Note: {report.excludedDocumentsCount} uncompleted/processing document(s) excluded from formula.
                  </span>
                )}
              </div>
            </div>

            {/* Portfolio Document Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  Document Risk Breakdown ({report.completedDocumentsCount} Completed Agreements)
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase text-xs border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold" aria-sort={getAriaSort('title')}>
                        <button onClick={() => toggleSort('title')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100">
                          Document Title <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold" aria-sort={getAriaSort('score')}>
                        <button onClick={() => toggleSort('score')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100">
                          Risk Score <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold text-center" aria-sort={getAriaSort('redCount')}>
                        <button onClick={() => toggleSort('redCount')} className="flex items-center gap-1 mx-auto hover:text-slate-900 dark:hover:text-slate-100">
                          Red Flags <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-semibold text-center">Orange Flags</th>
                      <th className="py-3 px-4 font-semibold text-center">Yellow Flags</th>
                      <th className="py-3 px-4 font-semibold text-center">Green Flags</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {sortedSummaries.map((summary) => (
                      <tr key={summary.document.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {summary.document.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 capitalize">
                          {summary.document.document_type.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={`px-2.5 py-1 rounded-md text-xs border ${
                            summary.riskScore >= 45
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : summary.riskScore >= 20
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}>
                            Score: {summary.riskScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-rose-600 dark:text-rose-400">
                          {summary.redCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-orange-600 dark:text-orange-400">
                          {summary.orangeCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-amber-600 dark:text-amber-400">
                          {summary.yellowCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {summary.greenCount}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard?doc=${summary.document.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            View X-Ray <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
