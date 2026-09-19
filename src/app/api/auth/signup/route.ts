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
    const existing = getUserServer(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in or use another email.' },
        { status: 400 }
      );
    }

    let emailConfirmationRequired = false;

    // Attempt Supabase Signup
    try {
      const supabaseRes = await signUpUser(email, password, role as any);
      if (supabaseRes?.user) {
        // Check if email confirmation is required by Supabase
        const isConfirmed = Boolean(supabaseRes.user.email_confirmed_at || supabaseRes.session);
        if (!isConfirmed) {
          emailConfirmationRequired = true;
        }
      }
    } catch (sbErr: any) {
      // Handle Supabase errors e.g. user already registered in Supabase
      if (sbErr?.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in or use another email.' },
          { status: 400 }
        );
      }
    }

    // Register user in server registry
    await registerUserServer(email, password, name, role, !emailConfirmationRequired);

    return NextResponse.json(
      {
        success: true,
        emailConfirmationRequired,
        email,
        message: emailConfirmationRequired
          ? `Account created! We've sent a verification link to ${email}. Please check your inbox and verify your email before signing in.`
          : 'Account created successfully! You can now sign in with your credentials.',
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
