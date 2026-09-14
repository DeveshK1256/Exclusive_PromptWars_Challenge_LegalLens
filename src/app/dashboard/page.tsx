'use client';

import React, { useState } from 'react';
import { DocumentUploadZone } from '@/components/upload/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { SimplificationViewer } from '@/components/simplification/SimplificationViewer';
import { DocumentQAChat } from '@/components/qa/DocumentQAChat';
import { LegalTimelineViewer } from '@/components/timeline/LegalTimelineViewer';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { LegalXRayDashboard } from '@/components/xray/LegalXRayDashboard';
import { LegalXRayOverview } from '@/lib/xray/types';
import { Document, DocumentSummary, GlossaryTerm, TimelineEvent } from '@/types/database';
import { ActionPlanResult } from '@/lib/action/types';
import { FileText, Shield, BookOpen, MessageSquare, Calendar, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action'>('upload');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc_sample_1',
      user_id: 'user_demo',
      title: 'Sample Employment Agreement',
      original_filename: 'Standard_Employment_Agreement_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 2450000, // ~2.45 MB
      file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storage_path: 'documents/user_demo/sample.pdf',
      document_type: 'employment_contract',
      jurisdiction: 'California, US',
      status: 'completed',
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const sampleXRayOverview: LegalXRayOverview = {
    document_id: 'doc_sample_1',
    document_version_id: 'ver_doc_sample_1_v1',
    high_impact_count: 1,
    attention_area_count: 1,
    important_count: 1,
    general_count: 1,
    deadlines_count: 1,
    action_items_count: 1,
    findings: [
      {
        id: 'fnd_xray_001',
        document_id: 'doc_sample_1',
        document_version_id: 'ver_doc_sample_1_v1',
        clause_id: 'c_1',
        category: 'Restrictive Covenants',
        severity: 'red',
        finding_kind: 'action_required',
        finding_type: 'recommendation',
        title: 'Post-Employment Non-Compete Scope',
        description: 'Employee restricted from engaging in competing business within 25 miles for 12 months post-employment.',
        source_reference: 'Section 3: "Employee agrees not to engage in competing business within 25 miles of San Francisco for 12 months post-employment."',
        confidence: 0.96,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fnd_xray_002',
        document_id: 'doc_sample_1',
        document_version_id: 'ver_doc_sample_1_v1',
        clause_id: 'c_2',
        category: 'Termination Notice',
        severity: 'orange',
        finding_kind: 'deadline',
        finding_type: 'ai_interpretation',
        title: '30-Day Resignation Notice Window',
        description: 'Either party must provide 30 days written notice prior to agreement termination.',
        source_reference: 'Section 2: "Either party may terminate employment upon 30 days written notice."',
        confidence: 0.92,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fnd_xray_003',
        document_id: 'doc_sample_1',
        document_version_id: 'ver_doc_sample_1_v1',
        clause_id: 'c_3',
        category: 'Compensation & Salary',
        severity: 'yellow',
        finding_kind: 'informational',
        finding_type: 'fact',
        title: 'Annual Compensation Rate',
        description: 'Base salary set at $120,000 annually payable in monthly installments.',
        source_reference: 'Section 1: "Annual base compensation of $120,000 payable monthly."',
        confidence: 0.98,
        created_at: new Date().toISOString(),
      },
      {
        id: 'fnd_xray_004',
        document_id: 'doc_sample_1',
        document_version_id: 'ver_doc_sample_1_v1',
        clause_id: 'c_4',
        category: 'Flexible Work Policy',
        severity: 'green',
        finding_kind: 'informational',
        finding_type: 'fact',
        title: 'Remote Work Allowance',
        description: 'Employee permitted 2 days per week flexible remote work with manager approval.',
        source_reference: 'Section 4: "Employee permitted 2 days per week flexible remote work with approval."',
        confidence: 0.95,
        created_at: new Date().toISOString(),
      },
    ],
  };

  const sampleSummary: DocumentSummary = {
    id: 'sum_demo_1',
    document_id: 'doc_sample_1',
    document_version_id: 'ver_doc_sample_1_v1',
    complexity_level: 'very_simple',
    summary_text: 'This agreement states that Tech Corp employs John Doe starting February 1, 2026 at an annual base compensation of $120,000. Either party may terminate employment upon 30 days written notice.',
    key_takeaways: [
      'John Doe employed as Senior Developer effective February 1, 2026.',
      'Base Salary fixed at $120,000 annually with standard medical benefits.',
      'Notice Period: 30 days written notice required for voluntary termination.',
      'Governing Law: California state jurisdiction applies.',
    ],
    obligations_summary: '1. Employee Duty: Perform assigned technical duties. (Ref: Page 1, Section 1)\n2. Employer Duty: Pay monthly compensation of $10,000. (Ref: Page 1, Section 2)\n3. Notice Requirement: Provide 30 days written notice prior to departure. (Ref: Page 2, Section 4)',
    confidence: 0.95,
    created_at: new Date().toISOString(),
  };

  const sampleGlossary: GlossaryTerm[] = [
    {
      id: 'glo_1',
      document_id: 'doc_sample_1',
      document_version_id: 'ver_doc_sample_1_v1',
      term: 'At-Will Employment',
      plain_language_definition: 'Either the employer or employee can end employment at any time for lawful reasons.',
      contextual_meaning: 'Allows voluntary resignation or employer termination with required 30 days notice.',
      source_reference: 'Page 2, Section 4',
      created_at: new Date().toISOString(),
    },
    {
      id: 'glo_2',
      document_id: 'doc_sample_1',
      document_version_id: 'ver_doc_sample_1_v1',
      term: 'Indemnification',
      plain_language_definition: 'Duty to cover losses or legal costs caused by contract breach.',
      contextual_meaning: 'Protects company against employee unauthorized third-party liabilities.',
      source_reference: 'Page 3, Section 7',
      created_at: new Date().toISOString(),
    },
  ];

  const sampleEvents: TimelineEvent[] = [
    {
      id: 'evt_1',
      document_id: 'doc_sample_1',
      document_version_id: 'ver_doc_sample_1_v1',
      title: 'Employment Commencement Date',
      event_date: '2026-02-01',
      event_type: 'effective_date',
      description: 'Agreement takes effect and employee official start date.',
      source_reference: 'Section 1.1, Page 1',
      confidence: 0.98,
      created_at: new Date().toISOString(),
    },
    {
      id: 'evt_2',
      document_id: 'doc_sample_1',
      document_version_id: 'ver_doc_sample_1_v1',
      title: 'Annual Performance & Salary Review',
      event_date: '2027-02-01',
      event_type: 'milestone',
      description: 'Mandatory annual review for compensation and performance appraisal.',
      source_reference: 'Section 3.2, Page 2',
      confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: 'evt_3',
      document_id: 'doc_sample_1',
      document_version_id: 'ver_doc_sample_1_v1',
      title: 'Termination Notice Deadline',
      event_date: '30 days prior to departure',
      event_type: 'notice_deadline',
      description: 'Written notice must be submitted at least 30 days before resignation.',
      source_reference: 'Section 5.1, Page 3',
      confidence: 0.96,
      created_at: new Date().toISOString(),
    },
  ];

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

  const handleUploadSuccess = (newDoc: Record<string, unknown>) => {
    setDocuments((prev) => [newDoc as unknown as Document, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">LegalLens AI Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Navigate, examine Legal X-Ray analysis reports, simplify clauses, inspect timelines, and execute action plans.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('xray')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'xray' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Analysis Report
          </button>
          <button
            onClick={() => setActiveTab('simplification')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'simplification' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Simplification
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'qa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Grounded Q&A
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'action' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Action Plan
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-8">
          <DocumentUploadZone onUploadSuccess={handleUploadSuccess} onViewReport={() => setActiveTab('xray')} />
          <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} onSelectTab={setActiveTab} />
        </div>
      )}

      {activeTab === 'xray' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-400" />
                Legal X-Ray Analysis Report
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Detailed AI-assisted document classification by severity level (🔴 🟠 🟡 🟢) and finding kind with verbatim source citations.
              </p>
            </div>
            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-bold">
              Doc: Standard_Employment_Agreement_2026.pdf
            </span>
          </div>
          <LegalXRayDashboard overview={sampleXRayOverview} />
        </div>
      )}

      {activeTab === 'simplification' && (
        <SimplificationViewer initialSummary={sampleSummary} glossary={sampleGlossary} />
      )}

      {activeTab === 'qa' && (
        <DocumentQAChat documentId="doc_sample_1" documentTitle="Sample Employment Agreement" />
      )}

      {activeTab === 'timeline' && (
        <LegalTimelineViewer events={sampleEvents} upcomingDeadlinesCount={1} />
      )}

      {activeTab === 'action' && (
        <ActionPlanViewer data={sampleActionPlan} />
      )}
    </div>
  );
}
