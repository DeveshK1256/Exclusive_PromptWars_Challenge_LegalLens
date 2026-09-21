import { NextRequest, NextResponse } from 'next/server';
import { runContractComparisonAgent } from '@/lib/comparison/comparisonAgent';
import { verifyDualDocumentOwnership } from '@/lib/comparison/security';
import { checkRateLimit } from '@/lib/security/rateLimit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = request.headers.get('x-user-id') || 'demo_user_id',
      documentAId,
      documentBId,
      documentAOwnerId = userId,
      documentBOwnerId = userId,
      rawTextA,
      rawTextB,
      titleA,
      titleB,
    } = body;

    const rateLimit = await checkRateLimit(userId, 'ai_route');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI Request rate limit exceeded. Cap is 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    if (!documentAId || !documentBId) {
      return NextResponse.json(
        { error: 'Both documentAId and documentBId are required for comparison.' },
        { status: 400 }
      );
    }

    if (!rawTextA || !rawTextB) {
      return NextResponse.json(
        { error: 'Raw text for both Document A and Document B is required.' },
        { status: 400 }
      );
    }

    // Enforce Dual-Document Ownership Security & RLS Policy Check (Section 3.4)
    const isDualOwned = await verifyDualDocumentOwnership(
      userId,
      { id: documentAId, user_id: documentAOwnerId },
      { id: documentBId, user_id: documentBOwnerId }
    );

    if (!isDualOwned) {
      return NextResponse.json(
        {
          error: 'RLS DENIED: Access Control violation. You must own BOTH documents in a comparison.',
          code: 'CROSS_USER_COMPARISON_DENIED',
        },
        { status: 403 }
      );
    }

    const comparisonId = `cmp_${Date.now()}`;
    const result = await runContractComparisonAgent({
      comparisonId,
      userId,
      documentAId,
      documentBId,
      rawTextA,
      rawTextB,
      titleA,
      titleB,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to compare documents' },
      { status: 500 }
    );
  }
}
