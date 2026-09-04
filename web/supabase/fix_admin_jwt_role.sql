-- ============================================================
-- Fix: Set admin role in Supabase Auth app_metadata
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Find your admin user's UUID from the users table
-- Run this first to confirm who your admin is:
SELECT id, email, role FROM public.users WHERE role = 'admin';

-- Step 2: Update app_metadata in Supabase Auth for the admin user
-- Replace 'YOUR_ADMIN_USER_UUID' with the actual UUID from step 1
-- This sets the JWT claim so the admin panel does NOT need a DB lookup on every visit
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE role = 'admin'
);

-- Step 3: Verify it worked
SELECT 
  au.id,
  au.email,
  au.raw_app_meta_data->>'role' AS jwt_role,
  pu.role AS db_role
FROM auth.users au
JOIN public.users pu ON pu.id = au.id
WHERE pu.role = 'admin';

-- Expected output: jwt_role = 'admin', db_role = 'admin'
-- After running this, the admin panel will load instantly without any DB lookup.
