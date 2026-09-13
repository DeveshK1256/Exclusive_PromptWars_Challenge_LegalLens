import { describe, it, expect, vi } from 'vitest';
import { signUpUser, signInUser, signOutUser, getCurrentSession } from './auth';

// Mock Supabase Client for End-to-End Auth Testing
vi.mock('@/lib/supabase/client', () => {
  let mockUser: { id: string; email: string; user_metadata: { context_role?: string } } | null = null;
  let mockSession: { user: typeof mockUser; access_token: string } | null = null;

  return {
    createClient: () => ({
      auth: {
        signUp: vi.fn(async ({ email, options }) => {
          mockUser = {
            id: 'user_a_id_123',
            email,
            user_metadata: { context_role: options?.data?.context_role || 'Employee' },
          };
          mockSession = { user: mockUser, access_token: 'fake_jwt_token_123' };
          return { data: { user: mockUser, session: mockSession }, error: null };
        }),

        signInWithPassword: vi.fn(async ({ email }) => {
          if (!mockUser || mockUser.email !== email) {
            return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
          }
          mockSession = { user: mockUser, access_token: 'fake_jwt_token_123' };
          return { data: { user: mockUser, session: mockSession }, error: null };
        }),

        signOut: vi.fn(async () => {
          mockUser = null;
          mockSession = null;
          return { error: null };
        }),

        getSession: vi.fn(async () => {
          return { data: { session: mockSession }, error: null };
        }),
      },
    }),
  };
});

describe('Authentication End-to-End Test Suite', () => {
  it('allows a user to sign up with context_role and initializes session', async () => {
    const res = await signUpUser('userA@example.com', 'SecurePassword123!', 'Tenant');
    expect(res.user).not.toBeNull();
    expect(res.user?.email).toBe('userA@example.com');
    expect(res.user?.user_metadata.context_role).toBe('Tenant');
    expect(res.session?.access_token).toBe('fake_jwt_token_123');
  });

  it('persists session and returns valid active session', async () => {
    const session = await getCurrentSession();
    expect(session).not.toBeNull();
    expect(session?.user.email).toBe('userA@example.com');
  });

  it('allows user to sign in with valid credentials', async () => {
    const res = await signInUser('userA@example.com', 'SecurePassword123!');
    expect(res.user?.email).toBe('userA@example.com');
    expect(res.session).not.toBeNull();
  });

  it('rejects sign in with invalid credentials', async () => {
    await expect(signInUser('wrong@example.com', 'wrongpass')).rejects.toThrow('Invalid login credentials');
  });

  it('clears session on sign out', async () => {
    await signOutUser();
    const session = await getCurrentSession();
    expect(session).toBeNull();
  });
});
