import { NextRequest, NextResponse } from 'next/server';
import { signUpUser, validatePasswordComplexity } from '@/lib/auth';
import { registerUserServer, getUserServer, normalizeEmail } from '@/lib/security/userRegistry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const email = normalizeEmail(body.email || '');
    const password = body.password || '';
    const role = body.role || 'Employee';

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address format.' },
        { status: 400 }
      );
    }

    // Password complexity check
    const complexity = validatePasswordComplexity(password);
    if (!complexity.valid) {
      return NextResponse.json(
        { error: complexity.errors.join(' ') },
        { status: 400 }
      );
    }

    // Check duplicate in server registry
    const existing = await getUserServer(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in or use another email.' },
        { status: 400 }
      );
    }

    let emailConfirmationRequired = false;
    let userId: string | undefined = undefined;

    // Attempt Supabase Signup
    try {
      const supabaseRes = await signUpUser(email, password, role as any);
      if (supabaseRes?.user) {
        userId = supabaseRes.user.id;
        const isConfirmed = Boolean(supabaseRes.user.email_confirmed_at || supabaseRes.session);
        if (!isConfirmed) {
          emailConfirmationRequired = true;
        }
      }
    } catch (sbErr: any) {
      const msg = (sbErr?.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('user_already_exists')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in or use another email.' },
          { status: 400 }
        );
      }
    }

    // Register user profile in database profiles table & Supabase Auth
    await registerUserServer(email, password, name, role, true);

    return NextResponse.json(
      {
        success: true,
        emailConfirmationRequired: false,
        email,
        message: 'Account created successfully! You can now sign in with your credentials.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json(
      { error: `Registration error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
