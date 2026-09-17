'use client';

import React, { useState, useEffect } from 'react';
import { DocumentUploadZone } from '@/components/upload/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { SimplificationViewer } from '@/components/simplification/SimplificationViewer';
import { DocumentQAChat } from '@/components/qa/DocumentQAChat';
import { LegalTimelineViewer } from '@/components/timeline/LegalTimelineViewer';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { LegalXRayDashboard } from '@/components/xray/LegalXRayDashboard';
import { Document, DocumentType } from '@/types/database';
import { getStoredDocuments, saveUploadedDocument, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import {
  generateRealXRayOverview,
  generateRealSummary,
  generateRealTimeline,
  generateRealActionPlan,
} from '@/lib/documentAnalysis';
import { DeadlineReminderBanner } from '@/components/timeline/DeadlineReminderBanner';
import { FileText, Shield, BookOpen, MessageSquare, Calendar, CheckSquare, Sparkles, CheckCircle2 } from 'lucide-react';

const SAMPLE_DOCS: Record<string, Document> = {
  rental_lease: {
    id: 'doc_sample_rental',
    user_id: 'user_demo',
    title: 'Sample Apartment Lease Agreement',
    original_filename: 'Apartment_Lease_Agreement_2026.pdf',
    mime_type: 'application/pdf',
    file_size: 1850000,
    file_hash: 'hash_rental_lease',
    storage_path: 'documents/demo/rental.pdf',
    document_type: 'rental_agreement',
    jurisdiction: 'California, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `RESIDENTIAL APARTMENT LEASE AGREEMENT
1. PARTIES & PREMISES: Landlord John Smith leases to Tenant Jane Doe Apartment 4B located at 123 Main Street, San Francisco, CA 94105.
2. RENT & LATE FEES: Monthly rent is $2,500 due on the 1st of each month. Payments received after the 5th day grace period are subject to a $50 flat late fee plus $10 per day interest until paid.
3. SECURITY DEPOSIT: Tenant deposits $2,500. Landlord agrees to return the deposit within 21 days post move-out minus documented itemized repairs.
4. LEASE TERM & RENEWAL NOTICE: 12-month lease starting October 1, 2026. Either party must provide 60 days written notice prior to expiration to terminate or renew.
5. SUBLETTING & PETS: Subletting is strictly prohibited without advance written consent. No pets permitted without landlord approval.
6. GOVERNING LAW: Governed by the laws of California.`,
  },
  employment_contract: {
    id: 'doc_sample_employment',
    user_id: 'user_demo',
    title: 'Sample Employment & Non-Compete Agreement',
    original_filename: 'Senior_Engineer_Employment_Agreement.pdf',
    mime_type: 'application/pdf',
    file_size: 2450000,
    file_hash: 'hash_employment',
    storage_path: 'documents/demo/employment.pdf',
    document_type: 'employment_contract',
    jurisdiction: 'California, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `EXECUTIVE EMPLOYMENT & NON-COMPETE AGREEMENT
1. POSITION & DUTIES: Employee shall serve as Senior Software Engineer. Flexible remote work up to 2 days per week with manager approval.
2. COMPENSATION: Annual base salary of $120,000 payable monthly ($10,000/month). Eligible for health, vision, and 401(k) benefits. Performance review on February 1, 2027.
3. RESTRICTIVE COVENANTS & NON-COMPETE: Employee agrees that during employment and for 12 months post-employment, Employee shall not engage in competing business within 25 miles of San Francisco.
4. INVENTION ASSIGNMENT: All code, inventions, ideas, and intellectual property developed during employment belong 100% to Employer.
5. TERMINATION NOTICE: 30 days written notice required prior to termination by either party.`,
  },
  tos_privacy_policy: {
    id: 'doc_sample_tos',
    user_id: 'user_demo',
    title: 'Sample App Terms of Service & Privacy Policy',
    original_filename: 'Global_App_Terms_of_Service_2026.pdf',
    mime_type: 'application/pdf',
    file_size: 1450000,
    file_hash: 'hash_tos',
    storage_path: 'documents/demo/tos.pdf',
    document_type: 'terms_of_service',
    jurisdiction: 'Delaware, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `TERMS OF SERVICE & PRIVACY POLICY
1. DATA COLLECTION & PERMISSIONS: We collect device model, crash logs, IP address, browsing activity, and precise GPS location data to personalize services. We may share anonymized data with 3rd-party data brokers.
2. MANDATORY ARBITRATION & JURY WAIVER: All legal disputes must be resolved through binding individual arbitration. You waive any right to jury trial.
3. CLASS ACTION WAIVER: You waive any right to initiate, join, or participate in class action lawsuits against the provider.
4. CONTENT LICENSE: You grant provider a worldwide, royalty-free, perpetual license to host, display, and distribute user content uploaded to the service.`,
  },
  loan_document: {
    id: 'doc_sample_loan',
    user_id: 'user_demo',
    title: 'Sample Personal Loan & Credit Agreement',
    original_filename: 'Personal_Loan_Agreement_2026.pdf',
    mime_type: 'application/pdf',
    file_size: 1950000,
    file_hash: 'hash_loan',
    storage_path: 'documents/demo/loan.pdf',
    document_type: 'loan_document',
    jurisdiction: 'New York, US',
    status: 'completed',
    deleted_at: null,
    retention_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    raw_text: `PERSONAL LOAN & CREDIT AGREEMENT
1. LOAN AMOUNT & INTEREST RATE: Borrower receives principal sum of $15,000 at 8.5% fixed annual interest rate.
2. PAYMENT SCHEDULE & DUE DATES: Monthly installment of $370 is due on the 15th of each calendar month starting November 15, 2026. Final payoff maturity date is October 15, 2030.
3. GRACE PERIOD & LATE CHARGES: A 10-day grace period is provided. Payments received after the 25th of the month incur a $35 late charge.
4. NOTICE WINDOW & PREPAYMENT: Borrower may prepay principal at any time without penalty. Written 30-day notice is required before changing payment accounts.
5. DEFAULT & CURE DEADLINE: Overdue balance past 30 days triggers formal Notice of Default. Borrower must cure default within 15 calendar days to prevent acceleration.`,
  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action'>('upload');
  const [documents, setDocuments] = useState<Document[]>([DEFAULT_SAMPLE_DOC]);
  const [activeDoc, setActiveDoc] = useState<Document>(DEFAULT_SAMPLE_DOC);
  const [autoDetectedBanner, setAutoDetectedBanner] = useState<string | null>(null);

  useEffect(() => {
    const storedDocs = getStoredDocuments();
    setDocuments(storedDocs);
    if (storedDocs.length > 0) {
      setActiveDoc(storedDocs[0]);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const sampleParam = params.get('sample');

      if (sampleParam && SAMPLE_DOCS[sampleParam]) {
        const sampleDoc = SAMPLE_DOCS[sampleParam];
        setActiveDoc(sampleDoc);
        setActiveTab('xray');
        setAutoDetectedBanner(`Loaded Demo Sandbox: ${sampleDoc.title}`);
      } else if (tabParam && ['upload', 'xray', 'simplification', 'qa', 'timeline', 'action'].includes(tabParam)) {
        setActiveTab(tabParam as 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action');
      }
    }
  }, []);

  // Document Auto-Detection Logic
  useEffect(() => {
    if (!activeDoc || !activeDoc.raw_text) return;
    const text = activeDoc.raw_text.toLowerCase();

    let detectedType: DocumentType | null = null;
    if (text.includes('lease') || text.includes('rent') || text.includes('landlord') || text.includes('tenant')) {
      detectedType = 'rental_agreement';
    } else if (text.includes('employment') || text.includes('employee') || text.includes('salary') || text.includes('non-compete')) {
      detectedType = 'employment_contract';
    } else if (text.includes('terms of service') || text.includes('privacy policy') || text.includes('arbitration') || text.includes('data broker')) {
      detectedType = 'terms_of_service';
    } else if (text.includes('loan') || text.includes('borrower') || text.includes('interest rate') || text.includes('installment')) {
      detectedType = 'loan_document';
    } else if (text.includes('service agreement') || text.includes('contractor') || text.includes('statement of work')) {
      detectedType = 'service_agreement';
    }

    if (detectedType && detectedType !== activeDoc.document_type) {
      const updated = { ...activeDoc, document_type: detectedType };
      setActiveDoc(updated);
      setAutoDetectedBanner(`Document Auto-Detection: Looks like a ${detectedType.replace(/_/g, ' ').toUpperCase()} — switched analysis scorecard!`);
    }
  }, [activeDoc?.id]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">LegalLens AI Workspace</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Navigate, examine Legal X-Ray analysis reports, simplify clauses, inspect timelines, and execute action plans.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('xray')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'xray' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Analysis Report
          </button>
          <button
            onClick={() => setActiveTab('simplification')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'simplification' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Simplification
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'qa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Grounded Q&amp;A
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'action' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Action Plan
          </button>
        </div>
      </div>

      {/* Feature 1: Upcoming Deadline Reminders Banner */}
      <DeadlineReminderBanner documents={documents} userId={activeDoc.user_id} onNavigateTab={setActiveTab} />

      {/* Auto-Detection / Demo Banner */}
      {autoDetectedBanner && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-xl text-indigo-800 dark:text-indigo-300 text-xs font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {autoDetectedBanner}
          </span>
          <button
            type="button"
            onClick={() => setAutoDetectedBanner(null)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-8">
          <DocumentUploadZone onUploadSuccess={handleUploadSuccess} onViewReport={() => setActiveTab('xray')} />
          <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} onSelectTab={setActiveTab} onSelectDocument={setActiveDoc} />
        </div>
      )}

      {activeTab === 'xray' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap gap-3 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Legal X-Ray Analysis Report
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Detailed AI-assisted document classification by severity level (🔴 🟠 🟡 🟢) and domain scorecards with verbatim citations.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Analyzing: {activeDoc.original_filename}</span>
            </span>
          </div>
          <LegalXRayDashboard
            overview={xrayOverview}
            documentTitle={activeDoc.title}
            documentType={activeDoc.document_type}
            jurisdiction={activeDoc.jurisdiction || 'Jurisdiction Neutral'}
          />
        </div>
      )}

      {activeTab === 'simplification' && (
        <SimplificationViewer initialSummary={sampleSummary} glossary={sampleGlossary} rawText={activeDoc.raw_text} />
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
