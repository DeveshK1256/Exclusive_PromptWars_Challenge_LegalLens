'use client';

import React, { useState } from 'react';
import { FileText, Shield, Hash, Calendar, Trash2, AlertTriangle, X, BookOpen, MessageSquare } from 'lucide-react';
import { Document } from '@/types/database';

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument?: (id: string) => void;
  onSelectTab?: (tab: 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action') => void;
  onSelectDocument?: (doc: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDeleteDocument, onSelectTab, onSelectDocument }) => {
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<Document | null>(null);

  if (documents.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-semibold text-slate-900">No Documents Uploaded</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Upload your first legal document above to view plain-language analysis, Legal X-Ray findings, and timelines.
        </p>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteDoc && onDeleteDocument) {
      onDeleteDocument(pendingDeleteDoc.id);
    }
    setPendingDeleteDoc(null);
  };

  const handleCardTabClick = (doc: Document, tab: 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action') => {
    if (onSelectDocument) {
      onSelectDocument(doc);
    }
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">My Uploaded Documents ({documents.length})</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">{doc.title}</h4>
                    <p className="text-xs text-slate-500">{doc.original_filename}</p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                  {doc.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-1">
                <span className="bg-slate-100 px-2 py-1 rounded-md capitalize">
                  Type: {doc.document_type.replace('_', ' ')}
                </span>
                {doc.jurisdiction && (
                  <span className="bg-slate-100 px-2 py-1 rounded-md">
                    Jurisdiction: {doc.jurisdiction}
                  </span>
                )}
                <span className="bg-slate-100 px-2 py-1 rounded-md">
                  {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              {onSelectTab && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCardTabClick(doc, 'xray')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>View Analysis Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCardTabClick(doc, 'simplification')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Simplification</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCardTabClick(doc, 'qa')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Q&A</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5 font-mono" title={`SHA-256: ${doc.file_hash}`}>
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{doc.file_hash.substring(0, 12)}...</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </span>

                {onDeleteDocument && (
                  <button
                    type="button"
                    onClick={() => setPendingDeleteDoc(doc)}
                    aria-label={`Delete document ${doc.title}`}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-red-500 rounded cursor-pointer"
                    title="Soft delete document"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Soft Delete Confirmation Modal */}
      {pendingDeleteDoc && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setPendingDeleteDoc(null)}
              aria-label="Close delete confirmation dialog"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">Confirm Soft Delete</h3>
                <p className="text-xs text-slate-500">Document soft-deletion confirmation step</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{pendingDeleteDoc.title}</strong>? The document record will be soft-deleted (`deleted_at` timestamp set) and removed from your active workspace.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteDoc(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Cancel Delete
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
