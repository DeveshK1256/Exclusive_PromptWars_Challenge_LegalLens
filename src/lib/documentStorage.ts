import { Document } from '@/types/database';

const BASE_STORAGE_KEY = 'legallens_user_documents';
const ACTIVE_DOC_KEY = 'legallens_active_document';

export const DEFAULT_SAMPLE_DOC: Document = {
  id: 'doc_sample_1',
  user_id: 'demo@legallens.ai',
  title: 'Sample Employment Agreement',
  original_filename: 'Standard_Employment_Agreement_2026.pdf',
  mime_type: 'application/pdf',
  file_size: 2450000,
  file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  storage_path: 'documents/demo@legallens.ai/sample.pdf',
  document_type: 'employment_contract',
  jurisdiction: 'California, US',
  status: 'completed',
  deleted_at: null,
  retention_expires_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
  * Resolves current user email identifier from localStorage or cookies
  */
export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return 'demo@legallens.ai';

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('legallens_user_email');
    if (stored && stored.trim()) return stored.trim().toLowerCase();
  }

  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    if (cookies['legallens_user_email']) {
      return cookies['legallens_user_email'].trim().toLowerCase();
    }
  }

  return 'demo@legallens.ai';
}

/**
  * Returns user-scoped localStorage key
  */
function getUserKey(userEmail?: string): string {
  const email = (userEmail || getCurrentUserEmail()).toLowerCase();
  return `${BASE_STORAGE_KEY}_${email}`;
}

/**
  * Retrieves documents owned STRICTLY by the current user.
  * Demo account gets sample doc, new registered users start with [] (0 docs).
  */
export function getStoredDocuments(userEmail?: string): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }

  const email = (userEmail || getCurrentUserEmail()).toLowerCase();
  const key = getUserKey(email);

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      // Demo account gets default sample doc. All other user accounts start EMPTY!
      if (email === 'demo@legallens.ai' || email === 'admin@legallens.ai') {
        return [DEFAULT_SAMPLE_DOC];
      }
      return [];
    }

    const docs: Document[] = JSON.parse(raw);
    if (!Array.isArray(docs)) return [];

    // Enforce strict multi-tenant isolation: filter out any doc not owned by this user
    return docs.filter((d) => d.user_id?.toLowerCase() === email || (email === 'demo@legallens.ai' && d.user_id === 'user_demo'));
  } catch {
    return email === 'demo@legallens.ai' ? [DEFAULT_SAMPLE_DOC] : [];
  }
}

/**
  * Saves an uploaded document under the current user's isolated storage bucket.
  */
export function saveUploadedDocument(doc: Document, userEmail?: string): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [doc];
  }

  const email = (userEmail || getCurrentUserEmail()).toLowerCase();
  const key = getUserKey(email);

  // Bind document ownership to current user
  const userDoc: Document = {
    ...doc,
    user_id: email,
  };

  try {
    const current = getStoredDocuments(email);
    const filtered = current.filter((d) => d.id !== userDoc.id);
    const updated = [userDoc, ...filtered];

    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(userDoc));
    return updated;
  } catch {
    return [userDoc];
  }
}

/**
  * Deletes a document strictly from the current user's isolated storage bucket.
  */
export function deleteStoredDocument(id: string, userEmail?: string): Document[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }

  const email = (userEmail || getCurrentUserEmail()).toLowerCase();
  const key = getUserKey(email);

  try {
    const current = getStoredDocuments(email);
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));

    // Clear active doc if it was the deleted doc
    const rawActive = localStorage.getItem(ACTIVE_DOC_KEY);
    if (rawActive) {
      const activeDoc = JSON.parse(rawActive);
      if (activeDoc.id === id) {
        localStorage.removeItem(ACTIVE_DOC_KEY);
      }
    }

    return updated;
  } catch {
    return [];
  }
}

