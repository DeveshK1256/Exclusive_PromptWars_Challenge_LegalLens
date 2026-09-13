import { createClient } from '../supabase/client';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

// In-memory security audit log store for compliance auditing & test verification
export const inMemoryAuditLogs: AuditLogEntry[] = [];

/**
 * Security Audit Log Recorder (Decision 9)
 * Logs sensitive access attempts, cross-user violations, and document operations.
 */
export function recordSecurityAuditLog(
  userId: string,
  action: string,
  resourceType: string,
  metadata: Record<string, unknown>
): AuditLogEntry {
  const entry: AuditLogEntry = {
    userId,
    action,
    resourceType,
    metadata,
    timestamp: new Date().toISOString(),
  };
  inMemoryAuditLogs.push(entry);
  return entry;
}

/**
 * Dual-Document Ownership Verifier (Section 3.4, Decision 5 & 14)
 * Enforces document_a.user_id == document_b.user_id == authenticated_user.id for BOTH documents.
 * Rejects cross-user comparison attempts and records a security audit log.
 */
export async function verifyDualDocumentOwnership(
  userId: string,
  documentA: { id: string; user_id: string },
  documentB: { id: string; user_id: string }
): Promise<boolean> {
  const isDocAOwned = documentA && documentA.user_id === userId;
  const isDocBOwned = documentB && documentB.user_id === userId;

  if (!isDocAOwned || !isDocBOwned) {
    recordSecurityAuditLog(userId, 'cross_user_comparison_denied', 'comparisons', {
      documentAId: documentA?.id,
      documentBId: documentB?.id,
      documentAOwner: documentA?.user_id,
      documentBOwner: documentB?.user_id,
      attemptedByUserId: userId,
    });
    return false;
  }

  return true;
}
