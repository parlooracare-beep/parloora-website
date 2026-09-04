-- ==============================================================================
-- PARLOORA RATE LIMITING SCHEMA
-- Run this SQL in your Supabase SQL Editor to enable API rate limiting.
-- Uses a sliding-window algorithm backed by PostgreSQL for serverless compat.
-- ==============================================================================

-- 1. Create the rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key         TEXT        PRIMARY KEY,      -- Composite: "{ip}:{endpoint}"
  hits        INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

-- 2. Index for fast expiry cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at
  ON public.rate_limits(expires_at);

-- 3. Enable Row Level Security (no public access needed — server-only via service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically, so no policies needed.
-- But let's explicitly lock down public anon access:
CREATE POLICY "No public access to rate_limits"
  ON public.rate_limits
  FOR ALL
  USING (false);

-- 4. Automatic expired-record cleanup function
--    Called by the pg_cron scheduled job (set up in step 5).
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE expires_at < NOW();
END;
$$;

-- 5. (Optional) Schedule cleanup every 5 minutes using pg_cron
--    Uncomment this block if pg_cron is enabled on your Supabase project.
--    (Available on Pro tier via: Dashboard > Database > Extensions > pg_cron)
--
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '*/5 * * * *',                        -- Every 5 minutes
--   'SELECT public.cleanup_expired_rate_limits();'
-- );

-- 6. Upsert-based atomic increment function
--    This is called from the Next.js rateLimit.ts utility via RPC.
--    Uses ON CONFLICT to atomically increment hits or reset if window has expired.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key        TEXT,
  p_limit      INTEGER,
  p_window_sec INTEGER
)
RETURNS TABLE(current_hits INTEGER, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hits        INTEGER;
  v_expires_at  TIMESTAMPTZ;
  v_now         TIMESTAMPTZ := NOW();
BEGIN
  -- Try to fetch existing record
  SELECT hits, expires_at
  INTO v_hits, v_expires_at
  FROM public.rate_limits
  WHERE key = p_key
  FOR UPDATE;                           -- Row-level lock for atomicity

  IF NOT FOUND OR v_now >= v_expires_at THEN
    -- First request in new window: create or reset
    INSERT INTO public.rate_limits (key, hits, window_start, expires_at)
    VALUES (p_key, 1, v_now, v_now + (p_window_sec || ' seconds')::INTERVAL)
    ON CONFLICT (key) DO UPDATE
      SET hits         = 1,
          window_start = v_now,
          expires_at   = v_now + (p_window_sec || ' seconds')::INTERVAL;

    RETURN QUERY SELECT 1::INTEGER, TRUE;
  ELSE
    -- Within window: increment
    UPDATE public.rate_limits
    SET hits = hits + 1
    WHERE key = p_key
    RETURNING hits INTO v_hits;

    RETURN QUERY SELECT v_hits, (v_hits <= p_limit);
  END IF;
END;
$$;

COMMENT ON TABLE public.rate_limits IS
  'Sliding-window API rate limiting store. Managed exclusively via check_and_increment_rate_limit() RPC.';
