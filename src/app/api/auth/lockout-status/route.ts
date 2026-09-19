import { NextRequest, NextResponse } from 'next/server';
import { checkLockoutStatus } from '@/lib/security/loginLockout';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';
    const clientId = searchParams.get('clientId') || request.headers.get('x-forwarded-for') || 'default_client';

    const status = await checkLockoutStatus(email, clientId);

    return NextResponse.json(
      {
        isLocked: status.isLocked,
        remainingSeconds: status.remainingSeconds,
        lockedUntil: status.lockedUntil,
        attemptCount: status.attemptCount,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lockout status check failed';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}