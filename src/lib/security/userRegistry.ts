import { recordSecurityAuditLog } from './auditLog';

export interface RegisteredUserRecord {
  email: string;
  passwordHash: string; // Plain/hashed password for local fallback store
  name: string;
  role: string;
  isConfirmed: boolean;
  createdAt: string;
}

// In-memory server-side user registry keyed by normalized email
const userRegistry = new Map<string, RegisteredUserRecord>();

// Pre-seed default demo accounts
userRegistry.set('demo@legallens.ai', {
  email: 'demo@legallens.ai',
  passwordHash: 'Password123!',
  name: 'Demo User',
  role: 'Employee',
  isConfirmed: true,
  createdAt: new Date().toISOString(),
});

userRegistry.set('admin@legallens.ai', {
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
 * Registers a new user account on the server.
 */
export async function registerUserServer(
  email: string,
  password: string,
  name: string,
  role: string,
  isConfirmed = true
): Promise<RegisteredUserRecord> {
  const cleanEmail = normalizeEmail(email);

  const record: RegisteredUserRecord = {
    email: cleanEmail,
    passwordHash: password,
    name,
    role,
    isConfirmed,
    createdAt: new Date().toISOString(),
  };

  userRegistry.set(cleanEmail, record);

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
 * Gets a user record by email.
 */
export function getUserServer(email: string): RegisteredUserRecord | undefined {
  return userRegistry.get(normalizeEmail(email));
}

/**
 * Verifies user credentials against server user registry.
 */
export function verifyUserCredentialsServer(email: string, password: string): {
  valid: boolean;
  user?: RegisteredUserRecord;
  reason?: 'invalid_credentials' | 'email_not_confirmed' | 'user_not_found';
} {
  const cleanEmail = normalizeEmail(email);
  const user = userRegistry.get(cleanEmail);

  if (!user) {
    return { valid: false, reason: 'user_not_found' };
  }

  if (user.passwordHash !== password) {
    return { valid: false, reason: 'invalid_credentials' };
  }

  if (!user.isConfirmed) {
    return { valid: false, user, reason: 'email_not_confirmed' };
  }

  return { valid: true, user };
}

/**
 * Clears registry for testing.
 */
export function clearUserRegistryForTesting(): void {
  userRegistry.clear();
  userRegistry.set('demo@legallens.ai', {
    email: 'demo@legallens.ai',
    passwordHash: 'Password123!',
    name: 'Demo User',
    role: 'Employee',
    isConfirmed: true,
    createdAt: new Date().toISOString(),
  });
}
