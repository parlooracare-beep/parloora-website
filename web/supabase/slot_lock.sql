-- ==============================================================================
-- PARLOORA SLOT LOCK CONSTRAINT MIGRATION
-- Run this SQL in your Supabase SQL Editor to enforce strict time-slot integrity.
-- This guarantees at the database level that no parlour can be double-booked
-- for the exact same date and time.
-- ==============================================================================

-- 1. Ensure no existing duplicate slots exist to prevent migration failure.
-- (If duplicates exist, it will show the records. Clean them before enabling the constraint).
SELECT parlour_id, date, time, count(*)
FROM public.bookings
WHERE status != 'cancelled'
GROUP BY parlour_id, date, time
HAVING count(*) > 1;

-- 2. Apply unique slot constraint on bookings table
-- Note: This matches the current 1-to-1 slot reservation design where a booked slot is disabled.
-- If you transition to a staff-allocated model in the future, update this constraint to (parlour_id, staff_id, date, time).
ALTER TABLE public.bookings 
ADD CONSTRAINT unique_parlour_slot 
UNIQUE (parlour_id, date, time);
