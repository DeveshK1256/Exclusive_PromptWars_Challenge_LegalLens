'use client';

import React from 'react';
import { FileText, Shield, Hash, Calendar, Trash2 } from 'lucide-react';
import { Document } from '@/types/database';

interface DocumentListProps {
  documents: Document[];
  onDeleteDocument?: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDeleteDocument }) => {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">My Uploaded Documents ({documents.length})</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
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
                    onClick={() => onDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Soft delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
