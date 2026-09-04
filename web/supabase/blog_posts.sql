-- MIGRATION: CREATE/ADJUST BLOG POSTS TABLE
-- Ensures blog_posts table exists with 'cover_image' (matching frontend code queries).

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  category text,
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  author_id uuid REFERENCES public.users(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- If table existed with featured_image, add cover_image column just in case
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image text;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Published posts are public" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts." ON public.blog_posts;
DROP POLICY IF EXISTS "Admins manage posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins/Editors can manage all blog posts." ON public.blog_posts;

-- Recreate policies
CREATE POLICY "Published posts are public" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
