'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentList } from '@/components/documents/DocumentList';
import { Document } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    async function loadDocs() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbDocs } = await supabase.from('documents').select('*');
        setDocuments((dbDocs as Document[]) || []);
      } else {
        setDocuments([]);
      }
    }
    loadDocs();
  }, []);

  const handleDeleteDocument = async (id: string) => {
    const supabase = createClient();
    await supabase.from('documents').delete().eq('id', id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSelectTab = (tab: 'upload' | 'xray' | 'simplification' | 'qa' | 'timeline' | 'action') => {
    router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">My Legal Documents</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage your uploaded contracts, leases, and agreements.
          </p>
        </div>

        <Link
          href="/dashboard?tab=upload"
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
