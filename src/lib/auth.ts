import { createClient } from '@/lib/supabase/client';
import { ContextRole } from '@/types/database';

export async function signUpUser(email: string, password: string, contextRole?: ContextRole) {
  if (!email || !password) {
    throw new Error('Email and password are required for registration.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address format.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
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
