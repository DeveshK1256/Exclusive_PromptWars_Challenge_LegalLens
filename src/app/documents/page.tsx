'use client';

import React, { useState } from 'react';
import { DocumentList } from '@/components/documents/DocumentList';
import { Document } from '@/types/database';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc_sample_1',
      user_id: 'user_demo',
      title: 'Sample Employment Agreement',
      original_filename: 'Standard_Employment_Agreement_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 2450000,
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

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Legal Documents</h1>
          <p className="text-slate-600 text-sm">
            Manage your uploaded contracts, leases, and agreements.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Document</span>
        </Link>
      </div>

      <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} />
    </div>
  );
}
