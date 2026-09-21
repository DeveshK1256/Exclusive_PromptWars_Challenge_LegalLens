'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DocumentRedlineViewer } from '@/components/diff/DocumentRedlineViewer';
import { computeDocumentDiff, DocumentDiffResult } from '@/lib/diff/documentDiff';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import { Document } from '@/types/database';
import { ArrowLeft } from 'lucide-react';

export default function DocumentDiffPage() {
  const params = useParams();
  const router = useRouter();
  const docId = (params?.id as string) || 'doc_sample_1';

  const [doc, setDoc] = useState<Document | null>(null);
  const [diffResult, setDiffResult] = useState<DocumentDiffResult | null>(null);

  useEffect(() => {
    async function loadDiffDoc() {
      const supabase = createClient();
      const { data: dbDoc } = await supabase.from('documents').select('*').eq('id', docId).single();
      const target = (dbDoc as Document) || DEFAULT_SAMPLE_DOC;
      setDoc(target);

      // Compute diff against simulated prior version v1
      const textV1 = target.raw_text || `RESIDENTIAL LEASE AGREEMENT
1. PARTIES: Landlord John Smith leases to Tenant Jane Doe.
2. RENT: Monthly rent is $2,400 due on 1st of month.
3. NOTICE: 30 days written notice required prior to termination.`;

      const textV2 = (target.raw_text || textV1) + `\n4. PETS: No unauthorized pets allowed.
5. GOVERNING LAW: Governed by California Law.`;

      const diff = computeDocumentDiff(textV1, textV2, 1, 2);
      setDiffResult(diff);
    }
    loadDiffDoc();
  }, [docId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Document X-Ray
        </button>

        {doc && diffResult ? (
          <DocumentRedlineViewer
            diff={diffResult}
            titleA={`${doc.title} (v1)`}
            titleB={`${doc.title} (v2)`}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">Loading document diff...</div>
        )}
      </main>

      <Footer />
    </div>
  );
}
