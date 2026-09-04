-- ============================================================
-- Fix: Set seller role in Supabase Auth app_metadata
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Check what roles exist and in what format
SELECT id, email, role FROM public.users ORDER BY created_at ASC;

-- Step 2: Set app_metadata role for ALL sellers
-- This enables the JWT fast-path so middleware can read role without a DB call
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "seller"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE LOWER(role) = 'seller'
);

-- Step 3: Also set app_metadata role for ALL admins (fixes admin panel too)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id IN (
  SELECT id FROM public.users WHERE LOWER(role) = 'admin'
);

-- Step 4: Verify results
SELECT 
  au.email,
  pu.role AS db_role,
  au.raw_app_meta_data->>'role' AS jwt_role
FROM auth.users au
JOIN public.users pu ON pu.id = au.id
ORDER BY pu.role;

-- Expected: jwt_role should match lowercase version of db_role for all sellers and admins
-- After running this: sign out and sign back in to refresh the JWT token
