import { recordSecurityAuditLog, readAuditLogsFromDatabase } from './auditLog';
import { createAdminClient } from '../supabase/admin';

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  lockedUntil: number | null;
  attemptCount: number;
}

interface LockoutEntry {
  attemptCount: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)

// In-memory fallback map for test isolation
const lockoutStore = new Map<string, LockoutEntry>();

export function buildLockoutKey(email: string, clientId: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanClientId = (clientId || 'unknown_client').trim();
  return `${cleanEmail}:${cleanClientId}`;
}

/**
 * Checks lockout status for an email + client_identifier combination.
 * Checks in-memory store & queries persistent audit_logs table.
 */
export async function checkLockoutStatus(email: string, clientId: string): Promise<LockoutStatus> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const key = buildLockoutKey(email, clientId);
  const now = Date.now();

  const entry = lockoutStore.get(key);

  if (entry) {
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      lockoutStore.delete(key);
    } else if (entry.lockedUntil && now < entry.lockedUntil) {
      const remainingSeconds = Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000));
      return {
        isLocked: true,
        remainingSeconds,
        lockedUntil: entry.lockedUntil,
        attemptCount: entry.attemptCount,
      };
    } else if (entry.attemptCount > 0) {
      return {
        isLocked: false,
        remainingSeconds: 0,
        lockedUntil: null,
        attemptCount: entry.attemptCount,
      };
    }
  }

  // Attempt database query if not found in memory and not in unit test environment
  if (process.env.NODE_ENV !== 'test') {
    try {
      const admin = createAdminClient();
      const fiveMinutesAgo = new Date(now - LOCKOUT_DURATION_MS).toISOString();

      const { data: logs, error } = await admin
        .from('audit_logs')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (!error && logs && Array.isArray(logs)) {
        const userLogs = logs.filter(
          (l: any) =>
            l.resource_type === 'user_auth' &&
            ((l.metadata as any)?.attemptedEmail || '').toLowerCase() === cleanEmail
        );

        const lastSuccessIndex = userLogs.findIndex((l: any) => l.action === 'login_successful');
        const relevantLogs = lastSuccessIndex >= 0 ? userLogs.slice(0, lastSuccessIndex) : userLogs;

        const failedLogs = relevantLogs.filter((l: any) => l.action === 'login_failed_attempt' || l.action === 'login_lockout_triggered');
        const attemptCount = failedLogs.length;

        if (attemptCount >= MAX_FAILED_ATTEMPTS) {
          const newestLogTime = new Date(failedLogs[0].created_at).getTime();
          const lockedUntil = newestLogTime + LOCKOUT_DURATION_MS;

          if (now < lockedUntil) {
            const remainingSeconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000));
            return {
              isLocked: true,
              remainingSeconds,
              lockedUntil,
              attemptCount,
            };
          }
        } else if (attemptCount > 0) {
          return {
            isLocked: false,
            remainingSeconds: 0,
            lockedUntil: null,
            attemptCount,
          };
        }
      }
    } catch {
      // Ignore database query failure
    }
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    lockedUntil: null,
    attemptCount: 0,
  };
}

/**
 * Records a failed login attempt for email + clientId.
 * Locks account for 5 minutes after 5 consecutive failed attempts and writes to audit_logs database table.
 */
export async function recordFailedLoginAttempt(email: string, clientId: string): Promise<LockoutStatus> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const key = buildLockoutKey(email, clientId);
  const now = Date.now();

  let entry = lockoutStore.get(key);
  if (!entry || (entry.lockedUntil && now >= entry.lockedUntil)) {
    entry = {
      attemptCount: 1,
      lockedUntil: null,
      lastAttemptAt: now,
    };
  } else {
    entry.attemptCount += 1;
    entry.lastAttemptAt = now;
  }

  let isLocked = false;
  let remainingSeconds = 0;

  if (entry.attemptCount >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    isLocked = true;
    remainingSeconds = 300;

    await recordSecurityAuditLog(
      clientId,
      'login_lockout_triggered',
      'user_auth',
      {
        attemptedEmail: cleanEmail,
        clientId,
        failedAttemptCount: entry.attemptCount,
        lockoutDurationSeconds: 300,
        lockedUntilIso: new Date(entry.lockedUntil).toISOString(),
      }
    );
  } else {
    await recordSecurityAuditLog(
      clientId,
      'login_failed_attempt',
      'user_auth',
      {
        attemptedEmail: cleanEmail,
        clientId,
        attemptCount: entry.attemptCount,
        maxAllowed: MAX_FAILED_ATTEMPTS,
      }
    );
  }

  lockoutStore.set(key, entry);

  return {
    isLocked,
    remainingSeconds,
    lockedUntil: entry.lockedUntil,
    attemptCount: entry.attemptCount,
  };
}

/**
 * Resets attempt counter and clears lockout upon successful login.
 */
export async function recordSuccessfulLoginAttempt(email: string, clientId: string): Promise<void> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const key = buildLockoutKey(email, clientId);
  lockoutStore.delete(key);

  await recordSecurityAuditLog(
    clientId,
    'login_successful',
    'user_auth',
    {
      attemptedEmail: cleanEmail,
      userEmail: cleanEmail,
      clientId,
    }
  );
}

/**
 * Resets lockout store for testing environment isolation.
 */
export function resetLockoutStoreForTesting(): void {
  lockoutStore.clear();
}