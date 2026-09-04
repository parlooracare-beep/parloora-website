-- CREATE AVATARS STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ADD AVATAR_URL COLUMN TO USERS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ENABLE RLS ON STORAGE.OBJECTS IF NOT ALREADY ENABLED
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- CLEAN UP EXISTING AVATAR POLICIES TO AVOID DUPLICATES
DROP POLICY IF EXISTS "Public Access to Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own avatar" ON storage.objects;

-- RLS POLICIES FOR AVATARS BUCKET
CREATE POLICY "Public Access to Avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can manage their own avatar" 
ON storage.objects FOR ALL 
TO authenticated
USING (
  bucket_id = 'avatars' AND (
    auth.uid()::text = split_part(name, '/', 1) OR
    auth.uid()::text = split_part(name, '.', 1)
  )
)
WITH CHECK (
  bucket_id = 'avatars' AND (
    auth.uid()::text = split_part(name, '/', 1) OR
    auth.uid()::text = split_part(name, '.', 1)
  )
);
