export {
  recordSecurityAuditLog,
  readAuditLogsFromDatabase,
  type DatabaseAuditLogRecord,
} from '../security/auditLog';
import { recordSecurityAuditLog } from '../security/auditLog';

/**
 * Dual-Document Ownership Verifier (Section 3.4, Decision 5 & 14)
 * Enforces document_a.user_id == document_b.user_id == authenticated_user.id for BOTH documents.
 * Rejects cross-user comparison attempts and records an entry in the persistent `audit_logs` database table.
 */
export async function verifyDualDocumentOwnership(
  userId: string,
  documentA: { id: string; user_id: string },
  documentB: { id: string; user_id: string }
): Promise<boolean> {
  const isDocAOwned = documentA && documentA.user_id === userId;
  const isDocBOwned = documentB && documentB.user_id === userId;

  if (!isDocAOwned || !isDocBOwned) {
    await recordSecurityAuditLog(userId, 'cross_user_comparison_denied', 'comparisons', {
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

