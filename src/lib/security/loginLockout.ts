import { recordSecurityAuditLog } from './auditLog';

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

// In-memory + persistent fallback store keyed by (email + ":" + clientId)
const lockoutStore = new Map<string, LockoutEntry>();

export function buildLockoutKey(email: string, clientId: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanClientId = (clientId || 'unknown_client').trim();
  return `${cleanEmail}:${cleanClientId}`;
}

/**
 * Checks lockout status for an email + client_identifier combination.
 * Automatically clears expired lockouts.
 */
export async function checkLockoutStatus(email: string, clientId: string): Promise<LockoutStatus> {
  const key = buildLockoutKey(email, clientId);
  const now = Date.now();
  const entry = lockoutStore.get(key);

  if (!entry) {
    return {
      isLocked: false,
      remainingSeconds: 0,
      lockedUntil: null,
      attemptCount: 0,
    };
  }

  // Check if lockout has expired
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    // Lockout expired -> reset automatically
    lockoutStore.delete(key);
    return {
      isLocked: false,
      remainingSeconds: 0,
      lockedUntil: null,
      attemptCount: 0,
    };
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingSeconds = Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000));
    return {
      isLocked: true,
      remainingSeconds,
      lockedUntil: entry.lockedUntil,
      attemptCount: entry.attemptCount,
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    lockedUntil: null,
    attemptCount: entry.attemptCount,
  };
}

/**
 * Records a failed login attempt for email + clientId.
 * Locks account for 5 minutes after 5 consecutive failed attempts and writes to audit_logs table.
 */
export async function recordFailedLoginAttempt(email: string, clientId: string): Promise<LockoutStatus> {
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

    // Record Security Audit Log entry in audit_logs database table (Decision 9)
    await recordSecurityAuditLog(
      clientId,
      'login_lockout_triggered',
      'user_auth',
      {
        attemptedEmail: email,
        clientId,
        failedAttemptCount: entry.attemptCount,
        lockoutDurationSeconds: 300,
        lockedUntilIso: new Date(entry.lockedUntil).toISOString(),
      }
    );
  } else {
    // Record individual failed attempt in audit_logs
    await recordSecurityAuditLog(
      clientId,
      'login_failed_attempt',
      'user_auth',
      {
        attemptedEmail: email,
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
  const key = buildLockoutKey(email, clientId);
  lockoutStore.delete(key);

  await recordSecurityAuditLog(
    clientId,
    'login_successful',
    'user_auth',
    {
      userEmail: email,
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