import { describe, it, expect } from 'vitest';
import {
  createSharedLink,
  hashToken,
  validateAndAccessSharedLink,
  revokeSharedLink,
  generateRawToken,
} from './shareStorage';

describe('Feature 6 — Shareable Read-Only Summary Links & CSPRNG Token Hashing', () => {
  const userAlice = 'user_alice_777';
  const userBob = 'user_bob_888';
  const docId = 'doc_test_share_1';

  it('1. Generates 256-bit hex token and stores ONLY SHA-256 hash in database', () => {
    const { rawToken, link } = createSharedLink(userAlice, docId, 'v1', 7);

    expect(rawToken.length).toBe(64); // 32 bytes = 64 hex chars
    expect(link.token_hash).not.toBe(rawToken);
    expect(link.token_hash).toBe(hashToken(rawToken));
    expect(link.scope).toBe('summary_xray_only');
  });

  it('2. Validates raw token against stored SHA-256 hash successfully', () => {
    const { rawToken, link } = createSharedLink(userAlice, docId, 'v1', 7);

    const validated = validateAndAccessSharedLink(rawToken);
    expect(validated).not.toBeNull();
    expect(validated?.id).toBe(link.id);
  });

  it('3. Immediate Revocation — Revoking link prevents further access immediately', () => {
    const { rawToken, link } = createSharedLink(userAlice, docId, 'v1', 7);

    // Revoke link
    const revoked = revokeSharedLink(userAlice, link.id);
    expect(revoked).toBe(true);

    // Access attempt after revocation must fail
    const attemptAfterRevoke = validateAndAccessSharedLink(rawToken);
    expect(attemptAfterRevoke).toBeNull();
  });

  it('4. Enforces RLS Ownership — User B cannot revoke User A share link', () => {
    const { link } = createSharedLink(userAlice, docId, 'v1', 7);

    const BobRevokeAttempt = revokeSharedLink(userBob, link.id);
    expect(BobRevokeAttempt).toBe(false);
  });
});
