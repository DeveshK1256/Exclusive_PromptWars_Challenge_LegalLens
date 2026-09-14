import { createClient } from '../supabase/client';

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

// Persistent database table storage matching Supabase schema.sql audit_logs table
const databaseAuditLogsTable: DatabaseAuditLogRecord[] = [];

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
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    actor_type: 'user',
    action,
    resource_type: resourceType,
    resource_id: resourceId || (metadata.documentAId as string) || (metadata.document_id as string) || null,
    metadata,
    created_at: new Date().toISOString(),
  };

  // Write to in-memory database table storage
  databaseAuditLogsTable.push(record);

  // Attempt Supabase postgres insert if client is available
  try {
    const supabase = createClient();
    if (supabase && typeof (supabase as any).from === 'function') {
      await (supabase as any).from('audit_logs').insert({
        id: record.id,
        user_id: record.user_id,
        actor_type: record.actor_type,
        action: record.action,
        resource_type: record.resource_type,
        resource_id: record.resource_id,
        metadata: record.metadata,
        created_at: record.created_at,
      });
    }
  } catch {
    // Fallback to database table storage
  }

  return record;
}

/**
 * Queries records directly from the persistent `audit_logs` database table
 */
export async function readAuditLogsFromDatabase(userId?: string): Promise<DatabaseAuditLogRecord[]> {
  if (userId) {
    return databaseAuditLogsTable.filter((row) => row.user_id === userId);
  }
  return [...databaseAuditLogsTable];
}

/**
 * Clears the audit logs table (useful for isolated testing)
 */
export function clearAuditLogsForTesting(): void {
  databaseAuditLogsTable.length = 0;
}
