import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * Parloora API Rate Limiter
 *
 * Implements a sliding-window rate limiting strategy backed by PostgreSQL.
 * This is serverless-compatible and avoids the need for Redis during MVP.
 *
 * Uses the `check_and_increment_rate_limit` Supabase RPC function, which
 * handles atomic increment with row-level locking internally.
 *
 * Usage:
 *   const rateLimitResponse = await checkRateLimit(request, '/api/bookings', 10, 60)
 *   if (rateLimitResponse) return rateLimitResponse  // 429 Too Many Requests
 *
 * @param request      - The incoming NextRequest (used to extract the IP)
 * @param endpoint     - A unique string identifying this API route (e.g. '/api/bookings')
 * @param limit        - Maximum number of requests allowed within the window
 * @param windowSeconds - The sliding window duration in seconds
 * @returns A NextResponse with status 429 if rate limited, or null if allowed
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string,
  limit: number = 30,
  windowSeconds: number = 60
): Promise<NextResponse | null> {
  // Extract client IP from request headers (handles Vercel / CDN reverse proxies)
  const ip =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'

  // Composite key uniquely identifies a user+endpoint combination
  const key = `${ip}:${endpoint}`

  try {
    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)(
      'check_and_increment_rate_limit',
      {
        p_key: key,
        p_limit: limit,
        p_window_sec: windowSeconds,
      }
    )

    if (error) {
      // On DB error, fail open to avoid blocking legitimate traffic
      console.error('[RateLimit] RPC error:', error.message)
      return null
    }

    const result = Array.isArray(data) ? data[0] : data

    if (!result?.allowed) {
      const retryAfter = windowSeconds
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(
              Math.floor(Date.now() / 1000) + retryAfter
            ),
          },
        }
      )
    }

    return null // Request is allowed
  } catch (err) {
    // Unexpected errors should not block requests
    console.error('[RateLimit] Unexpected error:', err)
    return null
  }
}

/**
 * Pre-configured rate limit profiles for common Parloora endpoints.
 * Import and use these constants instead of hardcoding limits per route.
 */
export const RATE_LIMITS = {
  /** Strict: Login / signup — 5 attempts per minute (brute-force protection) */
  AUTH: { limit: 5, windowSeconds: 60 },

  /** Moderate: Booking creation — 10 per minute per user */
  BOOKING: { limit: 10, windowSeconds: 60 },

  /** Generous: Parlour search / listing — 60 per minute */
  SEARCH: { limit: 60, windowSeconds: 60 },

  /** Standard: General API calls — 30 per minute */
  GENERAL: { limit: 30, windowSeconds: 60 },

  /** Tight: Embedding generation — 5 per minute (OpenAI cost protection) */
  EMBEDDINGS: { limit: 5, windowSeconds: 60 },
} as const
