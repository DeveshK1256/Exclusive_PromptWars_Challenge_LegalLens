import { NextRequest, NextResponse } from 'next/server';
import { extractDocument } from '@/lib/extraction/extractor';
import { checkRateLimit } from '@/lib/security/rateLimit';

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
    const body = await request.json().catch(() => ({}));
    const { sampleText, mimeType = 'text/plain', filename = 'document.txt' } = body;

    const buffer = Buffer.from(sampleText || '', 'utf-8');

    const result = await extractDocument(buffer, mimeType, filename);

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: result.error, document_id: documentId },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        document_id: documentId,
        status: 'extracted',
        sections: result.sections,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Extraction route error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
