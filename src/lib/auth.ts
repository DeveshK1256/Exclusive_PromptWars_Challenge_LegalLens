import { createClient } from '@/lib/supabase/client';
import { ContextRole } from '@/types/database';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function validatePasswordComplexity(password: string): PasswordValidationResult {
  const rules = {
    minLength: (password || '').length >= 8,
    hasUppercase: /[A-Z]/.test(password || ''),
    hasLowercase: /[a-z]/.test(password || ''),
    hasNumber: /[0-9]/.test(password || ''),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password || ''),
  };

  const errors: string[] = [];
  if (!rules.minLength) errors.push('Password must be at least 8 characters long.');
  if (!rules.hasUppercase) errors.push('Password must contain at least one uppercase letter (A-Z).');
  if (!rules.hasLowercase) errors.push('Password must contain at least one lowercase letter (a-z).');
  if (!rules.hasNumber) errors.push('Password must contain at least one numeric digit (0-9).');
  if (!rules.hasSpecialChar) errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');

  return {
    valid: errors.length === 0,
    errors,
    rules,
  };
}

export async function signUpUser(email: string, password: string, contextRole?: ContextRole) {
  if (!email || !password) {
    throw new Error('Email and password are required for registration.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address format.');
  }

  const complexity = validatePasswordComplexity(password);
  if (!complexity.valid) {
    throw new Error(complexity.errors.join(' '));
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        context_role: contextRole || 'Employee',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email and password are required for sign in.');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
