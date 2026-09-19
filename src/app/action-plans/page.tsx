'use client';

import React from 'react';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { ActionPlanResult } from '@/lib/action/types';
import { ListCheck } from 'lucide-react';
import { getStoredDocuments } from '@/lib/documentStorage';

export default function ActionPlansPage() {
  const [hasUserDocs, setHasUserDocs] = React.useState<boolean>(false);
  const [showSampleDemo, setShowSampleDemo] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const docs = getStoredDocuments();
      setHasUserDocs(docs.length > 0);
    }
  }, []);

  const sampleActionPlan: ActionPlanResult = {
    actionPlan: {
      id: 'ap_1',
      user_id: 'user_demo',
      document_id: 'doc_sample_1',
      title: 'Action Plan for Employment Agreement',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    checklist: [
      {
        id: 'chk_1',
        title: 'Clarify Non-Compete Scope',
        recommendation: 'Review geographic and duration limits of non-compete clause with your legal professional to understand enforceability in your jurisdiction.',
        severity: 'orange',
        sourceReference: 'Section 8.2, Page 4',
        checked: false,
      },
      {
        id: 'chk_2',
        title: 'Confirm Intellectual Property Assignment',
        recommendation: 'Ensure personal side projects created outside working hours without company resources are excluded.',
        severity: 'yellow',
        sourceReference: 'Section 9.1, Page 5',
        checked: false,
      },
    ],
    lawyerQuestions: [
      {
        id: 'lq_1',
        document_id: 'doc_sample_1',
        question: 'Does the 30-day notice requirement apply equally to termination without cause by the employer?',
        reason: 'The current wording is ambiguous regarding employer severance obligations during at-will dismissal.',
        priority: 'high',
        related_finding_id: null,
        source_reference: 'Section 5.1, Page 3',
        created_at: new Date().toISOString(),
      },
      {
        id: 'lq_2',
        document_id: 'doc_sample_1',
        question: 'Are pre-existing inventions explicitly carve-out protected under Exhibit A?',
        reason: 'Broad IP assignment clauses may accidentally capture prior open-source software contributions.',
        priority: 'medium',
        related_finding_id: null,
        source_reference: 'Section 9.1, Page 5',
        created_at: new Date().toISOString(),
      },
    ],
    actionItems: [
      {
        id: 'task_1',
        action_plan_id: 'ap_1',
        title: 'Submit Prior Invention Exclusion Schedule',
        description: 'Attach Exhibit A listing all pre-existing personal code repositories before signing contract.',
        priority: 'high',
        status: 'pending',
        due_date: '2026-02-01',
        related_finding_id: null,
        source_reference: 'Section 9.3, Page 5',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task_2',
        action_plan_id: 'ap_1',
        title: 'Set Reminder for 2027 Annual Salary Review',
        description: 'Calendar notification 60 days before 2027-02-01 to prepare performance accomplishments.',
        priority: 'low',
        status: 'completed',
        due_date: '2026-12-01',
        related_finding_id: null,
        source_reference: 'Section 3.2, Page 2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <ListCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <span>Action Plans & Task Center</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Review pre-signature checklists, questions for legal counsel, and post-signing task tracker across all documents.
        </p>
      </div>

      {!hasUserDocs && !showSampleDemo ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto">
            <ListCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Action Plans Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Upload a legal contract to automatically extract pre-signature review checklists, questions for legal counsel, and post-signing task trackers.
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
              onClick={() => setShowSampleDemo(true)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Preview Sample Action Plan
            </button>
          </div>
        </div>
      ) : (
        <>
          {showSampleDemo && !hasUserDocs && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span className="font-semibold">Sample Demo Mode — Showing sample action plan preview. Upload a document to generate your own action plans.</span>
              <button onClick={() => setShowSampleDemo(false)} className="underline font-bold text-xs">Close Demo Preview</button>
            </div>
          )}
          <ActionPlanViewer data={sampleActionPlan} />
        </>
      )}
    </div>
  );
}
