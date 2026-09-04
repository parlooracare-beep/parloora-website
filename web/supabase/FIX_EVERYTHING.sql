-- ================================================================
-- PARLOORA: COMPREHENSIVE FIX SCRIPT
-- Run this ENTIRE file in Supabase SQL Editor at once.
-- This script is safe to run multiple times (idempotent).
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- 1. ADD MISSING COLUMNS TO public.parlours
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS full_address TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS map_lat NUMERIC;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS map_lng NUMERIC;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS nid_number TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS trade_license TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS trade_license_url TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS verification_docs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS bkash_number TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS nagad_number TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS booking_rules TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS is_booking_ready BOOLEAN DEFAULT FALSE;

-- ────────────────────────────────────────────────────────────────
-- 2. ADD MISSING COLUMNS TO public.users
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT TRUE;

-- ────────────────────────────────────────────────────────────────
-- 3. FIX RLS POLICIES FOR public.parlours
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.parlours ENABLE ROW LEVEL SECURITY;

-- Drop all existing parlour policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.parlours;
DROP POLICY IF EXISTS "Sellers can create their parlour." ON public.parlours;
DROP POLICY IF EXISTS "Sellers can update their own parlour." ON public.parlours;
DROP POLICY IF EXISTS "Sellers can view their own parlour" ON public.parlours;
DROP POLICY IF EXISTS "Admins can do everything on parlours" ON public.parlours;

-- PUBLIC: anyone can view active parlours
CREATE POLICY "Public can view active parlours"
ON public.parlours FOR SELECT
USING (status = 'active' OR status = 'approved');

-- SELLERS: can always view their OWN parlour (any status)
CREATE POLICY "Sellers can view their own parlour"
ON public.parlours FOR SELECT
USING (auth.uid() = owner_id);

-- SELLERS: can insert their own parlour
CREATE POLICY "Sellers can create their parlour"
ON public.parlours FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- SELLERS: can update their own parlour (no WITH CHECK restriction needed)
CREATE POLICY "Sellers can update their own parlour"
ON public.parlours FOR UPDATE
USING (auth.uid() = owner_id);

-- ADMINS: full access
CREATE POLICY "Admins can manage all parlours"
ON public.parlours FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND LOWER(users.role) = 'admin'
  )
);

-- ────────────────────────────────────────────────────────────────
-- 4. CREATE THEME_SETTINGS TABLE (used by root layout)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  primary_color TEXT DEFAULT '#4B1E6D',
  secondary_color TEXT DEFAULT '#E6B7A9',
  font_family TEXT DEFAULT 'Inter',
  is_dark_mode BOOLEAN DEFAULT false,
  border_radius TEXT DEFAULT '0.75rem',
  glassmorphism_enabled BOOLEAN DEFAULT true,
  animations_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default theme row
INSERT INTO public.theme_settings (id, primary_color, secondary_color, font_family, border_radius)
VALUES ('default', '#4B1E6D', '#E6B7A9', 'Inter', '0.75rem')
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read theme settings (it's public config)
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read theme settings" ON public.theme_settings;
CREATE POLICY "Anyone can read theme settings"
ON public.theme_settings FOR SELECT
USING (true);

-- Only admins can update theme settings
DROP POLICY IF EXISTS "Admins can update theme settings" ON public.theme_settings;
CREATE POLICY "Admins can update theme settings"
ON public.theme_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND LOWER(users.role) = 'admin'
  )
);

-- ────────────────────────────────────────────────────────────────
-- 5. CREATE STAFF TABLE (for seller staff management)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Specialist',
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_services (
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active staff" ON public.staff;
CREATE POLICY "Anyone can view active staff"
ON public.staff FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Sellers can view their own staff" ON public.staff;
CREATE POLICY "Sellers can view their own staff"
ON public.staff FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parlours
    WHERE parlours.id = staff.parlour_id AND parlours.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Sellers/Admins can manage staff" ON public.staff;
CREATE POLICY "Sellers/Admins can manage staff"
ON public.staff FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.parlours
    WHERE parlours.id = staff.parlour_id AND parlours.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND LOWER(users.role) = 'admin'
  )
);

DROP POLICY IF EXISTS "Anyone can view staff services mapping" ON public.staff_services;
CREATE POLICY "Anyone can view staff services mapping"
ON public.staff_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers/Admins can manage staff services" ON public.staff_services;
CREATE POLICY "Sellers/Admins can manage staff services"
ON public.staff_services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    JOIN public.parlours ON parlours.id = staff.parlour_id
    WHERE staff.id = staff_services.staff_id AND parlours.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND LOWER(users.role) = 'admin'
  )
);

-- ────────────────────────────────────────────────────────────────
-- 6. SET JWT ROLES FOR SELLERS AND ADMINS
--    (fixes middleware redirect-to-home bug)
-- ────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "seller"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE LOWER(role) = 'seller'
);

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE LOWER(role) = 'admin'
);

-- ────────────────────────────────────────────────────────────────
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_parlour ON public.staff(parlour_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(service_id);

-- ────────────────────────────────────────────────────────────────
-- 8. VERIFY - Run this to confirm everything is set up correctly
-- ────────────────────────────────────────────────────────────────
SELECT 
  'parlours columns' AS check_name,
  COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'parlours'
UNION ALL
SELECT 
  'theme_settings row' AS check_name,
  COUNT(*) AS column_count
FROM public.theme_settings
UNION ALL
SELECT 
  'staff table exists' AS check_name,
  COUNT(*) AS column_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'staff'
UNION ALL
SELECT
  'sellers with jwt role' AS check_name,
  COUNT(*) AS column_count
FROM auth.users
WHERE raw_app_meta_data->>'role' IN ('seller', 'admin');
