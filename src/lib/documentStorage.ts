import { Document } from '@/types/database';

const STORAGE_KEY = 'legallens_user_documents';
const ACTIVE_DOC_KEY = 'legallens_active_document';

export const DEFAULT_SAMPLE_DOC: Document = {
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
};

export function getStoredDocuments(): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [DEFAULT_SAMPLE_DOC];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_SAMPLE_DOC];
    const docs = JSON.parse(raw);
    return Array.isArray(docs) && docs.length > 0 ? docs : [DEFAULT_SAMPLE_DOC];
  } catch {
    return [DEFAULT_SAMPLE_DOC];
  }
}

export function saveUploadedDocument(doc: Document): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [doc, DEFAULT_SAMPLE_DOC];
  }
  try {
    const current = getStoredDocuments();
    const filtered = current.filter((d) => d.id !== doc.id);
    const updated = [doc, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(doc));
    return updated;
  } catch {
    return [doc, DEFAULT_SAMPLE_DOC];
  }
}

export function deleteStoredDocument(id: string): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const current = getStoredDocuments();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
