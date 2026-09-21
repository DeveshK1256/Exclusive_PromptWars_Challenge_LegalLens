import { NextRequest, NextResponse } from 'next/server';
import { runActionPlanAgent } from '../../../../../lib/action/actionPlanAgent';
import { checkRateLimit } from '../../../../../lib/security/rateLimit';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo_user_id';
    const rateLimit = await checkRateLimit(userId, 'ai_route');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI Request rate limit exceeded. Cap is 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;

    const sampleText = `MUTUAL NON-DISCLOSURE AGREEMENT
This Agreement is entered into by Acme Corp and Beta LLC.
Either party may terminate upon 30 days written notice. Each party indemnifies the other for contract breach.`;

    const result = await runActionPlanAgent({
      documentId,
      documentVersionId,
      rawText: sampleText,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate action plan' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo_user_id';
    const rateLimit = await checkRateLimit(userId, 'ai_route');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI Request rate limit exceeded. Cap is 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;
    const body = await request.json();
    const { rawText, clauses, findings } = body;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Document rawText is required for action plan generation' },
        { status: 400 }
      );
    }

    const result = await runActionPlanAgent({
      documentId,
      documentVersionId,
      rawText,
      clauses,
      findings,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate action plan' },
      { status: 500 }
    );
  }
}
