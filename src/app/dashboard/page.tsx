'use client';

import React, { useState } from 'react';
import { DocumentUploadZone } from '@/components/upload/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { SimplificationViewer } from '@/components/simplification/SimplificationViewer';
import { DocumentQAChat } from '@/components/qa/DocumentQAChat';
import { Document, DocumentSummary, GlossaryTerm } from '@/types/database';
import { FileText, BookOpen, MessageSquare, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'simplification' | 'qa'>('upload');
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
            Navigate, simplify, and ask grounded questions about your legal documents.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
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
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="space-y-8">
          <DocumentUploadZone onUploadSuccess={handleUploadSuccess} />
          <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} />
        </div>
      )}

      {activeTab === 'simplification' && (
        <SimplificationViewer initialSummary={sampleSummary} glossary={sampleGlossary} />
      )}

      {activeTab === 'qa' && (
        <DocumentQAChat documentId="doc_sample_1" documentTitle="Sample Employment Agreement" />
      )}
    </div>
  );
}
