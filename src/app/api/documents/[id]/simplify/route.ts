import { NextRequest, NextResponse } from 'next/server';
import { runSimplificationAgent } from '../../../../../lib/simplification/simplificationAgent';
import { checkRateLimit } from '../../../../../lib/security/rateLimit';
import { ComplexityLevel } from '../../../../../types/database';

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
    const searchParams = request.nextUrl.searchParams;
    const level = (searchParams.get('level') as ComplexityLevel) || 'very_simple';

    // Mock document text for demonstration / API route endpoint
    const sampleText = `MUTUAL NON-DISCLOSURE AGREEMENT
This Non-Disclosure Agreement is made between Acme Corp and Beta LLC.
SECTION 1: CONFIDENTIAL INFORMATION
The receiving party agrees to hold in confidence all proprietary technical information.
SECTION 2: TERMINATION
This agreement shall terminate on December 31, 2028 or upon 30 days written notice by either party.`;

    const result = await runSimplificationAgent({
      documentId,
      documentVersionId,
      rawText: sampleText,
      complexityLevel: level,
    });

    return NextResponse.json({
      success: true,
      summary: result.summary,
      glossary: result.glossary,
      availableLevels: Object.keys(result.allSummaries),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process document simplification request' },
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
    const { level = 'very_simple', rawText, clauses, findings } = body;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Document rawText is required for simplification' },
        { status: 400 }
      );
    }

    const result = await runSimplificationAgent({
      documentId,
      documentVersionId,
      rawText,
      complexityLevel: level as ComplexityLevel,
      clauses,
      findings,
    });

    return NextResponse.json({
      success: true,
      summary: result.summary,
      glossary: result.glossary,
      allSummaries: result.allSummaries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate document summary' },
      { status: 500 }
    );
  }
}
