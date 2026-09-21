import { NextRequest, NextResponse } from 'next/server';
import { runPersonalImpactAgent } from '@/lib/impact/personalImpactAgent';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { ContextRole } from '@/lib/impact/types';

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo_user_id';
    const rateLimit = await checkRateLimit(userId, 'ai_route');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'AI Request rate limit exceeded. Cap is 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const documentId = params.id;
    const body = await req.json();

    const contextRole: ContextRole = body.context_role || body.contextRole || 'Employee';
    const findings = body.findings || [];
    const jurisdiction = body.jurisdiction || null;

    if (!Array.isArray(findings) || findings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Input findings array cannot be empty.' },
        { status: 400 }
      );
    }

    const result = await runPersonalImpactAgent({
      documentId,
      documentVersionId: body.documentVersionId,
      contextRole,
      findings,
      jurisdiction,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate personal impact evaluation.' },
      { status: 500 }
    );
  }
}
