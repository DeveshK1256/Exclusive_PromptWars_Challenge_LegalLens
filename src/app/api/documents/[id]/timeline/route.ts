import { NextRequest, NextResponse } from 'next/server';
import { runLegalTimelineAgent } from '../../../../../lib/timeline/timelineAgent';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;

    const sampleNDA = `MUTUAL NON-DISCLOSURE AGREEMENT
This Agreement is entered into and effective as of January 15, 2026 by and between Acme Corp and Beta LLC.
SECTION 1: CONFIDENTIAL INFORMATION
The receiving party agrees to hold all proprietary trade secrets in strict confidence.
SECTION 2: TERMINATION & NOTICE
This agreement shall terminate on December 31, 2028 or upon 30 days written notice by either party.
SECTION 3: PAYMENT
All invoices shall be paid within 30 days of receipt.`;

    const result = await runLegalTimelineAgent({
      documentId,
      documentVersionId,
      rawText: sampleNDA,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to extract legal timeline' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;
    const body = await request.json();
    const { rawText, sections, entities, clauses } = body;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Document rawText is required for timeline extraction' },
        { status: 400 }
      );
    }

    const result = await runLegalTimelineAgent({
      documentId,
      documentVersionId,
      rawText,
      sections,
      entities,
      clauses,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to extract legal timeline' },
      { status: 500 }
    );
  }
}
