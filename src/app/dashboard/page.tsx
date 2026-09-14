'use client';

import React, { useState, useEffect } from 'react';
import { DocumentUploadZone } from '@/components/upload/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { SimplificationViewer } from '@/components/simplification/SimplificationViewer';
import { DocumentQAChat } from '@/components/qa/DocumentQAChat';
import { LegalTimelineViewer } from '@/components/timeline/LegalTimelineViewer';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { LegalXRayDashboard } from '@/components/xray/LegalXRayDashboard';
import { Document } from '@/types/database';
import { getStoredDocuments, saveUploadedDocument, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import {
  generateRealXRayOverview,
  generateRealSummary,
  generateRealTimeline,
  generateRealActionPlan,
} from '@/lib/documentAnalysis';
import { FileText, Shield, BookOpen, MessageSquare, Calendar, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action'>('upload');
  const [documents, setDocuments] = useState<Document[]>([DEFAULT_SAMPLE_DOC]);
  const [activeDoc, setActiveDoc] = useState<Document>(DEFAULT_SAMPLE_DOC);

  useEffect(() => {
    const storedDocs = getStoredDocuments();
    setDocuments(storedDocs);
    if (storedDocs.length > 0) {
      setActiveDoc(storedDocs[0]);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['upload', 'xray', 'simplification', 'qa', 'timeline', 'action'].includes(tabParam)) {
        setActiveTab(tabParam as 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action');
      }
    }
  }, []);

  const xrayOverview = generateRealXRayOverview(activeDoc);
  const { summary: sampleSummary, glossary: sampleGlossary } = generateRealSummary(activeDoc);
  const sampleEvents = generateRealTimeline(activeDoc);
  const sampleActionPlan = generateRealActionPlan(activeDoc);

  const handleUploadSuccess = (newDocRecord: Record<string, unknown>) => {
    const uploadedDoc = newDocRecord as unknown as Document;
    const updatedDocs = saveUploadedDocument(uploadedDoc);
    setDocuments(updatedDocs);
    setActiveDoc(uploadedDoc);
    setActiveTab('xray');
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = deleteStoredDocument(id);
    setDocuments(updatedDocs);
    if (activeDoc.id === id && updatedDocs.length > 0) {
      setActiveDoc(updatedDocs[0]);
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
          <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} onSelectTab={setActiveTab} onSelectDocument={setActiveDoc} />
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
        <DocumentQAChat documentId={activeDoc.id} documentTitle={activeDoc.title} rawText={activeDoc.raw_text} />
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
