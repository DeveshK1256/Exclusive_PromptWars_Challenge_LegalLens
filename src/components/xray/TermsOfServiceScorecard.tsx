'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, CheckSquare, XSquare, Eye, Database, HardDrive, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { HoverGlossaryText } from '@/components/ui/HoverGlossaryText';

interface TermsOfServiceScorecardProps {
  documentTitle?: string;
}

export const TermsOfServiceScorecard: React.FC<TermsOfServiceScorecardProps> = ({
  documentTitle = 'Terms of Service & Privacy Policy',
}) => {
  const dataPermissions = [
    {
      level: 'green',
      icon: ShieldCheck,
      badge: '🟢 Normal Access',
      title: 'Basic Device & Crash Diagnostics',
      details: 'App can access device model, OS version, app performance logs, and error telemetry to fix bugs.',
      storage: 'Stored temporarily for app performance.',
    },
    {
      level: 'yellow',
      icon: AlertCircle,
      badge: '🟡 Moderate Access',
      title: 'IP Address & Usage Analytics',
      details: 'App accesses approximate location via IP, session length, button clicks, and feature usage patterns.',
      storage: 'Stored in analytics databases for up to 24 months.',
    },
    {
      level: 'red',
      icon: ShieldAlert,
      badge: '🔴 High Risk Permissions & Storage',
      title: 'GPS Location, Biometrics & Broker Sharing',
      details: 'App claims ability to track precise GPS location, harvest contact lists, or sell data to 3rd-party data brokers.',
      storage: 'Indefinite retention on cloud servers; shared with third parties.',
    },
  ];

  const tosBulletPoints = [
    {
      icon: Database,
      category: 'Data Access & Permissions',
      points: [
        'Collects device identifiers, browser type, and operating system details.',
        'Tracks user interaction, page views, and clickstream analytics.',
        'May access background location services and network connection data when active.',
      ],
    },
    {
      icon: HardDrive,
      category: 'Data Storage & Retention Policy',
      points: [
        'User data is stored on remote cloud infrastructure with standard encryption.',
        'Data retention continues for as long as account remains active, plus backup retention.',
        'Anonymized analytics data may be retained indefinitely for model training and product enhancement.',
      ],
    },
    {
      icon: Lock,
      category: 'Third-Party Sharing & Broker Distribution',
      points: [
        'Shares diagnostic data with infrastructure partners (hosting, analytics, payment processors).',
        'Reserves right to share aggregated demographic insights with third-party advertising brokers.',
        'Discloses user records in response to valid court subpoenas or law enforcement requests.',
      ],
    },
  ];

  const surrenderedRights = [
    {
      surrendered: true,
      title: 'Mandatory Binding Arbitration',
      desc: 'You waive the right to resolve disputes in a public court of law; all legal claims must go through private arbitration.',
    },
    {
      surrendered: true,
      title: 'Class Action Lawsuit Waiver',
      desc: 'You waive any right to initiate, join, or participate in group or class-action lawsuits against the service provider.',
    },
    {
      surrendered: false,
      title: 'Indefinite User Content License',
      desc: 'Provider receives a non-exclusive operational license to host services, but does not claim full ownership of your uploaded media.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Data Access &amp; Privacy Scorecard
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  ToS &amp; Privacy Analyzer
                </span>
              </h3>
              <p className="text-xs text-slate-400">Ability to access, collect, and store user data under {documentTitle}</p>
            </div>
          </div>
        </div>

        {/* 1. Traffic Light Data Access & Storage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataPermissions.map((item, idx) => {
            const Icon = item.icon;
            const borderBg =
              item.level === 'green'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                : item.level === 'yellow'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-400'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-400';

            return (
              <div key={idx} className={`p-4 rounded-xl border ${borderBg} space-y-2 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" />
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <HoverGlossaryText text={item.details} />
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Storage: {item.storage}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Plain Language Bullet Points Summary of ToS & Privacy Policy */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Plain-Language Summary: What is Written in the Terms &amp; Privacy Policy</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tosBulletPoints.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{sec.category}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {sec.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
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
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>⚖️ Rights You Surrender Checklist</span>
          </h4>
          <div className="space-y-2.5">
            {surrenderedRights.map((right, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200"
              >
                {right.surrendered ? (
                  <XSquare className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-slate-100 block">
                    <HoverGlossaryText text={right.title} />
                    {right.surrendered && (
                      <span className="ml-2 text-[10px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                        Rights Surrendered
                      </span>
                    )}
                  </span>
                  <p className="text-slate-400 text-xs mt-0.5">
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

