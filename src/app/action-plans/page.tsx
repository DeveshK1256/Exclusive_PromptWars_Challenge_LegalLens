'use client';

import React from 'react';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { ActionPlanResult } from '@/lib/action/types';
import { ListCheck } from 'lucide-react';

export default function ActionPlansPage() {
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
        recommendation: 'Review geographic and duration limits of non-compete clause to ensure enforceability under California law.',
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
          <ListCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Action Plans & Task Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Review pre-signature checklists, questions for legal counsel, and post-signing task tracker across all documents.
        </p>
      </div>

      <ActionPlanViewer data={sampleActionPlan} />
    </div>
  );
}
