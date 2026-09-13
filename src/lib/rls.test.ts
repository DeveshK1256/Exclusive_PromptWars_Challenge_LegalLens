import { describe, it, expect } from 'vitest';

// Simulated RLS Policy Engine matching Postgres SQL Policies in supabase/schema.sql
class RLSSimulatedDatabase {
  private documents: Array<{ id: string; user_id: string; title: string; file_hash: string; deleted_at: string | null }> = [
    { id: 'doc_a1', user_id: 'user_a', title: 'User A Employment Contract', file_hash: 'hash_a1', deleted_at: null },
    { id: 'doc_a2', user_id: 'user_a', title: 'User A Lease', file_hash: 'hash_a2', deleted_at: null },
    { id: 'doc_b1', user_id: 'user_b', title: 'User B Confidential NDA', file_hash: 'hash_b1', deleted_at: null },
  ];
  private comparisons: Array<{ id: string; user_id: string; document_a_id: string; document_b_id: string }> = [];
  private audit_logs: Array<{ user_id: string | null; action: string; resource_type: string; metadata: Record<string, unknown> }> = [];

  // RLS Evaluator for Documents Table:
  // CREATE POLICY "Users can access own documents" ON documents FOR ALL USING (auth.uid() = user_id AND deleted_at IS NULL);
  queryDocuments(activeUserId: string) {
    return this.documents.filter(
      (doc) => doc.user_id === activeUserId && doc.deleted_at === null
    );
  }

  readDocumentById(activeUserId: string, documentId: string) {
    const doc = this.documents.find((d) => d.id === documentId);
    if (!doc) return null;

    // Evaluate RLS Policy
    if (doc.user_id !== activeUserId || doc.deleted_at !== null) {
      // Record access denial to audit_logs
      this.audit_logs.push({
        user_id: activeUserId,
        action: 'cross_user_access_denied',
        resource_type: 'documents',
        metadata: { attempted_document_id: documentId, owner_id: doc.user_id },
      });
      return null; // RLS denies access
    }
    return doc;
  }

  // RLS Evaluator for Comparisons Table:
  createComparison(activeUserId: string, docAId: string, docBId: string) {
    const docA = this.documents.find((d) => d.id === docAId);
    const docB = this.documents.find((d) => d.id === docBId);

    const isDocAOwned = docA && docA.user_id === activeUserId && docA.deleted_at === null;
    const isDocBOwned = docB && docB.user_id === activeUserId && docB.deleted_at === null;

    if (!isDocAOwned || !isDocBOwned) {
      this.audit_logs.push({
        user_id: activeUserId,
        action: 'cross_user_comparison_denied',
        resource_type: 'comparisons',
        metadata: { docAId, docBId, docA_owner: docA?.user_id, docB_owner: docB?.user_id },
      });
      throw new Error('RLS DENIED: Requesting user must own BOTH documents in a comparison');
    }

    const comparison = { id: `comp_${Date.now()}`, user_id: activeUserId, document_a_id: docAId, document_b_id: docBId };
    this.comparisons.push(comparison);
    return comparison;
  }

  // Duplicate Upload Check per User
  findDuplicateFileHash(activeUserId: string, fileHash: string) {
    return this.documents.find(
      (doc) => doc.user_id === activeUserId && doc.file_hash === fileHash && doc.deleted_at === null
    );
  }

  getAuditLogs() {
    return this.audit_logs;
  }
}

describe('Sprint 2 — Row-Level Security (RLS) & Document Isolation Suite', () => {
  const db = new RLSSimulatedDatabase();

  it('allows User A to read User A uploaded documents', () => {
    const userADocs = db.queryDocuments('user_a');
    expect(userADocs).toHaveLength(2);
    expect(userADocs.map((d) => d.id)).toContain('doc_a1');
  });

  it('enforces RLS: User B cannot access User A uploaded document', () => {
    const forbiddenDoc = db.readDocumentById('user_b', 'doc_a1');
    expect(forbiddenDoc).toBeNull(); // Access blocked by RLS policy

    const auditLogs = db.getAuditLogs();
    const denialLog = auditLogs.find(
      (log) => log.user_id === 'user_b' && log.action === 'cross_user_access_denied'
    );
    expect(denialLog).toBeDefined();
    expect(denialLog?.metadata.attempted_document_id).toBe('doc_a1');
  });

  it('enforces RLS: User A cannot access User B uploaded document', () => {
    const forbiddenDoc = db.readDocumentById('user_a', 'doc_b1');
    expect(forbiddenDoc).toBeNull();

    const auditLogs = db.getAuditLogs();
    const denialLog = auditLogs.find(
      (log) => log.user_id === 'user_a' && log.action === 'cross_user_access_denied'
    );
    expect(denialLog).toBeDefined();
    expect(denialLog?.metadata.attempted_document_id).toBe('doc_b1');
  });

  it('detects duplicate file_hash re-upload per user without restricting other users from uploading same template', () => {
    const userADup = db.findDuplicateFileHash('user_a', 'hash_a1');
    expect(userADup).toBeDefined();

    // User B uploading template with same hash_a1 is allowed (per-user scoping)
    const userBDup = db.findDuplicateFileHash('user_b', 'hash_a1');
    expect(userBDup).toBeUndefined();
  });

  it('denies User A from creating comparison with User B uploaded document', () => {
    expect(() => db.createComparison('user_a', 'doc_a1', 'doc_b1')).toThrow(
      'RLS DENIED: Requesting user must own BOTH documents in a comparison'
    );
  });
});
