import { NextRequest, NextResponse } from 'next/server';
import { validateAndAccessSharedLink } from '@/lib/sharing/shareStorage';
import { getStoredDocuments, DEFAULT_SAMPLE_DOC } from '@/lib/documentStorage';
import { generateRealXRayOverview, generateRealSummary } from '@/lib/documentAnalysis';
import { checkRateLimit } from '@/lib/security/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } | Promise<{ token: string }> }
) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token parameter is required' }, { status: 400 });
  }

  // 1. Rate limiting check
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimitResult = await checkRateLimit(ip, 'ai_route');

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  // 2. Validate token hash & check expiry / revocation
  const sharedLink = validateAndAccessSharedLink(token, ip);

  if (!sharedLink) {
    return NextResponse.json(
      { success: false, error: 'Link is invalid, expired, or has been revoked by owner.' },
      { status: 404 }
    );
  }

  // 3. Fetch summary & X-Ray (Scope: summary_xray_only)
  const docs = getStoredDocuments();
  const targetDoc = docs.find((d) => d.id === sharedLink.document_id) || DEFAULT_SAMPLE_DOC;

  const xray = generateRealXRayOverview(targetDoc);
  const summary = generateRealSummary(targetDoc);

  // STRICT SCOPE RESTRICTION: Raw text and storage path are explicitly stripped out
  const sanitizedDoc = {
    id: targetDoc.id,
    title: targetDoc.title,
    document_type: targetDoc.document_type,
    jurisdiction: targetDoc.jurisdiction,
    created_at: targetDoc.created_at,
  };

  return NextResponse.json({
    success: true,
    data: {
      link: {
        scope: sharedLink.scope,
        expires_at: sharedLink.expires_at,
        created_at: sharedLink.created_at,
      },
      document: sanitizedDoc,
      xrayOverview: xray,
      summaryText: summary.summary.summary_text,
      keyTakeaways: summary.summary.key_takeaways,
    },
  });
}
