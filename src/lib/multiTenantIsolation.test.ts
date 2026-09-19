// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredDocuments, saveUploadedDocument, deleteStoredDocument, DEFAULT_SAMPLE_DOC } from './documentStorage';
import { Document } from '@/types/database';

describe('Multi-Tenant Document Isolation & Auth Security Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'legallens_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('enforces isolated document storage: Account A documents are invisible to Account B', () => {
    const userA = 'account_a@example.com';
    const userB = 'account_b@example.com';

    const docA: Document = {
      ...DEFAULT_SAMPLE_DOC,
      id: 'doc_user_a_101',
      user_id: userA,
      title: 'Secret Account A NDA Agreement',
      original_filename: 'Account_A_NDA.pdf',
    };

    const docB: Document = {
      ...DEFAULT_SAMPLE_DOC,
      id: 'doc_user_b_202',
      user_id: userB,
      title: 'Confidential Account B Financial Agreement',
      original_filename: 'Account_B_Financial.pdf',
    };

    saveUploadedDocument(docA, userA);
    saveUploadedDocument(docB, userB);

    const docsA = getStoredDocuments(userA);
    expect(docsA).toHaveLength(1);
    expect(docsA[0].id).toBe('doc_user_a_101');
    expect(docsA.some(d => d.id === 'doc_user_b_202')).toBe(false);

    const docsB = getStoredDocuments(userB);
    expect(docsB).toHaveLength(1);
    expect(docsB[0].id).toBe('doc_user_b_202');
    expect(docsB.some(d => d.id === 'doc_user_a_101')).toBe(false);
  });

  it('starts newly registered users with an empty document workspace (0 documents)', () => {
    const newUserEmail = 'random_new_user_99@domain.com';
    const docs = getStoredDocuments(newUserEmail);

    expect(docs).toHaveLength(0);
    expect(docs).toEqual([]);
  });

  it('allows document deletion only within the owners bucket', () => {
    const userA = 'account_a@example.com';
    const userB = 'account_b@example.com';

    const docA: Document = { ...DEFAULT_SAMPLE_DOC, id: 'doc_a_delete_test', user_id: userA };
    const docB: Document = { ...DEFAULT_SAMPLE_DOC, id: 'doc_b_delete_test', user_id: userB };

    saveUploadedDocument(docA, userA);
    saveUploadedDocument(docB, userB);

    deleteStoredDocument('doc_b_delete_test', userA);

    const docsB = getStoredDocuments(userB);
    expect(docsB).toHaveLength(1);
    expect(docsB[0].id).toBe('doc_b_delete_test');
  });
});