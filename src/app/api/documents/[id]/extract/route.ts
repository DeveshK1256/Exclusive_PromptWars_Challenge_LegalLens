import { NextRequest, NextResponse } from 'next/server';
import { extractDocument } from '@/lib/extraction/extractor';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
