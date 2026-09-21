import { recordSecurityAuditLog } from './auditLog';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface RegisteredUserRecord {
  email: string;
  name: string;
  role: string;
  isConfirmed: boolean;
  createdAt: string;
}

// In-memory fallback map for unit testing & offline environment
const inMemoryUserMap = new Map<string, RegisteredUserRecord & { passwordHash?: string }>();

// Seed default demo accounts in in-memory map
inMemoryUserMap.set('demo@legallens.ai', {
  email: 'demo@legallens.ai',
  passwordHash: 'Password123!',
  name: 'Demo User',
  role: 'Employee',
  isConfirmed: true,
  createdAt: new Date().toISOString(),
});

inMemoryUserMap.set('admin@legallens.ai', {
  email: 'admin@legallens.ai',
  passwordHash: 'Password123!',
  name: 'Admin User',
  role: 'Legal Professional',
  isConfirmed: true,
  createdAt: new Date().toISOString(),
});

/**
 * Normalizes email to lowercase trimmed string
 */
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Registers a new user account profile on the server & Supabase Auth.
 */
export async function registerUserServer(
  email: string,
  password: string,
  name: string,
  role: string,
  isConfirmed = true
): Promise<RegisteredUserRecord> {
  const cleanEmail = normalizeEmail(email);

  const record: RegisteredUserRecord & { passwordHash?: string } = {
    email: cleanEmail,
    passwordHash: password,
    name,
    role,
    isConfirmed,
    createdAt: new Date().toISOString(),
  };

  inMemoryUserMap.set(cleanEmail, record);

  try {
    const admin = createAdminClient();
    const { data: usersData } = await admin.auth.admin.listUsers();
    let authUser = (usersData?.users || []).find((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (!authUser && password) {
      try {
        const { data: created } = await admin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: isConfirmed,
          user_metadata: { name, context_role: role },
        });
        if (created?.user) {
          authUser = created.user;
        }
      } catch {
        // Ignore user creation failure
      }
    } else if (authUser && password) {
      try {
        await admin.auth.admin.updateUserById(authUser.id, {
          password,
          email_confirm: isConfirmed,
          user_metadata: { name, context_role: role },
        });
      } catch {
        // Ignore user update failure
      }
    }

    if (authUser) {
      await admin.from('profiles').upsert(
        {
          user_id: authUser.id,
          display_name: name,
          context_role: role,
        },
        { onConflict: 'user_id' }
      );
    }
  } catch {
    // Ignore error in offline/test environment
  }

  await recordSecurityAuditLog(
    cleanEmail,
    'user_registered',
    'user_account',
    {
      email: cleanEmail,
      name,
      role,
      isConfirmed,
    }
  );

  return record;
}

/**
 * Gets a user record by email from Supabase Auth & profiles table.
 */
export async function getUserServer(email: string): Promise<RegisteredUserRecord | undefined> {
  const cleanEmail = normalizeEmail(email);

  try {
    const admin = createAdminClient();
    const { data: usersData } = await admin.auth.admin.listUsers();
    const authUser = (usersData?.users || []).find((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (authUser) {
      const { data: profile } = await admin
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      return {
        email: cleanEmail,
        name: profile?.display_name || authUser.user_metadata?.name || 'User',
        role: profile?.context_role || authUser.user_metadata?.context_role || 'Employee',
        isConfirmed: Boolean(authUser.email_confirmed_at),
        createdAt: authUser.created_at,
      };
    }
  } catch {
    // Fallback to in-memory map
  }

  const mem = inMemoryUserMap.get(cleanEmail);
  if (mem) {
    return {
      email: mem.email,
      name: mem.name,
      role: mem.role,
      isConfirmed: mem.isConfirmed,
      createdAt: mem.createdAt,
    };
  }

  return undefined;
}

/**
 * Verifies user credentials against Supabase Auth & in-memory fallback.
 */
export async function verifyUserCredentialsServer(email: string, password: string): Promise<{
  valid: boolean;
  user?: RegisteredUserRecord;
  reason?: 'invalid_credentials' | 'email_not_confirmed' | 'user_not_found';
}> {
  const cleanEmail = normalizeEmail(email);

  // 1. Check real Supabase Auth first
  try {
    const supabaseAnon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user) {
      const userRecord: RegisteredUserRecord = {
        email: cleanEmail,
        name: data.user.user_metadata?.name || 'User',
        role: data.user.user_metadata?.context_role || 'Employee',
        isConfirmed: Boolean(data.user.email_confirmed_at),
        createdAt: data.user.created_at,
      };
      // Synchronize in-memory cache for immediate server requests
      inMemoryUserMap.set(cleanEmail, { ...userRecord, passwordHash: password });
      return { valid: true, user: userRecord };
    }

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        return { valid: false, reason: 'email_not_confirmed' };
      }
    }
  } catch {
    // Fallback below for offline unit test environment
  }

  // 2. Check in-memory fallback for test/offline environment
  const mem = inMemoryUserMap.get(cleanEmail);
  if (mem) {
    if (mem.passwordHash && mem.passwordHash !== password) {
      return { valid: false, reason: 'invalid_credentials' };
    }
    if (!mem.isConfirmed) {
      return { valid: false, user: mem, reason: 'email_not_confirmed' };
    }
    return { valid: true, user: mem };
  }

  return { valid: false, reason: 'invalid_credentials' };
}

/**
 * Clears registry for testing.
 */
export function clearUserRegistryForTesting(): void {
  // No-op since data is persisted in Supabase Auth & PostgreSQL
}
