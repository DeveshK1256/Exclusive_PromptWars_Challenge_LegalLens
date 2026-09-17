import { describe, it, expect, beforeEach } from 'vitest';
import { recordSecurityAuditLog, readAuditLogsFromDatabase, clearAuditLogsForTesting } from './security/auditLog';
import { generatePortfolioReport } from './portfolio/portfolioAggregator';
import { createSharedLink, validateAndAccessSharedLink, revokeSharedLink } from './sharing/shareStorage';
import { saveFindingAnnotation, getStoredAnnotations } from './annotations/annotationStorage';
import { Document, Finding } from '@/types/database';

/**
 * Simulated RLS Policy Engine matching Postgres SQL Policies in supabase/schema.sql
 * Evaluates row-level security policies across ALL user-owned database entities:
 * 1. documents
 * 2. comparisons
 * 3. clauses
 * 4. findings
 * 5. timelines
 * 6. document_summaries
 * 7. glossary_terms
 * 8. questions
 * 9. answers
 * 10. action_items
 * 11. finding_annotations (negotiation status)
 * 12. shared_links
 * 13. portfolio risk aggregation
 */
class FullRLSSimulatedDatabase {
  private documents = [
    { id: 'doc_a1', user_id: 'user_a', title: 'User A Contract', file_hash: 'hash_a1', deleted_at: null },
    { id: 'doc_b1', user_id: 'user_b', title: 'User B Contract', file_hash: 'hash_b1', deleted_at: null },
  ];

  private clauses = [
    { id: 'cls_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', text: 'User A Non-Compete Clause' },
    { id: 'cls_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', text: 'User B Confidentiality Clause' },
  ];

  private findings = [
    { id: 'fnd_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', summary: 'User A High Severity Non-Compete' },
    { id: 'fnd_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', summary: 'User B Notice Period' },
  ];

  private timelines = [
    { id: 'tml_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', date_expression: 'Jan 15, 2026' },
    { id: 'tml_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', date_expression: 'Dec 31, 2028' },
  ];

  private document_summaries = [
    { id: 'sum_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', text: 'User A Executive Summary' },
    { id: 'sum_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', text: 'User B Summary' },
  ];

  private glossary_terms = [
    { id: 'glo_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', term: 'Indemnification' },
    { id: 'glo_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', term: 'Arbitration' },
  ];

  private questions = [
    { id: 'qst_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', question: 'Does California law apply?' },
    { id: 'qst_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', question: 'What is the notice period?' },
  ];

  private answers = [
    { id: 'ans_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', answer: 'No jurisdiction was specified.' },
    { id: 'ans_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', answer: 'Notice period is 30 days.' },
  ];

  private action_items = [
    { id: 'act_a1', document_version_id: 'ver_doc_a1', user_id: 'user_a', title: 'Clarify non-compete scope' },
    { id: 'act_b1', document_version_id: 'ver_doc_b1', user_id: 'user_b', title: 'Review termination clause' },
  ];

  private comparisons: Array<{ id: string; user_id: string; document_a_id: string; document_b_id: string }> = [];

  /**
   * Generic RLS Evaluator for any user-owned table.
   * Enforces item.user_id === requestingUserId.
   * If denied, records security event in database audit_logs table per Decision 9.
   */
  async readUserResource<T extends { id: string; user_id: string }>(
    requestingUserId: string,
    tableName: string,
    table: T[],
    resourceId: string
  ): Promise<T | null> {
    const item = table.find((row) => row.id === resourceId);
    if (!item) return null;

    if (item.user_id !== requestingUserId) {
      await recordSecurityAuditLog(requestingUserId, 'cross_user_access_denied', tableName, {
        attempted_id: resourceId,
        actual_owner_id: item.user_id,
        attempted_by: requestingUserId,
      }, resourceId);
      return null; // RLS Policy blocks access
    }

    return item;
  }

  /**
   * Dual-Document Ownership RLS Evaluator for Comparisons table.
   * Requires BOTH referenced documents to belong to requestingUserId.
   */
  async createComparison(activeUserId: string, docAId: string, docBId: string) {
    const docA = this.documents.find((d) => d.id === docAId);
    const docB = this.documents.find((d) => d.id === docBId);

    const isDocAOwned = docA && docA.user_id === activeUserId && docA.deleted_at === null;
    const isDocBOwned = docB && docB.user_id === activeUserId && docB.deleted_at === null;

    if (!isDocAOwned || !isDocBOwned) {
      await recordSecurityAuditLog(activeUserId, 'cross_user_comparison_denied', 'comparisons', {
        documentAId: docAId,
        documentBId: docBId,
        docAOwner: docA?.user_id,
        docBOwner: docB?.user_id,
        attemptedBy: activeUserId,
      });
      throw new Error('RLS DENIED: Requesting user must own BOTH documents in a comparison');
    }

    const comparison = { id: `comp_${Date.now()}`, user_id: activeUserId, document_a_id: docAId, document_b_id: docBId };
    this.comparisons.push(comparison);
    return comparison;
  }

  findDuplicateFileHash(activeUserId: string, fileHash: string) {
    return this.documents.find(
      (doc) => doc.user_id === activeUserId && doc.file_hash === fileHash && doc.deleted_at === null
    );
  }

  // Table accessors
  get Documents() { return this.documents; }
  get Clauses() { return this.clauses; }
  get Findings() { return this.findings; }
  get Timelines() { return this.timelines; }
  get DocumentSummaries() { return this.document_summaries; }
  get GlossaryTerms() { return this.glossary_terms; }
  get Questions() { return this.questions; }
  get Answers() { return this.answers; }
  get ActionItems() { return this.action_items; }
}

describe('Sprint 10 — Comprehensive Row-Level Security (RLS) & Audit Logging Test Suite', () => {
  let db: FullRLSSimulatedDatabase;

  beforeEach(() => {
    db = new FullRLSSimulatedDatabase();
    clearAuditLogsForTesting();
  });

  it('allows User A to read User A uploaded documents', async () => {
    const docA = await db.readUserResource('user_a', 'documents', db.Documents, 'doc_a1');
    expect(docA).not.toBeNull();
    expect(docA?.id).toBe('doc_a1');
  });

  it('detects duplicate file_hash re-upload per user without restricting other users from uploading same template', () => {
    const userADup = db.findDuplicateFileHash('user_a', 'hash_a1');
    expect(userADup).toBeDefined();

    const userBDup = db.findDuplicateFileHash('user_b', 'hash_a1');
    expect(userBDup).toBeUndefined();
  });

  it('enforces RLS entity 1: blocks User B cross-user read on documents table and logs denial to audit_logs', async () => {
    const res = await db.readUserResource('user_b', 'documents', db.Documents, 'doc_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const denialLog = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'documents');
    expect(denialLog).toBeDefined();
    expect(denialLog?.resource_id).toBe('doc_a1');
  });

  it('enforces RLS entity 2: blocks User A cross-user comparison creation when User A does not own document_b', async () => {
    await expect(db.createComparison('user_a', 'doc_a1', 'doc_b1')).rejects.toThrow(
      'RLS DENIED: Requesting user must own BOTH documents in a comparison'
    );

    const auditLogs = await readAuditLogsFromDatabase('user_a');
    const compDenial = auditLogs.find((l) => l.action === 'cross_user_comparison_denied');
    expect(compDenial).toBeDefined();
    expect(compDenial?.metadata.documentAId).toBe('doc_a1');
    expect(compDenial?.metadata.documentBId).toBe('doc_b1');
  });

  it('enforces RLS entity 3: blocks User B cross-user read on clauses table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'clauses', db.Clauses, 'cls_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'clauses');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('cls_a1');
  });

  it('enforces RLS entity 4: blocks User B cross-user read on findings table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'findings', db.Findings, 'fnd_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'findings');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('fnd_a1');
  });

  it('enforces RLS entity 5: blocks User B cross-user read on timelines table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'timelines', db.Timelines, 'tml_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'timelines');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('tml_a1');
  });

  it('enforces RLS entity 6: blocks User B cross-user read on document_summaries table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'document_summaries', db.DocumentSummaries, 'sum_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'document_summaries');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('sum_a1');
  });

  it('enforces RLS entity 7: blocks User B cross-user read on glossary_terms table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'glossary_terms', db.GlossaryTerms, 'glo_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'glossary_terms');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('glo_a1');
  });

  it('enforces RLS entity 8: blocks User B cross-user read on questions table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'questions', db.Questions, 'qst_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'questions');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('qst_a1');
  });

  it('enforces RLS entity 9: blocks User B cross-user read on answers table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'answers', db.Answers, 'ans_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'answers');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('ans_a1');
  });

  it('enforces RLS entity 10: blocks User B cross-user read on action_items table and logs denial', async () => {
    const res = await db.readUserResource('user_b', 'action_items', db.ActionItems, 'act_a1');
    expect(res).toBeNull();

    const auditLogs = await readAuditLogsFromDatabase('user_b');
    const log = auditLogs.find((l) => l.action === 'cross_user_access_denied' && l.resource_type === 'action_items');
    expect(log).toBeDefined();
    expect(log?.resource_id).toBe('act_a1');
  });

  it('enforces RLS entity 11: finding_annotations — User B cannot read or modify User A finding annotations', () => {
    saveFindingAnnotation('user_a', 'fnd_a1', 'resolved', 'Resolved by User A');

    const bobAnnotations = getStoredAnnotations('user_b');
    const leak = bobAnnotations.some((a) => a.finding_id === 'fnd_a1');
    expect(leak).toBe(false);
  });

  it('enforces RLS entity 12: shared_links — revoked/expired tokens return null; User B cannot revoke User A link', () => {
    const { rawToken, link } = createSharedLink('user_a', 'doc_a1', 'v1', 7);

    // User B revokes User A link -> DENIED
    const bobRevokeAttempt = revokeSharedLink('user_b', link.id);
    expect(bobRevokeAttempt).toBe(false);

    // User A revokes User A link -> OK
    const aliceRevokeSuccess = revokeSharedLink('user_a', link.id);
    expect(aliceRevokeSuccess).toBe(true);

    // Post-revocation access attempt -> null
    const accessAttempt = validateAndAccessSharedLink(rawToken);
    expect(accessAttempt).toBeNull();
  });

  it('enforces RLS entity 13: portfolio aggregation — strictly filters and aggregates user-owned documents only', () => {
    const docA: Document = {
      id: 'doc_a1',
      user_id: 'user_a',
      title: 'User A Contract',
      original_filename: 'a.pdf',
      mime_type: 'application/pdf',
      file_size: 1000,
      file_hash: 'ha',
      storage_path: '/p/a',
      document_type: 'employment_contract',
      jurisdiction: null,
      status: 'completed',
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docB: Document = {
      id: 'doc_b1',
      user_id: 'user_b',
      title: 'User B Contract',
      original_filename: 'b.pdf',
      mime_type: 'application/pdf',
      file_size: 1000,
      file_hash: 'hb',
      storage_path: '/p/b',
      document_type: 'rental_agreement',
      jurisdiction: null,
      status: 'completed',
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const findingA: Finding = {
      id: 'f_a',
      document_id: 'doc_a1',
      document_version_id: 'v1',
      clause_id: 'c1',
      category: 'Termination',
      severity: 'red',
      title: 'Immediate Termination',
      description: 'Term',
      finding_type: 'recommendation',
      confidence: 0.9,
      source_reference: 'Section 1',
      created_at: new Date().toISOString(),
    };

    const findingB: Finding = {
      id: 'f_b',
      document_id: 'doc_b1',
      document_version_id: 'v1',
      clause_id: 'c2',
      category: 'Rent',
      severity: 'red',
      title: 'High Rent Increase',
      description: 'Rent',
      finding_type: 'recommendation',
      confidence: 0.9,
      source_reference: 'Section 2',
      created_at: new Date().toISOString(),
    };

    const reportA = generatePortfolioReport('user_a', [docA, docB], [findingA, findingB]);
    expect(reportA.totalDocuments).toBe(1);
    expect(reportA.documentSummaries.length).toBe(1);
    expect(reportA.documentSummaries[0].document.id).toBe('doc_a1');
  });
});
