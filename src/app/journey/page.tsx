'use client';

import React, { useState } from 'react';
import {
  Compass,
  UserCheck,
  Shield,
  Calendar,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { ContextRole, PersonalImpactResult } from '@/lib/impact/types';
import { LegalXRayDashboard } from '@/components/xray/LegalXRayDashboard';
import { LegalXRayOverview } from '@/lib/xray/types';
import { getStoredDocuments } from '@/lib/documentStorage';

export default function JourneyPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [contextRole, setContextRole] = useState<ContextRole>('Employee');
  const [hasUserDocs, setHasUserDocs] = useState<boolean>(false);
  const [showDemoSample, setShowDemoSample] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const docs = getStoredDocuments();
      setHasUserDocs(docs.length > 0);
    }
  }, []);

  const [sampleFindings] = useState([
    {
      id: 'fnd_xray_001',
      category: 'Restrictive Covenants',
      title: 'Post-Employment Non-Compete Scope',
      description: 'Employee restricted from engaging in competing business within 25 miles for 12 months post-employment.',
      severity_level: 'orange' as const,
      finding_kind: 'action_required' as const,
      source_reference: 'Section 3: "within 25 miles of San Francisco for 12 months"',
    },
    {
      id: 'fnd_xray_002',
      category: 'Termination Notice',
      title: '30-Day Resignation Notice Window',
      description: 'Either party must provide 30 days written notice prior to agreement termination.',
      severity_level: 'yellow' as const,
      finding_kind: 'deadline' as const,
      source_reference: 'Section 2: "30 days written notice"',
    },
    {
      id: 'fnd_xray_003',
      category: 'Flexible Remote Work',
      title: 'Remote Work Provision',
      description: 'Employee permitted 2 days per week flexible remote work with manager approval.',
      severity_level: 'green' as const,
      finding_kind: 'informational' as const,
      source_reference: 'Section 4: "2 days per week flexible remote work"',
    },
  ]);

  const [impactResult, setImpactResult] = useState<PersonalImpactResult | null>({
    document_id: 'doc_demo_journey_1',
    context_role: 'Employee',
    impactSummary: 'Personal impact evaluation for your role as Employee based on 3 document findings.',
    roleSpecificImpacts: [
      {
        finding_id: 'fnd_xray_001',
        title: 'Post-Employment Non-Compete Scope',
        category: 'Restrictive Covenants',
        severity_level: 'orange',
        finding_kind: 'action_required',
        what_this_means_for_you: 'As an Employee, this non-compete clause restricts where and for how long you can work after leaving this company.',
        practical_considerations: [
          'Check if this restricts your future career choices in your industry.',
          'Consider clarifying geographic scope with a legal professional in your local jurisdiction.',
        ],
        source_reference: 'Section 3: "within 25 miles of San Francisco for 12 months"',
        confidence: 0.96,
      },
      {
        finding_id: 'fnd_xray_002',
        title: '30-Day Resignation Notice Window',
        category: 'Termination Notice',
        severity_level: 'yellow',
        finding_kind: 'deadline',
        what_this_means_for_you: 'As an Employee, this notice requirement dictates how far in advance you or your employer must give notice before resignation or termination.',
        practical_considerations: [
          'Plan your job transition timeline according to this 30-day notice window.',
          'Keep written records of all notices provided.',
        ],
        source_reference: 'Section 2: "30 days written notice"',
        confidence: 0.92,
      },
    ],
    questionsToAsk: [
      'How does the non-compete clause apply to my specific role as an Employee?',
      'What happens if I give notice shorter than 30 days?',
    ],
    confidence: 0.95,
    modelUsed: 'gemini-3.6-flash',
    analysis_mode: 'ai',
    degraded: false,
    tokenUsage: 310,
  });

  const handleRoleChange = async (newRole: ContextRole) => {
    setContextRole(newRole);
    try {
      const response = await fetch('/api/documents/doc_demo_journey_1/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_role: newRole,
          findings: sampleFindings,
        }),
      });
      const json = await response.json();
      if (json.success && json.data) {
        setImpactResult(json.data);
      }
    } catch {
      // Keep existing local state on network error
    }
  };

  const steps = [
    { id: 1, name: 'Personal Impact', icon: UserCheck },
    { id: 2, name: 'Legal X-Ray', icon: Shield },
    { id: 3, name: 'Timeline & Deadlines', icon: Calendar },
    { id: 4, name: 'Before You Sign', icon: CheckSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Stepper Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Journey Navigator & Personal Impact
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Step-by-step guidance framing legal provisions for your specific role and perspective.
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <label htmlFor="context-perspective-select" className="text-xs font-bold text-slate-700 dark:text-slate-300">Perspective Context:</label>
          <select
            id="context-perspective-select"
            value={contextRole}
            onChange={(e) => handleRoleChange(e.target.value as ContextRole)}
            aria-label="Perspective Context Role"
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Employee">Employee Perspective</option>
            <option value="Tenant">Tenant Perspective</option>
            <option value="Freelancer">Freelancer Perspective</option>
            <option value="Business owner">Business Owner Perspective</option>
            <option value="Consumer">Consumer Perspective</option>
            <option value="Student">Student Perspective</option>
            <option value="Other">General / Other Perspective</option>
          </select>
        </div>
      </div>

      {/* Sample Demo Mode Notification Badge */}
      {showDemoSample && !hasUserDocs && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
          <span className="font-semibold">Sample Demo Mode — Showing sample document journey preview. Upload a document to analyze your real files.</span>
          <button onClick={() => setShowDemoSample(false)} className="underline font-bold text-xs">Close Demo Preview</button>
        </div>
      )}

      {!hasUserDocs && !showDemoSample ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Legal Documents Uploaded Yet</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Upload a legal document to navigate personalized role-based impact analysis, legal X-ray findings, timelines, and pre-signature checklists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/documents"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Upload Your First Document
            </a>
            <button
              type="button"
              onClick={() => setShowDemoSample(true)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Preview Sample Contract Journey
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Degraded / Fallback Banner */}
      {impactResult?.degraded && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3" role="alert" aria-live="assertive">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <strong className="block font-bold text-amber-950 dark:text-amber-300">AI Personal Impact Temporarily Offline (Degraded Mode)</strong>
            Showing basic role reframing (fallback mode). Try again shortly for full Gemini reasoning.
          </div>
        </div>
      )}

      {/* Stepper Nav Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="tablist" aria-label="Journey Stepper Navigation">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${step.id}: ${step.name} ${isActive ? '(Current Step)' : isDone ? '(Completed Step)' : ''}`}
              onClick={() => setActiveStep(step.id)}
              className={`p-4 rounded-xl border flex items-center gap-3 transition text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-slate-100 shadow-md'
                  : isDone
                  ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-white/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive ? 'bg-indigo-600 text-white' : isDone ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider block text-slate-500 dark:text-slate-400 font-bold">Step {step.id}</span>
                <span className="text-xs font-semibold block">{step.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content Panels */}
      {activeStep === 1 && (
        <div className="space-y-6" role="tabpanel" aria-label="Step 1: Personal Impact Panel">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                What This Means For You ({contextRole})
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                impactResult?.analysis_mode === 'ai'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {impactResult?.analysis_mode === 'ai' ? 'LIVE AI MODE' : 'HEURISTIC FALLBACK'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              {impactResult?.impactSummary}
            </p>

            <div className="space-y-4 mt-4">
              {impactResult?.roleSpecificImpacts.map((item, idx) => (
                <div key={item.finding_id || idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      [{item.severity_level.toUpperCase()}: Attention Area] • [{item.finding_kind.toUpperCase()}]
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Ref: {item.source_reference}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200">{item.what_this_means_for_you}</p>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">Practical Considerations:</span>
                    <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {item.practical_considerations.map((pc, pcIdx) => (
                        <li key={pcIdx}>{pc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4" role="tabpanel" aria-label="Step 2: Legal X-Ray Panel">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Legal X-Ray Findings Overview
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Review structured findings classified by severity level and finding kind.</p>
          <LegalXRayDashboard
            overview={{
              document_id: 'doc_demo_1',
              document_version_id: 'ver_doc_demo_1',
              high_impact_count: 1,
              attention_area_count: 1,
              important_count: 1,
              general_count: 1,
              deadlines_count: 1,
              action_items_count: 1,
              findings: [
                {
                  id: 'fnd_xray_001',
                  document_id: 'doc_demo_1',
                  document_version_id: 'ver_doc_demo_1',
                  clause_id: null,
                  category: 'Restrictive Covenants',
                  finding_kind: 'action_required',
                  severity: 'red',
                  finding_type: 'recommendation',
                  title: 'Broad Non-Compete Provision',
                  description: 'Restricts employment nationwide for 3 years.',
                  source_reference: 'Employee agrees not to engage in competing business nationwide for 36 months.',
                  confidence: 0.96,
                  created_at: new Date().toISOString(),
                },
                {
                  id: 'fnd_xray_002',
                  document_id: 'doc_demo_1',
                  document_version_id: 'ver_doc_demo_1',
                  clause_id: null,
                  category: 'Termination Notice',
                  finding_kind: 'deadline',
                  severity: 'orange',
                  finding_type: 'fact',
                  title: 'Short Termination Notice Period',
                  description: 'Notice period reduced from 30 days to 14 days.',
                  source_reference: 'Either party may terminate upon 14 days written notice.',
                  confidence: 0.92,
                  created_at: new Date().toISOString(),
                },
              ],
            }}
          />
        </div>
      )}

      {activeStep === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4" role="tabpanel" aria-label="Step 3: Timeline & Milestones Panel">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Legal Timeline & Milestones
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">30-Day Resignation Notice Window</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">Notice must be delivered 30 days prior to contract termination date.</span>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Ref: Section 2: &quot;30 days written notice&quot;</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4" role="tabpanel" aria-label="Step 4: Before You Sign Checklist Panel">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Before You Sign Checklist & Lawyer Questions
          </h3>
          <div className="space-y-3">
            {impactResult?.questionsToAsk.map((q, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          type="button"
          onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
          disabled={activeStep === 1}
          aria-label="Navigate to Previous Step"
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Previous Step
        </button>

        <button
          type="button"
          onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
          disabled={activeStep === 4}
          aria-label="Navigate to Next Step"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 cursor-pointer"
        >
          Next Step <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
        </>
      )}
    </div>
  );
}

