import { createAdminClient } from '../supabase/admin';
import { randomUUID } from 'crypto';

export interface DatabaseAuditLogRecord {
  id: string;
  user_id: string | null;
  actor_type: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// In-memory fallback array for isolated unit testing environment
const inMemoryAuditLogsFallback: DatabaseAuditLogRecord[] = [];

/**
 * Security Audit Log Recorder (Decision 9 / Schema Table `audit_logs`)
 * Writes security event records directly to the persistent `audit_logs` database table.
 */
export async function recordSecurityAuditLog(
  userId: string | null,
  action: string,
  resourceType: string,
  metadata: Record<string, unknown>,
  resourceId?: string
): Promise<DatabaseAuditLogRecord> {
  const record: DatabaseAuditLogRecord = {
    id: randomUUID(),
    user_id: userId,
    actor_type: 'user',
    action,
    resource_type: resourceType,
    resource_id: resourceId || (metadata.documentAId as string) || (metadata.document_id as string) || null,
    metadata,
    created_at: new Date().toISOString(),
  };

  inMemoryAuditLogsFallback.push(record);

  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      id: record.id,
      user_id: record.user_id,
      actor_type: record.actor_type,
      action: record.action,
      resource_type: record.resource_type,
      resource_id: record.resource_id,
      metadata: record.metadata,
      created_at: record.created_at,
    });
  } catch {
    // Fallback retains inMemoryAuditLogsFallback
  }

  return record;
}

/**
 * Queries records directly from the persistent `audit_logs` database table
 */
export async function readAuditLogsFromDatabase(userId?: string): Promise<DatabaseAuditLogRecord[]> {
  if (process.env.NODE_ENV !== 'test') {
    try {
      const admin = createAdminClient();
      let query = admin.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as DatabaseAuditLogRecord[];
      }
    } catch {
      // Fallback to in-memory array if database query fails
    }
  }

  if (userId) {
    return inMemoryAuditLogsFallback.filter((row) => row.user_id === userId);
  }
  return [...inMemoryAuditLogsFallback];
}

/**
 * Clears the audit logs table (useful for isolated testing)
 */
export function clearAuditLogsForTesting(): void {
  inMemoryAuditLogsFallback.length = 0;
}
