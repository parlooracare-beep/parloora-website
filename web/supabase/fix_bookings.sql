-- PARLOORA BOOKING SYSTEM FIX
-- Run this in the Supabase SQL Editor to add missing booking columns.

-- ══════════════════════════════════════════════════════════════════════════════
-- ADD MISSING COLUMNS TO bookings TABLE
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staff_id UUID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add an index on parlour_id + date for slot lookups
CREATE INDEX IF NOT EXISTS idx_bookings_parlour_date ON public.bookings (parlour_id, date);

-- Trigger to auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at();

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS: ensure customers can read their own bookings, sellers can read theirs
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sellers can view own parlour bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sellers can update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Customers can cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- Customers: read and cancel their own bookings
CREATE POLICY "Customers can view own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- Sellers: read bookings for their parlour
CREATE POLICY "Sellers can view own parlour bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Anyone authenticated can create a booking
CREATE POLICY "Customers can insert bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

-- Sellers can update status of their bookings
CREATE POLICY "Sellers can update booking status" ON public.bookings
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() OR customer_id = auth.uid());

-- Admins: full access
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
