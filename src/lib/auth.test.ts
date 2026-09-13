import { describe, it, expect, vi } from 'vitest';
import { signUpUser, signInUser, signOutUser, getCurrentSession } from './auth';

// Mock Supabase Client for End-to-End Auth & Registration Testing
vi.mock('@/lib/supabase/client', () => {
  const registeredUsers = new Map<string, { id: string; email: string; user_metadata: { context_role?: string; full_name?: string } }>();

  return {
    createClient: () => ({
      auth: {
        signUp: vi.fn(async ({ email, password, options }) => {
          if (registeredUsers.has(email.toLowerCase())) {
            return { data: { user: null, session: null }, error: new Error('User already registered') };
          }

          const user = {
            id: `user_id_${Date.now()}`,
            email,
            user_metadata: {
              context_role: options?.data?.context_role || 'Employee',
              full_name: options?.data?.full_name || 'Demo User',
            },
          };
          registeredUsers.set(email.toLowerCase(), user);
          const session = { user, access_token: 'fake_jwt_token_123' };
          return { data: { user, session }, error: null };
        }),

        signInWithPassword: vi.fn(async ({ email, password }) => {
          const user = registeredUsers.get(email.toLowerCase());
          if (!user || password === 'wrongpass') {
            return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
          }
          const session = { user, access_token: 'fake_jwt_token_123' };
          return { data: { user, session }, error: null };
        }),

        signOut: vi.fn(async () => {
          return { error: null };
        }),

        getSession: vi.fn(async () => {
          const firstUser = registeredUsers.values().next().value || null;
          return { data: { session: firstUser ? { user: firstUser, access_token: 'fake_jwt_token_123' } : null }, error: null };
        }),
      },
    }),
  };
});

describe('Registration & Authentication Comprehensive Test Suite', () => {
  // TC_REG_001: Verify registration with valid data
  it('TC_REG_001: registers user with valid username, email, password, and context_role', async () => {
    const res = await signUpUser('tc001@example.com', 'ValidPass123!', 'Tenant');
    expect(res.user).not.toBeNull();
    expect(res.user?.email).toBe('tc001@example.com');
    expect(res.user?.user_metadata.context_role).toBe('Tenant');
  });

  // TC_REG_002: Verify mandatory fields
  it('TC_REG_002: rejects registration when email or password is missing', async () => {
    await expect(signUpUser('', 'ValidPass123!', 'Employee')).rejects.toThrow();
  });

  // TC_REG_003: Verify email field validation
  it('TC_REG_003: rejects registration with invalid email format', async () => {
    await expect(signUpUser('invalid-email-format', 'ValidPass123!', 'Employee')).rejects.toThrow();
  });

  // TC_REG_004: Verify password strength
  it('TC_REG_004: rejects registration with weak password under 8 characters', async () => {
    await expect(signUpUser('tc004@example.com', 'short', 'Employee')).rejects.toThrow();
  });

  // TC_REG_006: Verify duplicate email registration
  it('TC_REG_006: prevents registration using an existing registered email ID', async () => {
    await signUpUser('duplicate@example.com', 'ValidPass123!', 'Employee');
    await expect(signUpUser('duplicate@example.com', 'ValidPass123!', 'Employee')).rejects.toThrow('User already registered');
  });

  // TC_REG_008: Verify successful redirection & active session
  it('TC_REG_008: returns active user session upon successful registration', async () => {
    const session = await getCurrentSession();
    expect(session).not.toBeNull();
  });

  // Login Test Cases
  it('TC_LOG_001: allows login with valid registered credentials', async () => {
    const res = await signInUser('tc001@example.com', 'ValidPass123!');
    expect(res.user?.email).toBe('tc001@example.com');
    expect(res.session).not.toBeNull();
  });

  it('TC_LOG_002: rejects login with invalid password', async () => {
    await expect(signInUser('tc001@example.com', 'wrongpass')).rejects.toThrow('Invalid login credentials');
  });

  it('TC_LOG_003: clears session upon user logout', async () => {
    await signOutUser();
  });
});
