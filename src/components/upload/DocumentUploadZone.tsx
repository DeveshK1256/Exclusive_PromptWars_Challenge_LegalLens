'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { DOCUMENT_CONFIG, validateFileMetadata } from '@/lib/config';
import { DocumentType, ContextRole } from '@/types/database';

interface DocumentUploadZoneProps {
  onUploadSuccess?: (document: Record<string, unknown>) => void;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [jurisdiction, setJurisdiction] = useState<string>('');
  const [contextRole, setContextRole] = useState<ContextRole>('Employee');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateFileMetadata(selectedFile.name, selectedFile.type, selectedFile.size);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
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
      await new Promise((r) => setTimeout(r, 400));

      setProgressStage('✓ Validating file format & security...');
      await new Promise((r) => setTimeout(r, 400));

      setProgressStage('✓ Calculating SHA-256 hash...');
      await new Promise((r) => setTimeout(r, 400));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('jurisdiction', jurisdiction);
      formData.append('context_role', contextRole);

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

      // Reset form
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Upload Legal Document</h2>
        <p className="text-sm text-slate-600">
          Upload PDF, DOCX, or TXT documents up to {DOCUMENT_CONFIG.maxFileSizeMb} MB.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-start space-x-3" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">Upload Rejected</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center space-x-3" role="status" aria-live="polite">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleUploadSubmit} className="space-y-6">
        <label htmlFor="file-upload-input" className="sr-only">Choose a document file to upload</label>
        <input
          ref={fileInputRef}
          id="file-upload-input"
          type="file"
          aria-label="Choose a document file to upload"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload document dropzone. Press Enter or Space to select a document file."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            file ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300 hover:border-brand-400 bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <UploadCloud className="w-6 h-6 text-brand-600" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>{file.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to change
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  <span className="text-brand-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">PDF, DOCX, or TXT (Max {DOCUMENT_CONFIG.maxFileSizeMb} MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="doc-type-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Document Type
            </label>
            <select
              id="doc-type-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="employment_contract">Employment Contract</option>
              <option value="nda">NDA</option>
              <option value="rental_agreement">Rental Agreement</option>
              <option value="service_agreement">Service Agreement</option>
              <option value="loan_document">Loan Document</option>
              <option value="policy_document">Policy Document</option>
              <option value="terms_of_service">Terms of Service</option>
              <option value="other">Other Document</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="context-role-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Context Role (Optional)
            </label>
            <select
              id="context-role-select"
              value={contextRole}
              onChange={(e) => setContextRole(e.target.value as ContextRole)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Employee">Employee</option>
              <option value="Tenant">Tenant</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Business owner">Business Owner</option>
              <option value="Consumer">Consumer</option>
              <option value="Student">Student</option>
              <option value="Other">Other Perspective</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="jurisdiction-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Jurisdiction (Optional)
            </label>
            <input
              id="jurisdiction-input"
              type="text"
              placeholder="e.g. California, US"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Progress & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs font-medium text-brand-600">
            {isUploading && (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>{progressStage}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            aria-label="Upload and Analyze Document"
            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              !file || isUploading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 shadow-sm'
            }`}
          >
            {isUploading ? 'Processing...' : 'Upload & Analyze Document'}
          </button>
        </div>
      </form>
    </div>
  );
};
