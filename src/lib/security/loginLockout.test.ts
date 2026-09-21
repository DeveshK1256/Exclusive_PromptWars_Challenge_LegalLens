// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkLockoutStatus,
  recordFailedLoginAttempt,
  recordSuccessfulLoginAttempt,
  resetLockoutStoreForTesting,
} from './loginLockout';
import { readAuditLogsFromDatabase, clearAuditLogsForTesting } from './auditLog';

describe('Persistent Login Lockout & Security Audit Suite', () => {
  beforeEach(() => {
    resetLockoutStoreForTesting();
    clearAuditLogsForTesting();
    vi.useRealTimers();
  });

  it('increments failed attempt count and locks after exactly 5 failed attempts', async () => {
    const email = 'victim@example.com';
    const clientId = 'client_device_1';

    // Attempts 1 to 4: should increment count and NOT lock
    for (let i = 1; i <= 4; i++) {
      const status = await recordFailedLoginAttempt(email, clientId);
      expect(status.isLocked).toBe(false);
      expect(status.attemptCount).toBe(i);
      expect(status.remainingSeconds).toBe(0);
    }

    // Attempt 5: MUST lock account for 300 seconds (5 minutes)
    const status5 = await recordFailedLoginAttempt(email, clientId);
    expect(status5.isLocked).toBe(true);
    expect(status5.attemptCount).toBe(5);
    expect(status5.remainingSeconds).toBeGreaterThanOrEqual(299);
    expect(status5.lockedUntil).not.toBeNull();
  });

  it('persists lockout status across page refresh simulation (fresh status query without client state)', async () => {
    const email = 'test_refresh@example.com';
    const clientId = 'client_browser_2';

    // Trigger 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt(email, clientId);
    }

    // SIMULATED REFRESH: Perform a completely fresh server check via checkLockoutStatus
    const freshStatus = await checkLockoutStatus(email, clientId);

    expect(freshStatus.isLocked).toBe(true);
    expect(freshStatus.remainingSeconds).toBeGreaterThan(0);
    expect(freshStatus.lockedUntil).toBeGreaterThan(Date.now());
  });

  it('automatically resets attempt counter and unlocks after 5 minutes expire', async () => {
    vi.useFakeTimers();
    const email = 'timer_user@example.com';
    const clientId = 'client_timer_3';

    // Lock account
    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt(email, clientId);
    }

    let status = await checkLockoutStatus(email, clientId);
    expect(status.isLocked).toBe(true);

    // Fast-forward 5 minutes and 1 second (301,000 ms)
    vi.advanceTimersByTime(301 * 1000);

    // Status MUST now be unlocked and attempt count reset to 0
    status = await checkLockoutStatus(email, clientId);
    expect(status.isLocked).toBe(false);
    expect(status.attemptCount).toBe(0);
    expect(status.remainingSeconds).toBe(0);

    vi.useRealTimers();
  });

  it('keying by email + clientId mitigates Denial-of-Service against legitimate users', async () => {
    const targetEmail = 'target_user@example.com';
    const attackerClientId = 'attacker_ip_999';
    const legitimateClientId = 'legitimate_ip_111';

    // Attacker fails 5 times from attackerClientId
    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt(targetEmail, attackerClientId);
    }

    // Attacker IS locked out
    const attackerStatus = await checkLockoutStatus(targetEmail, attackerClientId);
    expect(attackerStatus.isLocked).toBe(true);

    // Legitimate user on legitimateClientId is NOT locked out
    const legitimateStatus = await checkLockoutStatus(targetEmail, legitimateClientId);
    expect(legitimateStatus.isLocked).toBe(false);
    expect(legitimateStatus.attemptCount).toBe(0);
  });

  it('writes security audit logs to audit_logs table on failed attempts and lockout trigger', async () => {
    const email = 'audit_test@example.com';
    const clientId = 'client_audit_4';

    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt(email, clientId);
    }

    const logs = await readAuditLogsFromDatabase();
    expect(logs.length).toBeGreaterThanOrEqual(5);

    // Verify lockout entry exists in audit_logs
    const lockoutLog = logs.find((log) => log.action === 'login_lockout_triggered');
    expect(lockoutLog).toBeDefined();
    expect(lockoutLog?.resource_type).toBe('user_auth');
    expect(lockoutLog?.metadata.attemptedEmail).toBe(email);
  });

  it('resets lockout on successful login', async () => {
    const email = 'success@example.com';
    const clientId = 'client_success_5';

    await recordFailedLoginAttempt(email, clientId);
    await recordFailedLoginAttempt(email, clientId);

    let status = await checkLockoutStatus(email, clientId);
    expect(status.attemptCount).toBe(2);

    await recordSuccessfulLoginAttempt(email, clientId);

    status = await checkLockoutStatus(email, clientId);
    expect(status.attemptCount).toBe(0);
    expect(status.isLocked).toBe(false);
  });
});

import { registerUserServer, verifyUserCredentialsServer, clearUserRegistryForTesting } from './userRegistry';

describe('Server-Side User Registry & New Account Verification Suite', () => {
  beforeEach(() => {
    clearUserRegistryForTesting();
  });

  it('allows newly registered account to sign in with its own credentials', async () => {
    const newEmail = 'new-user-test-123@example.com';
    const newPass = 'ValidPassword123!';

    // Register user on server
    await registerUserServer(newEmail, newPass, 'Test User', 'Employee', true);

    // Verify credentials immediately
    const verifyResult = await verifyUserCredentialsServer(newEmail, newPass);
    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.user?.email).toBe(newEmail);
  });

  it('handles email normalization (case insensitive & trimming)', async () => {
    const emailWithSpaces = '  NewAccountCaseTest@Example.Com  ';
    const password = 'ValidPassword123!';

    await registerUserServer(emailWithSpaces, password, 'Case User', 'Employee', true);

    // Attempt signin with lowercase / trimmed variant
    const verifyResult = await verifyUserCredentialsServer('newaccountcasetest@example.com', password);
    expect(verifyResult.valid).toBe(true);
  });

  it('returns email_not_confirmed when user is registered but unconfirmed', async () => {
    const unconfirmedEmail = 'unconfirmed@example.com';
    const password = 'ValidPassword123!';

    // Register user with isConfirmed = false
    await registerUserServer(unconfirmedEmail, password, 'Unconfirmed User', 'Tenant', false);

    const verifyResult = await verifyUserCredentialsServer(unconfirmedEmail, password);
    expect(verifyResult.valid).toBe(false);
    expect(verifyResult.reason).toBe('email_not_confirmed');
  });
});