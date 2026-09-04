-- CREATE PROMO CODES TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,        -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'bookings')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES ON PROMO CODES
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active_valid ON public.promo_codes(is_active, valid_until);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- CLEAN UP EXISTING PROMO POLICIES
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;

-- RLS POLICIES FOR PROMO CODES
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL 
  TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
  FOR SELECT 
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));
