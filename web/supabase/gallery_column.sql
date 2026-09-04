-- ADD GALLERY URLS COLUMN TO PARLOURS TABLE
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]';

-- CREATE PARLOUR GALLERY IMAGES BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'parlour-gallery', 
  'parlour-gallery', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- CLEAN UP EXISTING GALLERY POLICIES
DROP POLICY IF EXISTS "Public Access to Parlour Gallery" ON storage.objects;
DROP POLICY IF EXISTS "Manage parlour gallery images" ON storage.objects;

-- RLS POLICIES FOR PARLOUR GALLERY BUCKET
CREATE POLICY "Public Access to Parlour Gallery" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'parlour-gallery');

CREATE POLICY "Manage parlour gallery images" 
ON storage.objects FOR ALL 
TO authenticated
USING (
  bucket_id = 'parlour-gallery' AND (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.parlours
      WHERE id::text = split_part(name, '/', 1)
      AND owner_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'parlour-gallery' AND (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.parlours
      WHERE id::text = split_part(name, '/', 1)
      AND owner_id = auth.uid()
    )
  )
);
