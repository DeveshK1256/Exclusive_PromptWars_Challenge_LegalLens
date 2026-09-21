'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { validateFileMetadata } from '@/lib/config';
import { DocumentType, ContextRole } from '@/types/database';
import { detectDocumentType, DocTypeDetectionResult } from '@/lib/intelligence/docTypeDetector';
import { BENCHMARK_NDA, BENCHMARK_EMPLOYMENT, BENCHMARK_LEASE } from '@/lib/ai/benchmark/fixtures';
import { getCurrentUserEmail } from '@/lib/documentStorage';

interface DocumentUploadZoneProps {
  onUploadSuccess?: (document: Record<string, unknown>) => void;
  onViewReport?: () => void;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({ onUploadSuccess, onViewReport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [jurisdiction, setJurisdiction] = useState<string>('');
  const [contextRole, setContextRole] = useState<ContextRole>('Employee');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [autoDetectNotice, setAutoDetectNotice] = useState<DocTypeDetectionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAutoDetectNotice(null);

    const validation = validateFileMetadata(selectedFile.name, selectedFile.type, selectedFile.size);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(selectedFile);

    // Run deterministic document type auto-detection
    try {
      const textSample = selectedFile.name + ' ' + (await selectedFile.text().catch(() => ''));
      const detected = detectDocumentType(textSample);
      if (detected.detectedType !== 'other') {
        setAutoDetectNotice(detected);
      }
    } catch {
      // Ignore text read failures on binary files
    }
  };

  const applyAutoDetectedType = () => {
    if (autoDetectNotice) {
      setDocumentType(autoDetectNotice.detectedType);
      setAutoDetectNotice(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a valid PDF, DOCX, or TXT file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setProgressStage('✓ Uploading securely...');
      await new Promise((r) => setTimeout(r, 300));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('jurisdiction', jurisdiction);
      formData.append('context_role', contextRole);
      formData.append('user_email', getCurrentUserEmail());

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMsg(`Document "${file.name}" uploaded successfully!`);
      if (onUploadSuccess && data.document) {
        onUploadSuccess(data.document);
      }

      setFile(null);
      setJurisdiction('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setErrorMsg(message);
    } finally {
      setIsUploading(false);
      setProgressStage('');
    }
  };

  const loadDemoBenchmarkDoc = (fixture: typeof BENCHMARK_NDA, type: DocumentType) => {
    const demoDoc = {
      id: fixture.id,
      user_id: getCurrentUserEmail() || 'authenticated_user',
      title: fixture.title,
      original_filename: `${fixture.title.replace(/\s+/g, '_')}.pdf`,
      mime_type: 'application/pdf',
      file_size: 1250000,
      file_hash: `hash_${fixture.id}`,
      storage_path: `documents/demo/${fixture.id}.pdf`,
      document_type: type,
      jurisdiction: fixture.userJurisdiction || 'Delaware, US',
      status: 'completed',
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      raw_text: fixture.rawText,
      sections: fixture.sections,
    };

    setSuccessMsg(`Loaded Demo Benchmark: "${fixture.title}"!`);
    if (onUploadSuccess) {
      onUploadSuccess(demoDoc);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Demo Sandbox Bar */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Demo Sandbox (Instant 1-Click Exploration)</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Hand-Verified Sprint 12 Benchmark Fixtures
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Try LegalLens AI immediately without uploading your own document by exploring one of our verified benchmark samples:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => loadDemoBenchmarkDoc(BENCHMARK_NDA, 'nda')}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left transition-colors shadow-xs group cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Mutual NDA Demo
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Confidentiality &amp; Remedies</div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => loadDemoBenchmarkDoc(BENCHMARK_EMPLOYMENT, 'employment_contract')}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left transition-colors shadow-xs group cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Employment Agreement
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Non-Compete &amp; IP</div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => loadDemoBenchmarkDoc(BENCHMARK_LEASE, 'rental_agreement')}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left transition-colors shadow-xs group cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Lease Agreement Demo
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Rent, Deposit &amp; Grace Days</div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. Upload Form Drop Zone */}
      <form onSubmit={handleUploadSubmit} className="space-y-4">
        <input
          ref={fileInputRef}
          id="file-upload-input"
          aria-label="Upload document file input"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload legal document file zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {file ? file.name : 'Click to upload or drag & drop document'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, DOCX, TXT up to 10 MB. Encrypted &amp; private storage.
            </p>
          </div>
        </div>

        {/* Auto-Detection Banner */}
        {autoDetectNotice && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                Auto-Detected Type: {autoDetectNotice.displayName}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-mono">
                Scoped strictly to document_type. Jurisdiction is NEVER inferred (Decision 10).
              </span>
            </div>
            <button
              type="button"
              onClick={applyAutoDetectedType}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0"
            >
              Confirm Type ({autoDetectNotice.displayName})
            </button>
          </div>
        )}

        {/* Form Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <label htmlFor="document-type-select" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Category:</label>
            <select
              id="document-type-select"
              aria-label="Document Category"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="rental_agreement">Rental &amp; Lease Agreement</option>
              <option value="employment_contract">Employment Contract</option>
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
              <option value="terms_of_service">Terms of Service / Conditions</option>
              <option value="policy_document">Privacy Policy Document</option>
              <option value="loan_document">Loan &amp; Credit Agreement</option>
              <option value="service_agreement">Service Agreement / SLA</option>
              <option value="other">General Legal Document</option>
            </select>
          </div>

          <div>
            <label htmlFor="jurisdiction-input" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jurisdiction (User-Supplied):</label>
            <input
              id="jurisdiction-input"
              aria-label="Jurisdiction (User-Supplied)"
              type="text"
              placeholder="e.g. California, US (Optional)"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="context-role-select" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Impact Perspective:</label>
            <select
              id="context-role-select"
              aria-label="Personal Impact Perspective"
              value={contextRole}
              onChange={(e) => setContextRole(e.target.value as ContextRole)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="Tenant">Tenant / Renter</option>
              <option value="Employee">Employee / Hire</option>
              <option value="Freelancer">Freelancer / Contractor</option>
              <option value="Consumer">Consumer / App User</option>
              <option value="Borrower">Borrower</option>
              <option value="General">General Reader</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {onViewReport && (
              <button
                type="button"
                onClick={onViewReport}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
              >
                View Analysis Report →
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          {isUploading ? progressStage || 'Analyzing Document...' : 'Run Grounded Legal Analysis'}
        </button>
      </form>
    </div>
  );
};
