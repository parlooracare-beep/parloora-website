-- PARLOORA SCHEMA EXTENSION: REGISTRATION & PROFILE MANAGEMENT
-- Run this script in the Supabase SQL Editor to support Phase 1 requirements.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ADD COLUMNS TO USERS & PARLOURS
-- ══════════════════════════════════════════════════════════════════════════════

-- New columns on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS beauty_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS favorite_services TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- New columns on public.parlours
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

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. CREATE VERIFICATION STORAGE BUCKET & POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Create the verification-docs storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-docs', 
  'verification-docs', 
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up existing verification policies
DROP POLICY IF EXISTS "Sellers can manage own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification docs" ON storage.objects;

-- RLS Policy: Allow authenticated users to manage files starting with their user ID
CREATE POLICY "Sellers can manage own verification docs" 
ON storage.objects FOR ALL 
TO authenticated
USING (
  bucket_id = 'verification-docs' AND (
    auth.uid()::text = split_part(name, '/', 1) OR
    auth.uid()::text = split_part(name, '.', 1)
  )
)
WITH CHECK (
  bucket_id = 'verification-docs' AND (
    auth.uid()::text = split_part(name, '/', 1) OR
    auth.uid()::text = split_part(name, '.', 1)
  )
);

-- RLS Policy: Allow admins to read all verification documents
CREATE POLICY "Admins can view all verification docs" 
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'verification-docs' AND (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. UPGRADE NEW USER TRIGGER (AUTOMATIC PARLOUR STUB CREATION)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_display_name TEXT;
  v_phone TEXT;
  v_business_name TEXT;
  v_district TEXT;
BEGIN
  v_role := COALESCE(LOWER(new.raw_user_meta_data->>'role'), 'customer');
  v_display_name := new.raw_user_meta_data->>'display_name';
  v_phone := new.raw_user_meta_data->>'phone_number';
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, display_name, phone, role)
  VALUES (
    new.id,
    new.email,
    v_display_name,
    v_phone,
    v_role
  );

  -- If it's a seller, also insert a stub parlour record
  IF v_role = 'seller' THEN
    v_business_name := COALESCE(new.raw_user_meta_data->>'business_name', 'My Parlour');
    v_district := COALESCE(new.raw_user_meta_data->>'district', '');
    
    INSERT INTO public.parlours (owner_id, name, city, phone, status, is_active)
    VALUES (
      new.id,
      v_business_name,
      v_district,
      v_phone,
      'pending',
      false -- start as inactive until profile is complete
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (just to ensure it uses the updated handle_new_user function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
