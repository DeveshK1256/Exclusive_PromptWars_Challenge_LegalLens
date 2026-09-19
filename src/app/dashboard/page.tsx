'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentUploadZone } from '@/components/upload/DocumentUploadZone';
import { DocumentList } from '@/components/documents/DocumentList';
import { SimplificationViewer } from '@/components/simplification/SimplificationViewer';
import { DocumentQAChat } from '@/components/qa/DocumentQAChat';
import { LegalTimelineViewer } from '@/components/timeline/LegalTimelineViewer';
import { ActionPlanViewer } from '@/components/action/ActionPlanViewer';
import { LegalXRayDashboard } from '@/components/xray/LegalXRayDashboard';
import { Document, DocumentType, DocumentSummary, GlossaryTerm, ComplexityLevel, TimelineEvent } from '@/types/database';
import { getStoredDocuments, saveUploadedDocument, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import { LegalXRayOverview } from '@/lib/xray/types';
import { ActionPlanResult } from '@/lib/action/types';
import {
  generateRealXRayOverview,
  generateRealSummary,
  generateRealTimeline,
  generateRealActionPlan,
} from '@/lib/documentAnalysis';
import { DeadlineReminderBanner } from '@/components/timeline/DeadlineReminderBanner';
import { FileText, Shield, BookOpen, MessageSquare, Calendar, CheckSquare, Sparkles, Loader2 } from 'lucide-react';

// ── Per-document AI result cache ─────────────────────────────────────────────
interface AIDocCache {
  xray?: LegalXRayOverview;
  simplification?: { summary: DocumentSummary; glossary: GlossaryTerm[]; allSummaries?: Record<ComplexityLevel, DocumentSummary> };
  timeline?: { events: TimelineEvent[]; upcomingDeadlinesCount: number };
  actionPlan?: ActionPlanResult;
}

type TabKey = 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action';

// ── Loading Spinner Component ────────────────────────────────────────────────
function GeminiLoadingSpinner({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Gemini AI is analysing your document…
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Running {feature} with grounded evidence extraction. This may take a few seconds.
        </p>
      </div>
    </div>
  );
}

// ── Error Banner Component ───────────────────────────────────────────────────
function AIErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-sm space-y-2">
      <p className="text-amber-800 dark:text-amber-300 font-semibold">⚠️ Gemini AI returned an error</p>
      <p className="text-amber-700 dark:text-amber-400 text-xs">{message}</p>
      <p className="text-amber-600 dark:text-amber-500 text-xs">Showing heuristic fallback analysis. Results below are pattern-matched, not AI-generated.</p>
      <button
        onClick={onRetry}
        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
      >
        Retry with Gemini AI
      </button>
    </div>
  );
}

// ── Sample Documents ─────────────────────────────────────────────────────────
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
    user_id: 'demo@legallens.ai',
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
    user_id: 'demo@legallens.ai',
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
    user_id: 'demo@legallens.ai',
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
  const [activeTab, setActiveTab] = useState<TabKey>('upload');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [autoDetectedBanner, setAutoDetectedBanner] = useState<string | null>(null);

  // AI result cache: keyed by document ID → cached Gemini results per feature
  const [aiCache, setAICache] = useState<Record<string, AIDocCache>>({});
  // Loading flags per feature
  const [aiLoading, setAILoading] = useState<Record<string, boolean>>({});
  // Error messages per feature (docId:feature → message)
  const [aiErrors, setAIErrors] = useState<Record<string, string>>({});
  // Track in-flight requests to prevent duplicates
  const inflightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const storedDocs = getStoredDocuments();
    setDocuments(storedDocs);
    if (storedDocs.length > 0) {
      setActiveDoc(storedDocs[0]);
    } else {
      setActiveDoc(null);
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
        setActiveTab(tabParam as TabKey);
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

  // ── Gemini API Fetch Functions ───────────────────────────────────────────
  const fetchGeminiXRay = useCallback(async (doc: Document) => {
    const cacheKey = `${doc.id}:xray`;
    if (inflightRef.current.has(cacheKey)) return;
    inflightRef.current.add(cacheKey);
    setAILoading(prev => ({ ...prev, [cacheKey]: true }));
    setAIErrors(prev => { const n = { ...prev }; delete n[cacheKey]; return n; });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`/api/documents/${doc.id}/xray`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: doc.raw_text, jurisdiction: doc.jurisdiction }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAICache(prev => ({
          ...prev,
          [doc.id]: { ...prev[doc.id], xray: json.data as LegalXRayOverview },
        }));
      } else {
        throw new Error(json.error || 'X-Ray API returned an error');
      }
    } catch (err: any) {
      clearTimeout(timer);
      setAIErrors(prev => ({ ...prev, [cacheKey]: err?.message || 'Failed to run X-Ray' }));
    } finally {
      clearTimeout(timer);
      setAILoading(prev => ({ ...prev, [cacheKey]: false }));
      inflightRef.current.delete(cacheKey);
    }
  }, []);

  const fetchGeminiSimplification = useCallback(async (doc: Document) => {
    const cacheKey = `${doc.id}:simplification`;
    if (inflightRef.current.has(cacheKey)) return;
    inflightRef.current.add(cacheKey);
    setAILoading(prev => ({ ...prev, [cacheKey]: true }));
    setAIErrors(prev => { const n = { ...prev }; delete n[cacheKey]; return n; });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`/api/documents/${doc.id}/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: doc.raw_text, level: 'very_simple' }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const json = await res.json();
      if (res.ok && json.success) {
        setAICache(prev => ({
          ...prev,
          [doc.id]: {
            ...prev[doc.id],
            simplification: {
              summary: json.summary,
              glossary: json.glossary || [],
              allSummaries: json.allSummaries,
            },
          },
        }));
      } else {
        throw new Error(json.error || 'Simplification API returned an error');
      }
    } catch (err: any) {
      clearTimeout(timer);
      setAIErrors(prev => ({ ...prev, [cacheKey]: err?.message || 'Failed to simplify' }));
    } finally {
      clearTimeout(timer);
      setAILoading(prev => ({ ...prev, [cacheKey]: false }));
      inflightRef.current.delete(cacheKey);
    }
  }, []);

  const fetchGeminiTimeline = useCallback(async (doc: Document) => {
    const cacheKey = `${doc.id}:timeline`;
    if (inflightRef.current.has(cacheKey)) return;
    inflightRef.current.add(cacheKey);
    setAILoading(prev => ({ ...prev, [cacheKey]: true }));
    setAIErrors(prev => { const n = { ...prev }; delete n[cacheKey]; return n; });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`/api/documents/${doc.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: doc.raw_text }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAICache(prev => ({
          ...prev,
          [doc.id]: {
            ...prev[doc.id],
            timeline: {
              events: json.data.events || [],
              upcomingDeadlinesCount: json.data.upcomingDeadlinesCount || 0,
            },
          },
        }));
      } else {
        throw new Error(json.error || 'Timeline API returned an error');
      }
    } catch (err: any) {
      clearTimeout(timer);
      setAIErrors(prev => ({ ...prev, [cacheKey]: err?.message || 'Failed to extract timeline' }));
    } finally {
      clearTimeout(timer);
      setAILoading(prev => ({ ...prev, [cacheKey]: false }));
      inflightRef.current.delete(cacheKey);
    }
  }, []);

  const fetchGeminiActionPlan = useCallback(async (doc: Document) => {
    const cacheKey = `${doc.id}:actionPlan`;
    if (inflightRef.current.has(cacheKey)) return;
    inflightRef.current.add(cacheKey);
    setAILoading(prev => ({ ...prev, [cacheKey]: true }));
    setAIErrors(prev => { const n = { ...prev }; delete n[cacheKey]; return n; });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`/api/documents/${doc.id}/action-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: doc.raw_text }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAICache(prev => ({
          ...prev,
          [doc.id]: { ...prev[doc.id], actionPlan: json.data as ActionPlanResult },
        }));
      } else {
        throw new Error(json.error || 'Action Plan API returned an error');
      }
    } catch (err: any) {
      clearTimeout(timer);
      setAIErrors(prev => ({ ...prev, [cacheKey]: err?.message || 'Failed to generate action plan' }));
    } finally {
      clearTimeout(timer);
      setAILoading(prev => ({ ...prev, [cacheKey]: false }));
      inflightRef.current.delete(cacheKey);
    }
  }, []);

  // ── Trigger Gemini fetch when tab or document changes ──────────────────
  useEffect(() => {
    if (!activeDoc) return;
    const docWithText = activeDoc.raw_text ? activeDoc : { ...activeDoc, raw_text: DEFAULT_SAMPLE_DOC.raw_text };
    const docCache = aiCache[docWithText.id] || {};

    if (activeTab === 'xray' && !docCache.xray && !aiLoading[`${docWithText.id}:xray`]) {
      fetchGeminiXRay(docWithText);
    } else if (activeTab === 'simplification' && !docCache.simplification && !aiLoading[`${docWithText.id}:simplification`]) {
      fetchGeminiSimplification(docWithText);
    } else if (activeTab === 'timeline' && !docCache.timeline && !aiLoading[`${docWithText.id}:timeline`]) {
      fetchGeminiTimeline(docWithText);
    } else if (activeTab === 'action' && !docCache.actionPlan && !aiLoading[`${docWithText.id}:actionPlan`]) {
      fetchGeminiActionPlan(docWithText);
    }
  }, [activeTab, activeDoc?.id]);

  // ── Heuristic fallback data (used only when API fails) ─────────────────
  const targetDoc = activeDoc || DEFAULT_SAMPLE_DOC;
  const heuristicXRay = generateRealXRayOverview(targetDoc);
  const { summary: heuristicSummary, glossary: heuristicGlossary } = generateRealSummary(targetDoc);
  const heuristicEvents = generateRealTimeline(targetDoc);
  const heuristicActionPlan = generateRealActionPlan(targetDoc);

  // ── Resolved data: prefer AI cache, fall back to heuristic on error ────
  const docCache = activeDoc ? (aiCache[activeDoc.id] || {}) : {};
  const xrayData = activeDoc ? (docCache.xray || (aiErrors[`${activeDoc.id}:xray`] ? heuristicXRay : null)) : null;
  const simplData = activeDoc ? (docCache.simplification || (aiErrors[`${activeDoc.id}:simplification`] ? { summary: heuristicSummary, glossary: heuristicGlossary } : null)) : null;
  const timelineData = activeDoc ? (docCache.timeline || (aiErrors[`${activeDoc.id}:timeline`] ? { events: heuristicEvents, upcomingDeadlinesCount: 1 } : null)) : null;
  const actionData = activeDoc ? (docCache.actionPlan || (aiErrors[`${activeDoc.id}:actionPlan`] ? heuristicActionPlan : null)) : null;

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
    if (activeDoc && activeDoc.id === id) {
      setActiveDoc(updatedDocs.length > 0 ? updatedDocs[0] : null);
    }
  };

  // Retry handler: clears cache for this doc+feature so it re-fetches
  const handleRetry = (feature: 'xray' | 'simplification' | 'timeline' | 'actionPlan') => {
    if (!activeDoc) return;
    const mapKey = feature === 'actionPlan' ? 'actionPlan' : feature;
    const cacheKey = `${activeDoc.id}:${mapKey}`;
    setAIErrors(prev => { const n = { ...prev }; delete n[cacheKey]; return n; });
    setAICache(prev => {
      const docEntry = { ...prev[activeDoc.id] };
      delete docEntry[feature];
      return { ...prev, [activeDoc.id]: docEntry };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">LegalLens AI Workspace</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            GenAI-powered legal document analysis — simplify, compare, highlight risks, answer questions, and prepare for your legal professional.
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
      <DeadlineReminderBanner documents={documents} userId={activeDoc?.user_id || 'demo@legallens.ai'} onNavigateTab={setActiveTab} />

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

      {activeTab !== 'upload' && !activeDoc && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Document Uploaded Yet</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Your document workspace is empty. Please upload a PDF, DOCX, or TXT legal document to unlock GenAI Legal X-Ray analysis, simplification, timeline, and action plans.
          </p>
          <button
            onClick={() => setActiveTab('upload')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Upload Document Now
          </button>
        </div>
      )}

      {activeTab === 'xray' && activeDoc && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap gap-3 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Legal X-Ray Analysis Report
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Gemini AI document classification by severity level (🔴 🟠 🟡 🟢) and domain scorecards with verbatim citations.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Analyzing: {activeDoc.original_filename}</span>
            </span>
          </div>
          {aiLoading[`${activeDoc.id}:xray`] && (
            <GeminiLoadingSpinner feature="Legal X-Ray analysis" />
          )}
          {aiErrors[`${activeDoc.id}:xray`] && (
            <AIErrorBanner message={aiErrors[`${activeDoc.id}:xray`]} onRetry={() => handleRetry('xray')} />
          )}
          <LegalXRayDashboard
            overview={xrayData || heuristicXRay}
            documentTitle={activeDoc.title}
            documentType={activeDoc.document_type}
            jurisdiction={activeDoc.jurisdiction || 'Jurisdiction Neutral'}
          />
        </div>
      )}

      {activeTab === 'simplification' && activeDoc && (
        <div className="space-y-6">
          {aiLoading[`${activeDoc.id}:simplification`] && (
            <GeminiLoadingSpinner feature="multi-level document simplification" />
          )}
          {aiErrors[`${activeDoc.id}:simplification`] && (
            <AIErrorBanner message={aiErrors[`${activeDoc.id}:simplification`]} onRetry={() => handleRetry('simplification')} />
          )}
          <SimplificationViewer
            initialSummary={simplData?.summary || heuristicSummary}
            allSummaries={simplData?.allSummaries}
            glossary={simplData?.glossary || heuristicGlossary}
            rawText={activeDoc.raw_text}
          />
        </div>
      )}

      {activeTab === 'qa' && activeDoc && (
        <DocumentQAChat documentId={activeDoc.id} documentTitle={activeDoc.title} rawText={activeDoc.raw_text} />
      )}

      {activeTab === 'timeline' && activeDoc && (
        <div className="space-y-6">
          {aiLoading[`${activeDoc.id}:timeline`] && (
            <GeminiLoadingSpinner feature="legal timeline & deadline extraction" />
          )}
          {aiErrors[`${activeDoc.id}:timeline`] && (
            <AIErrorBanner message={aiErrors[`${activeDoc.id}:timeline`]} onRetry={() => handleRetry('timeline')} />
          )}
          <LegalTimelineViewer
            events={timelineData?.events || heuristicEvents}
            upcomingDeadlinesCount={timelineData?.upcomingDeadlinesCount ?? 1}
          />
        </div>
      )}

      {activeTab === 'action' && activeDoc && (
        <div className="space-y-6">
          {aiLoading[`${activeDoc.id}:actionPlan`] && (
            <GeminiLoadingSpinner feature="Action Plan & Checklist" />
          )}
          {aiErrors[`${activeDoc.id}:actionPlan`] && (
            <AIErrorBanner message={aiErrors[`${activeDoc.id}:actionPlan`]} onRetry={() => handleRetry('actionPlan')} />
          )}
          <ActionPlanViewer data={actionData || heuristicActionPlan} />
        </div>
      )}
    </div>
  );
}
