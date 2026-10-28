-- ==============================================================================
-- PARLOORA 64-DISTRICT LOCAL SEO CMS TABLE & POLICIES
-- Run this SQL in your Supabase SQL Editor to enable full database persistence
-- for all 64 district-specific landing pages and CMS editing.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.district_seo_pages (
  id VARCHAR(64) PRIMARY KEY, -- e.g. 'dhaka', 'sylhet', 'moulvibazar'
  district_name VARCHAR(100) NOT NULL,
  bn_name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  division_id VARCHAR(50) NOT NULL,
  division_name VARCHAR(100) NOT NULL,
  canonical_url VARCHAR(255) NOT NULL,
  primary_keyword VARCHAR(255) NOT NULL,
  secondary_keywords TEXT[] DEFAULT '{}',
  long_tail_keywords TEXT[] DEFAULT '{}',
  seo_title VARCHAR(255) NOT NULL,
  meta_description TEXT NOT NULL,
  og_title VARCHAR(255),
  og_description TEXT,
  featured_image_alt TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'review-ready', 'draft', 'noindex')),
  index_status BOOLEAN NOT NULL DEFAULT FALSE,
  word_count INTEGER NOT NULL DEFAULT 0,
  h1 VARCHAR(255) NOT NULL,
  section1_intro TEXT NOT NULL,
  section2_discovery TEXT NOT NULL,
  section3_types TEXT NOT NULL,
  section4_how_to_choose TEXT NOT NULL,
  section5_booking TEXT NOT NULL,
  section6_local_discovery TEXT NOT NULL,
  section7_tips TEXT NOT NULL,
  section8_faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  section9_cta TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast lookups & filtering
CREATE INDEX IF NOT EXISTS idx_district_seo_pages_slug ON public.district_seo_pages (slug);
CREATE INDEX IF NOT EXISTS idx_district_seo_pages_division ON public.district_seo_pages (division_id);
CREATE INDEX IF NOT EXISTS idx_district_seo_pages_status ON public.district_seo_pages (status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.district_seo_pages ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access: Anyone can read published pages
DROP POLICY IF EXISTS "Public can view published district SEO pages" ON public.district_seo_pages;
CREATE POLICY "Public can view published district SEO pages"
  ON public.district_seo_pages
  FOR SELECT
  USING (status = 'published');

-- 2. Admin & Editor Management Access: Admins and editors have full CRUD access
DROP POLICY IF EXISTS "Admins and editors can manage district SEO pages" ON public.district_seo_pages;
CREATE POLICY "Admins and editors can manage district SEO pages"
  ON public.district_seo_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND (LOWER(users.role) = 'admin' OR LOWER(users.role) = 'editor')
    )
  );
