import { NextRequest, NextResponse } from "next/server";
import { runLegalXRayAgent } from "../../../../../lib/xray/legalXRayAgent";
import { checkRateLimit } from "../../../../../lib/security/rateLimit";

export const maxDuration = 60;

/**
 * POST /api/documents/[id]/xray
 * Calls the real Gemini-powered Legal X-Ray Agent with rawText from request body.
 * Returns LegalXRayOverview with AI-classified findings (severity_level + finding_kind).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id") || "demo_user_id";
    const rateLimit = await checkRateLimit(userId, "ai_route");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "AI Request rate limit exceeded. Cap is 20 requests per minute." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const documentId = params.id;
    const documentVersionId = `ver_${documentId}_v1`;
    const body = await request.json();
    const { rawText, jurisdiction } = body;

    if (!rawText) {
      return NextResponse.json(
        { error: "Document rawText is required for Legal X-Ray analysis" },
        { status: 400 }
      );
    }

    const overview = await runLegalXRayAgent(
      documentId,
      documentVersionId,
      [],
      rawText,
      jurisdiction || null
    );

    return NextResponse.json({ success: true, data: overview });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to run Legal X-Ray analysis" },
      { status: 500 }
    );
  }
}