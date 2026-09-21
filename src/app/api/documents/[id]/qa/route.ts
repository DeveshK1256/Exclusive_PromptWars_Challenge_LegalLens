import { NextRequest, NextResponse } from 'next/server';
import { runGroundedQAAgent } from '../../../../../lib/qa/qaAgent';
import { checkRateLimit } from '../../../../../lib/security/rateLimit';

export const maxDuration = 60;

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
    const { question, chunks = [], rawText } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'A valid question string is required.' },
        { status: 400 }
      );
    }

    const result = await runGroundedQAAgent({
      documentId,
      documentVersionId,
      question: question.trim(),
      chunks,
      rawText,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process grounded Q&A query' },
      { status: 500 }
    );
  }
}
