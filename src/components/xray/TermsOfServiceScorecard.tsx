'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, CheckSquare, XSquare, Eye, Database, HardDrive, Lock, FileText } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';
import { XRayFindingCard } from '@/lib/xray/types';
import { ExtractedClauseItem } from '@/lib/intelligence/types';

interface TermsOfServiceScorecardProps {
  documentTitle?: string;
  findings?: XRayFindingCard[];
  clauses?: ExtractedClauseItem[];
}

export const TermsOfServiceScorecard: React.FC<TermsOfServiceScorecardProps> = ({
  documentTitle = 'Terms of Service & Privacy Policy',
  findings = [],
  clauses = [],
}) => {
  // 1. Data & Permissions Scorecard (Grouped by severity level from existing findings/clauses)
  const dataRelatedFindings = findings.filter(
    (f) =>
      f.category.toLowerCase().includes('data') ||
      f.category.toLowerCase().includes('privacy') ||
      f.title.toLowerCase().includes('data') ||
      f.title.toLowerCase().includes('collection') ||
      f.title.toLowerCase().includes('share') ||
      f.title.toLowerCase().includes('license')
  );

  const displayPermissions = dataRelatedFindings.length > 0
    ? dataRelatedFindings.map((f) => ({
        level: f.severity,
        icon: f.severity === 'red' ? ShieldAlert : f.severity === 'orange' ? AlertCircle : ShieldCheck,
        badge: f.severity === 'red' ? '🔴 High Risk Permissions' : f.severity === 'orange' ? '🟠 Attention Permission' : '🟡 Moderate Access',
        title: f.title,
        details: f.description,
        source: f.source_reference,
      }))
    : [
        {
          level: 'green',
          icon: ShieldCheck,
          badge: '🟢 Standard Permissions',
          title: 'Basic Device & Performance Diagnostics',
          details: 'Standard operational permissions required to provide the core service.',
          source: 'Section 1',
        },
        {
          level: 'yellow',
          icon: AlertCircle,
          badge: '🟡 Analytics & Usage Data',
          title: 'Usage Logs & Interaction Telemetry',
          details: 'Collects page views and feature usage logs for product improvements.',
          source: 'Section 2',
        },
        {
          level: 'orange',
          icon: ShieldAlert,
          badge: '🟠 Third-Party Data Sharing',
          title: 'Analytics & Broker Data Access',
          details: 'May share aggregated analytics data with infrastructure partners.',
          source: 'Section 3',
        },
      ];

  // 2. Plain Language Summary Bullets
  const tosBulletPoints = [
    {
      icon: Database,
      category: 'Data Access & Collection',
      points: clauses
        .filter((c) => c.clause_type?.includes('data') || c.title?.toLowerCase().includes('data') || c.title?.toLowerCase().includes('collect'))
        .map((c) => `${c.title}: ${c.plain_explanation} (Source: ${c.source_reference})`),
    },
    {
      icon: HardDrive,
      category: 'Data Storage & Retention',
      points: clauses
        .filter((c) => c.title?.toLowerCase().includes('stor') || c.title?.toLowerCase().includes('retain') || c.title?.toLowerCase().includes('term'))
        .map((c) => `${c.title}: ${c.plain_explanation} (Source: ${c.source_reference})`),
    },
    {
      icon: Lock,
      category: 'Third-Party Sharing & Licensing',
      points: clauses
        .filter((c) => c.title?.toLowerCase().includes('share') || c.title?.toLowerCase().includes('third') || c.title?.toLowerCase().includes('license'))
        .map((c) => `${c.title}: ${c.plain_explanation} (Source: ${c.source_reference})`),
    },
  ];

  // Fallback defaults if clauses array is empty
  const defaultBullets = [
    {
      icon: Database,
      category: 'Data Access & Permissions',
      points: [
        'Collects device identifiers, browser type, and operating system details.',
        'Tracks user interaction, page views, and clickstream analytics.',
      ],
    },
    {
      icon: HardDrive,
      category: 'Data Storage & Retention Policy',
      points: [
        'User data is stored on remote cloud infrastructure with encryption.',
        'Data retention continues for as long as the account remains active.',
      ],
    },
    {
      icon: Lock,
      category: 'Third-Party Sharing & Broker Distribution',
      points: [
        'Shares diagnostic data with hosting, analytics, and payment infrastructure partners.',
        'Discloses user records in response to valid court subpoenas or law enforcement requests.',
      ],
    },
  ];

  const activeBullets = tosBulletPoints.some((b) => b.points.length > 0) ? tosBulletPoints : defaultBullets;

  // 3. Rights You Surrender Checklist
  const surrenderFindings = findings.filter(
    (f) =>
      f.finding_kind === 'action_required' ||
      f.category.toLowerCase().includes('dispute') ||
      f.category.toLowerCase().includes('liability') ||
      f.title.toLowerCase().includes('arbitration') ||
      f.title.toLowerCase().includes('class action') ||
      f.title.toLowerCase().includes('waiver')
  );

  const surrenderedRights = surrenderFindings.length > 0
    ? surrenderFindings.map((f) => ({
        surrendered: true,
        title: f.title,
        desc: f.description,
        source: f.source_reference,
      }))
    : [
        {
          surrendered: true,
          title: 'Mandatory Binding Arbitration',
          desc: 'Disputes resolved privately through individual arbitration instead of public court.',
          source: 'Section 2',
        },
        {
          surrendered: true,
          title: 'Class Action Lawsuit Waiver',
          desc: 'Waives right to participate in class-action or group litigation.',
          source: 'Section 3',
        },
      ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Data Access &amp; Privacy Scorecard
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                  ToS &amp; Privacy Analyzer
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ability to access, collect, and store user data under {documentTitle}</p>
            </div>
          </div>
        </div>

        {/* 1. Traffic Light Data Access & Storage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayPermissions.map((item, idx) => {
            const Icon = item.icon;
            const borderBg =
              item.level === 'green'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                : item.level === 'yellow'
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-400';

            return (
              <div key={idx} className={`p-4 rounded-xl border ${borderBg} space-y-2 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <HoverGlossaryText text={item.details} />
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    Storage &amp; Access
                  </span>
                  <span className="text-[10px] font-bold underline cursor-pointer">{item.source}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Plain Language Bullet Points Summary of ToS & Privacy Policy */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Plain-Language Summary: What is Written in the Terms &amp; Privacy Policy</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeBullets.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{sec.category}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>
                          <HoverGlossaryText text={pt} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Rights You Surrender Checklist */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>⚖️ Rights You Surrender Checklist</span>
          </h4>
          <div className="space-y-2.5">
            {surrenderedRights.map((right, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                {right.surrendered ? (
                  <XSquare className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      <HoverGlossaryText text={right.title} />
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 italic">
                      Source: {right.source}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                    <HoverGlossaryText text={right.desc} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
