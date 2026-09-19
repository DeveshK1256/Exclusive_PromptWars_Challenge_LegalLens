import { NextRequest, NextResponse } from 'next/server';
import { checkLockoutStatus, recordFailedLoginAttempt, recordSuccessfulLoginAttempt } from '@/lib/security/loginLockout';
import { verifyUserCredentialsServer, normalizeEmail } from '@/lib/security/userRegistry';
import { signInUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = body.email || '';
    const cleanEmail = normalizeEmail(rawEmail);
    const password = body.password || '';
    const clientId = (body.clientId || request.headers.get('x-forwarded-for') || 'default_client').trim();

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    // 1. Check current server-side lockout status
    const currentStatus = await checkLockoutStatus(cleanEmail, clientId);
    if (currentStatus.isLocked) {
      return NextResponse.json(
        {
          error: 'Account locked due to 5 consecutive failed login attempts.',
          isLocked: true,
          remainingSeconds: currentStatus.remainingSeconds,
          lockedUntil: currentStatus.lockedUntil,
          attemptCount: currentStatus.attemptCount,
        },
        { status: 429 }
      );
    }

    // 2. Attempt Authentication
    let isAuthenticated = false;
    let isEmailNotConfirmed = false;

    // First try Supabase authentication
    try {
      const authRes = await signInUser(cleanEmail, password);
      if (authRes?.user) {
        isAuthenticated = true;
      }
    } catch (sbErr: any) {
      const msg = (sbErr?.message || '').toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
        isEmailNotConfirmed = true;
      }
    }

    // Fallback: Verify against server-side user registry if Supabase didn't authenticate
    if (!isAuthenticated && !isEmailNotConfirmed) {
      const verifyRes = verifyUserCredentialsServer(cleanEmail, password);
      if (verifyRes.valid) {
        isAuthenticated = true;
      } else if (verifyRes.reason === 'email_not_confirmed') {
        isEmailNotConfirmed = true;
      }
    }

    // Handle Unconfirmed Email State cleanly (HTTP 403)
    // IMPORTANT: Unconfirmed email does NOT count as a failed password attempt
    if (isEmailNotConfirmed) {
      return NextResponse.json(
        {
          error: 'Email address not confirmed. Please check your inbox for the verification link.',
          emailNotConfirmed: true,
        },
        { status: 403 }
      );
    }

    // 3. Handle Authentication Success
    if (isAuthenticated) {
      await recordSuccessfulLoginAttempt(cleanEmail, clientId);
      return NextResponse.json(
        {
          success: true,
          message: 'Authentication successful',
          user: { email: cleanEmail },
        },
        { status: 200 }
      );
    }

    // 4. Handle Authentication Failure (Invalid Credentials)
    const newStatus = await recordFailedLoginAttempt(cleanEmail, clientId);

    // SECURITY REQUIREMENT 1: Always return generic error to prevent user enumeration
    if (newStatus.isLocked) {
      return NextResponse.json(
        {
          error: 'Account locked due to 5 consecutive failed login attempts.',
          isLocked: true,
          remainingSeconds: newStatus.remainingSeconds,
          lockedUntil: newStatus.lockedUntil,
          attemptCount: newStatus.attemptCount,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Invalid email or password.',
        isLocked: false,
        remainingSeconds: 0,
        attemptCount: newStatus.attemptCount,
      },
      { status: 401 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login verification failed';
    return NextResponse.json(
      { error: `Login error: ${errorMsg}` },
      { status: 500 }
    );
  }
}