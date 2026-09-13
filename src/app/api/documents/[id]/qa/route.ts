import { NextRequest, NextResponse } from 'next/server';
import { runGroundedQAAgent } from '../../../../../lib/qa/qaAgent';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;
    const body = await request.json();
    const { question, chunks = [] } = body;

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
