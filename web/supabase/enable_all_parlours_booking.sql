-- ══════════════════════════════════════════════════════════════════════════════
-- ENABLE INSTANT BOOKINGS ACROSS ALL PARLOURS
-- Allows any parlour to accept customer bookings immediately without requiring
-- profile documents or profile completion thresholds.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Update all existing parlours to ready
UPDATE public.parlours
SET is_booking_ready = TRUE
WHERE is_booking_ready IS NOT TRUE;

-- 2. Set default for all newly created parlours to TRUE
ALTER TABLE public.parlours
ALTER COLUMN is_booking_ready SET DEFAULT TRUE;
