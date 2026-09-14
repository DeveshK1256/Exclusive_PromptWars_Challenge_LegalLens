'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentList } from '@/components/documents/DocumentList';
import { Document } from '@/types/database';
import { getStoredDocuments, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([DEFAULT_SAMPLE_DOC]);

  useEffect(() => {
    setDocuments(getStoredDocuments());
  }, []);

  const handleDeleteDocument = (id: string) => {
    const updated = deleteStoredDocument(id);
    setDocuments(updated);
  };

  const handleSelectTab = (tab: 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action') => {
    router.push(`/dashboard?tab=${tab}`);
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

      <DocumentList documents={documents} onDeleteDocument={handleDeleteDocument} onSelectTab={handleSelectTab} />
    </div>
  );
}
