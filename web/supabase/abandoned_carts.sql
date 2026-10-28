-- ==============================================================================
-- PARLOORA: ABANDONED CART RECOVERY SCHEMA & POLICIES
-- ==============================================================================
-- Privacy-conscious cart recovery tracking table.
-- Automatically respects customer notification preferences and isolates customer data.

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  items_count INTEGER NOT NULL DEFAULT 0,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for cron job queries looking for eligible abandoned carts
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery 
ON public.abandoned_carts (created_at, reminder_sent, recovered);

-- RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart recovery" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can manage own cart recovery" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Admins can view cart recoveries" ON public.abandoned_carts;

CREATE POLICY "Users can view own cart recovery"
ON public.abandoned_carts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart recovery"
ON public.abandoned_carts FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view cart recoveries"
ON public.abandoned_carts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);
