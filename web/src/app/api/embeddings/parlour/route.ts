/**
 * POST /api/embeddings/parlour
 * 
 * Generates an embedding for a parlour (by ID) and stores it in the parlours.embedding column.
 * Can be called after a parlour is created or updated to keep embeddings fresh.
 * 
 * Body: { parlour_id: string }
 */

import { updateParlourEmbedding } from "@/lib/embeddings"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Rate limiting: 5 embedding requests per minute per IP (OpenAI cost protection)
  const rateLimitResponse = await checkRateLimit(
    request,
    '/api/embeddings/parlour',
    RATE_LIMITS.EMBEDDINGS.limit,
    RATE_LIMITS.EMBEDDINGS.windowSeconds
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { parlour_id } = body

    if (!parlour_id) {
      return NextResponse.json(
        { error: "parlour_id is required" },
        { status: 400 }
      )
    }

    const res = await updateParlourEmbedding(parlour_id)

    if (!res.success) {
      return NextResponse.json(
        { error: res.error || "Failed to save embedding" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      parlour_id,
      message: "Embedding generated and saved successfully.",
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Embedding generation error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    )
  }
}
