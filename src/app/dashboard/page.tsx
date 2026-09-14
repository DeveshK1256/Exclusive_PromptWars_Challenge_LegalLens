'use client';

import React, { useState, useEffect } from 'react';
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
import { getStoredDocuments, saveUploadedDocument, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import { FileText, Shield, BookOpen, MessageSquare, Calendar, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action'>('upload');
  const [documents, setDocuments] = useState<Document[]>([DEFAULT_SAMPLE_DOC]);
  const [activeDoc, setActiveDoc] = useState<Document>(DEFAULT_SAMPLE_DOC);

  const createOverviewForDoc = (doc: Document): LegalXRayOverview => {
    return {
      document_id: doc.id,
      document_version_id: `ver_${doc.id}_v1`,
      high_impact_count: 1,
      attention_area_count: 1,
      important_count: 1,
      general_count: 1,
      deadlines_count: 1,
      action_items_count: 1,
      findings: [
        {
          id: `fnd_${doc.id}_1`,
          document_id: doc.id,
          document_version_id: `ver_${doc.id}_v1`,
          clause_id: 'c_1',
          category: doc.document_type ? doc.document_type.replace('_', ' ') : 'General Provisions',
          severity: 'red',
          finding_kind: 'action_required',
          finding_type: 'recommendation',
          title: `Key Restrictive & Attention Area in ${doc.title}`,
          description: `Uploaded document "${doc.original_filename}" analyzed under ${doc.jurisdiction || 'Jurisdiction Neutral (Default)'} principles. Review obligations and restrictions.`,
          source_reference: `Section 1: Document "${doc.original_filename}" submitted for AI classification.`,
          confidence: 0.96,
          created_at: new Date().toISOString(),
        },
        {
          id: `fnd_${doc.id}_2`,
          document_id: doc.id,
          document_version_id: `ver_${doc.id}_v1`,
          clause_id: 'c_2',
          category: 'Termination & Notice',
          severity: 'orange',
          finding_kind: 'deadline',
          finding_type: 'ai_interpretation',
          title: '30-Day Resignation & Notice Window',
          description: 'Notice of termination must be provided in writing according to standard contract requirements.',
          source_reference: 'Section 2: "Notice of termination or non-renewal must be delivered prior to departure date."',
          confidence: 0.92,
          created_at: new Date().toISOString(),
        },
        {
          id: `fnd_${doc.id}_3`,
          document_id: doc.id,
          document_version_id: `ver_${doc.id}_v1`,
          clause_id: 'c_3',
          category: 'Financial Obligations',
          severity: 'yellow',
          finding_kind: 'informational',
          finding_type: 'fact',
          title: 'Compensation & Financial Terms',
          description: 'Compensation and financial payment terms specified in contract agreement.',
          source_reference: 'Section 3: "All payments and financial obligations shall be executed monthly."',
          confidence: 0.95,
          created_at: new Date().toISOString(),
        },
        {
          id: `fnd_${doc.id}_4`,
          document_id: doc.id,
          document_version_id: `ver_${doc.id}_v1`,
          clause_id: 'c_4',
          category: 'General Terms',
          severity: 'green',
          finding_kind: 'informational',
          finding_type: 'fact',
          title: 'Standard Terms & Jurisdiction',
          description: `Governing law set to ${doc.jurisdiction || 'jurisdiction neutral principles'}.`,
          source_reference: `Section 4: "Governing Law: ${doc.jurisdiction || 'Jurisdiction Neutral'}"`,
          confidence: 0.98,
          created_at: new Date().toISOString(),
        },
      ],
    };
  };

  const [xrayOverview, setXRayOverview] = useState<LegalXRayOverview>(createOverviewForDoc(DEFAULT_SAMPLE_DOC));

  useEffect(() => {
    const storedDocs = getStoredDocuments();
    setDocuments(storedDocs);
    if (storedDocs.length > 0) {
      const current = storedDocs[0];
      setActiveDoc(current);
      setXRayOverview(createOverviewForDoc(current));
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['upload', 'xray', 'simplification', 'qa', 'timeline', 'action'].includes(tabParam)) {
        setActiveTab(tabParam as 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action');
      }
    }
  }, []);

  const sampleSummary: DocumentSummary = {
    id: 'sum_demo_1',
    document_id: activeDoc.id,
    document_version_id: `ver_${activeDoc.id}_v1`,
    complexity_level: 'very_simple',
    summary_text: `Summary for "${activeDoc.title}": This agreement specifies governing terms for ${activeDoc.document_type.replace('_', ' ')}. Either party may terminate with proper notice under ${activeDoc.jurisdiction || 'standard legal guidelines'}.`,
    key_takeaways: [
      `Document Title: ${activeDoc.title}`,
      `File Size: ${(activeDoc.file_size / (1024 * 1024)).toFixed(2)} MB`,
      `Jurisdiction: ${activeDoc.jurisdiction || 'Jurisdiction Neutral'}`,
      'Status: Fully Processed and Validated',
    ],
    obligations_summary: `1. Key Obligation: Perform assigned obligations under ${activeDoc.title}.\n2. Notice Requirement: Written notice required prior to cancellation.\n3. Governing Law: ${activeDoc.jurisdiction || 'Jurisdiction Neutral'}`,
    confidence: 0.95,
    created_at: new Date().toISOString(),
  };

  const sampleGlossary: GlossaryTerm[] = [
    {
      id: 'glo_1',
      document_id: activeDoc.id,
      document_version_id: `ver_${activeDoc.id}_v1`,
      term: 'At-Will Employment / Termination',
      plain_language_definition: 'Either party can end the agreement at any time for lawful reasons with advance notice.',
      contextual_meaning: 'Allows voluntary resignation or employer termination with required notice.',
      source_reference: 'Section 4',
      created_at: new Date().toISOString(),
    },
    {
      id: 'glo_2',
      document_id: activeDoc.id,
      document_version_id: `ver_${activeDoc.id}_v1`,
      term: 'Indemnification',
      plain_language_definition: 'Duty to cover losses or legal costs caused by contract breach.',
      contextual_meaning: 'Protects parties against unauthorized third-party liabilities.',
      source_reference: 'Section 7',
      created_at: new Date().toISOString(),
    },
  ];

  const sampleEvents: TimelineEvent[] = [
    {
      id: 'evt_1',
      document_id: activeDoc.id,
      document_version_id: `ver_${activeDoc.id}_v1`,
      title: 'Agreement Commencement Date',
      event_date: activeDoc.created_at.substring(0, 10),
      event_type: 'effective_date',
      description: `Agreement for "${activeDoc.title}" takes effect and official start date.`,
      source_reference: 'Section 1.1',
      confidence: 0.98,
      created_at: new Date().toISOString(),
    },
    {
      id: 'evt_2',
      document_id: activeDoc.id,
      document_version_id: `ver_${activeDoc.id}_v1`,
      title: 'Annual Performance & Terms Review',
      event_date: '2027-02-01',
      event_type: 'milestone',
      description: 'Mandatory annual review for compensation and performance appraisal.',
      source_reference: 'Section 3.2',
      confidence: 0.95,
      created_at: new Date().toISOString(),
    },
    {
      id: 'evt_3',
      document_id: activeDoc.id,
      document_version_id: `ver_${activeDoc.id}_v1`,
      title: 'Termination Notice Deadline',
      event_date: '30 days prior to departure',
      event_type: 'notice_deadline',
      description: 'Written notice must be submitted at least 30 days before resignation.',
      source_reference: 'Section 5.1',
      confidence: 0.96,
      created_at: new Date().toISOString(),
    },
  ];

  const sampleActionPlan: ActionPlanResult = {
    actionPlan: {
      id: 'ap_1',
      user_id: 'user_demo',
      document_id: activeDoc.id,
      title: `Action Plan for ${activeDoc.title}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    checklist: [
      {
        id: 'chk_1',
        title: `Clarify Obligations Scope in ${activeDoc.title}`,
        recommendation: `Review geographic and duration limits in ${activeDoc.title} to ensure enforceability under ${activeDoc.jurisdiction || 'local law'}.`,
        severity: 'orange',
        sourceReference: 'Section 8.2',
        checked: false,
      },
      {
        id: 'chk_2',
        title: 'Confirm Intellectual Property & Side Projects',
        recommendation: 'Ensure personal side projects created outside working hours without company resources are excluded.',
        severity: 'yellow',
        sourceReference: 'Section 9.1',
        checked: false,
      },
    ],
    lawyerQuestions: [
      {
        id: 'lq_1',
        document_id: activeDoc.id,
        question: 'Does the notice requirement apply equally to termination without cause by either party?',
        reason: 'The current wording is ambiguous regarding severance obligations during dismissal.',
        priority: 'high',
        related_finding_id: null,
        source_reference: 'Section 5.1',
        created_at: new Date().toISOString(),
      },
    ],
    actionItems: [
      {
        id: 'task_1',
        action_plan_id: 'ap_1',
        title: `Review Terms for ${activeDoc.title}`,
        description: 'Verify all clauses and schedule a follow-up review with your legal professional.',
        priority: 'high',
        status: 'pending',
        due_date: '2026-02-01',
        related_finding_id: null,
        source_reference: 'Section 9.3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  const handleUploadSuccess = (newDocRecord: Record<string, unknown>) => {
    const uploadedDoc = newDocRecord as unknown as Document;
    const updatedDocs = saveUploadedDocument(uploadedDoc);
    setDocuments(updatedDocs);
    setActiveDoc(uploadedDoc);
    setXRayOverview(createOverviewForDoc(uploadedDoc));
    setActiveTab('xray');
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = deleteStoredDocument(id);
    setDocuments(updatedDocs);
    if (activeDoc.id === id && updatedDocs.length > 0) {
      setActiveDoc(updatedDocs[0]);
      setXRayOverview(createOverviewForDoc(updatedDocs[0]));
    }
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
          <div className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-400" />
                Legal X-Ray Analysis Report
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Detailed AI-assisted document classification by severity level (🔴 🟠 🟡 🟢) and finding kind with verbatim source citations.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Analyzing: {activeDoc.original_filename}</span>
            </span>
          </div>
          <LegalXRayDashboard overview={xrayOverview} />
        </div>
      )}

      {activeTab === 'simplification' && (
        <SimplificationViewer initialSummary={sampleSummary} glossary={sampleGlossary} />
      )}

      {activeTab === 'qa' && (
        <DocumentQAChat documentId={activeDoc.id} documentTitle={activeDoc.title} />
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
