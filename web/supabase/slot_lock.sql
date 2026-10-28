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

-- 2. Apply unique slot index on bookings table
-- Note: A partial unique index ensures only ACTIVE bookings block a slot.
-- If a previous booking was cancelled or rejected, customers can re-book that slot.
DROP INDEX IF EXISTS unique_active_parlour_slot;
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_parlour_slot 
ON public.bookings (parlour_id, date, time) 
WHERE status NOT IN ('cancelled', 'rejected');

-- Optional strict constraint (if not using partial index):
-- ALTER TABLE public.bookings ADD CONSTRAINT unique_parlour_slot UNIQUE (parlour_id, date, time);

