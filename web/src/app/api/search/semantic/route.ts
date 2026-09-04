/**
 * POST /api/search/semantic
 * 
 * Performs AI-powered semantic search across parlours using pgvector cosine similarity.
 * 
 * Body: { query: string, match_threshold?: float, match_count?: int }
 */

import { createClient } from "@/lib/supabase/server"
import { generateEmbedding } from "@/lib/embeddings"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Rate limiting: 60 semantic search requests per minute per IP
  const rateLimitResponse = await checkRateLimit(
    request,
    '/api/search/semantic',
    RATE_LIMITS.SEARCH.limit,
    RATE_LIMITS.SEARCH.windowSeconds
  )
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { query, match_threshold = 0.3, match_count = 10 } = body

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "query is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query.trim())

    const supabase = await createClient()

    // Call the Supabase RPC match_parlours function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc("match_parlours" as any, {
      query_embedding: queryEmbedding,
      match_threshold,
      match_count,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)

    if (error) {
      console.error("Error calling match_parlours RPC:", error)
      return NextResponse.json(
        { error: "Semantic search failed", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      query,
      results: data || [],
      count: (data || []).length,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Semantic search error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    )
  }
}
