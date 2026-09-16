'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, CheckSquare, XSquare, Eye } from 'lucide-react';
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
      badge: '🟢 Normal Collection',
      title: 'Basic Device & Performance Data',
      details: 'Device model, OS version, crash reports, and app diagnostics for stability.',
    },
    {
      level: 'yellow',
      icon: AlertCircle,
      badge: '🟡 Moderate Collection',
      title: 'IP Address & Usage Analytics',
      details: 'Rough geographic location, session duration, and feature interactions.',
    },
    {
      level: 'red',
      icon: ShieldAlert,
      badge: '🔴 High Risk Permissions',
      title: 'Precise Location, Biometrics & Broker Sharing',
      details: 'Sharing data with 3rd-party data brokers, precise GPS tracking, or biometrics if collected.',
    },
  ];

  const surrenderedRights = [
    {
      surrendered: true,
      title: 'Mandatory Binding Arbitration',
      desc: 'You waive the right to resolve disputes in a public court of law; all claims go to private arbitration.',
    },
    {
      surrendered: true,
      title: 'Class Action Lawsuit Waiver',
      desc: 'You cannot join or initiate a group or class-action lawsuit against the provider.',
    },
    {
      surrendered: false,
      title: 'Indefinite Content Ownership',
      desc: 'Provider receives a non-exclusive license to operate services, but does not claim full ownership of your uploaded media.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Data & Permissions Scorecard
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                  ToS & Privacy Tailored
                </span>
              </h3>
              <p className="text-xs text-slate-400">Traffic-light breakdown of data collected and shared under {documentTitle}</p>
            </div>
          </div>
        </div>

        {/* Traffic Light Grid */}
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
              <div key={idx} className={`p-4 rounded-xl border ${borderBg} space-y-2`}>
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
            );
          })}
        </div>

        {/* Rights You Surrender Checklist */}
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
