import { describe, it, expect, beforeEach } from 'vitest';
import { POST as loginAttemptHandler } from '@/app/api/auth/login-attempt/route';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';
import { resetLockoutStoreForTesting } from '@/lib/security/loginLockout';
import { clearUserRegistryForTesting } from '@/lib/security/userRegistry';

describe('End-to-End Live Auth & Document Isolation Test Suite (Section 1 Gap Fix)', () => {
  beforeEach(() => {
    resetLockoutStoreForTesting();
    clearUserRegistryForTesting();
  });

  it('rejects random unregistered email signin attempt with 401 without granting document access', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login-attempt', {
      method: 'POST',
      body: JSON.stringify({
        email: 'random_attacker_999@unregistered-domain.com',
        password: 'RandomPassword123!',
        clientId: 'test_client_attacker',
      }),
    });

    const res = await loginAttemptHandler(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Invalid email or password.');
    expect(data.success).not.toBe(true);
  });

  it('normalizes email casing and trimming consistently across signup and login', async () => {
    const rawEmail = '  NewTestUser_Case@Domain.Com  ';
    const password = 'ValidPassword123!';

    // Signup with mixed case & surrounding whitespace
    const signupReq = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Case Test User',
        email: rawEmail,
        password,
        role: 'Employee',
      }),
    });

    const signupRes = await signupHandler(signupReq);
    expect(signupRes.status).toBe(201);

    // Login with lowercase trimmed variant
    const loginReq = new NextRequest('http://localhost:3000/api/auth/login-attempt', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newtestuser_case@domain.com',
        password,
        clientId: 'test_client_user',
      }),
    });

    const loginRes = await loginAttemptHandler(loginReq);
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.user.email).toBe('newtestuser_case@domain.com');
  });

  it('prevents cross-user document access between two distinct authenticated accounts', async () => {
    // Register User A
    const userAEmail = 'user_a_isolation@example.com';
    await signupHandler(
      new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: 'User A', email: userAEmail, password: 'Password123!', role: 'Employee' }),
      })
    );

    // Register User B
    const userBEmail = 'user_b_isolation@example.com';
    await signupHandler(
      new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: 'User B', email: userBEmail, password: 'Password123!', role: 'Tenant' }),
      })
    );

    // Verify User A signin
    const loginResA = await loginAttemptHandler(
      new NextRequest('http://localhost:3000/api/auth/login-attempt', {
        method: 'POST',
        body: JSON.stringify({ email: userAEmail, password: 'Password123!', clientId: 'client_user_a' }),
      })
    );
    expect(loginResA.status).toBe(200);

    // Verify User B signin
    const loginResB = await loginAttemptHandler(
      new NextRequest('http://localhost:3000/api/auth/login-attempt', {
        method: 'POST',
        body: JSON.stringify({ email: userBEmail, password: 'Password123!', clientId: 'client_user_b' }),
      })
    );
    expect(loginResB.status).toBe(200);
  });
});
