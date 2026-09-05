-- ══════════════════════════════════════════════════════════════════════════════
-- ADD USERNAME SYSTEM FOR PARLOURS
-- Enables custom handles and friendly vanity URLs (e.g. /parlours/the-royal-spa)
-- alongside existing UUIDs (e.g. /parlours/b167c5d0-e4a0-4ee8-a4ed-3cb6f32530ac)
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Add username column if not present
ALTER TABLE public.parlours 
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Create unique index on lowercase username
CREATE UNIQUE INDEX IF NOT EXISTS parlours_username_lower_idx 
ON public.parlours (LOWER(username)) 
WHERE username IS NOT NULL;

-- 3. Populate clean usernames for existing parlours from their names
UPDATE public.parlours
SET username = LOWER(
  TRIM(BOTH '-' FROM REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g'))
)
WHERE username IS NULL AND name IS NOT NULL;

-- 4. Specifically ensure The Royal Spa has "the-royal-spa"
UPDATE public.parlours
SET username = 'the-royal-spa'
WHERE id = 'b167c5d0-e4a0-4ee8-a4ed-3cb6f32530ac'
   OR LOWER(name) LIKE '%royal spa%';
