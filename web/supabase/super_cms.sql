-- ==============================================================================
-- PARLOORA SUPER CMS SCHEMA MIGRATION
-- Run this SQL in your Supabase SQL Editor to enable all advanced CMS features.
-- ==============================================================================

-- 1. Theme Configuration Table
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id VARCHAR PRIMARY KEY DEFAULT 'default',
  primary_color VARCHAR(30) DEFAULT '#4B1E6D',
  secondary_color VARCHAR(30) DEFAULT '#E6B7A9',
  font_family VARCHAR(50) DEFAULT 'Inter',
  is_dark_mode BOOLEAN DEFAULT FALSE,
  border_radius VARCHAR(20) DEFAULT '0.75rem',
  glassmorphism_enabled BOOLEAN DEFAULT TRUE,
  animations_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert Default Theme Config
INSERT INTO public.theme_settings (id, primary_color, secondary_color, font_family, is_dark_mode, border_radius, glassmorphism_enabled, animations_enabled)
VALUES ('default', '#4B1E6D', '#E6B7A9', 'Inter', false, '0.75rem', true, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR,
  author_id UUID REFERENCES auth.users(id),
  category VARCHAR(100),
  tags VARCHAR[],
  seo_title VARCHAR,
  seo_description VARCHAR,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, scheduled
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Blog Posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, featured_image, category, tags, status, published_at)
VALUES 
(
  '5 Secret Skincare Routines for Glowing Skin',
  '5-secret-skincare-routines-glowing-skin',
  'Discover the daily habits and professional skincare routines that will leave your skin feeling nourished, refreshed, and radiant.',
  '<h3>Introduction to Glowing Skin</h3><p>Achieving radiant, glowing skin is a journey that combines the right habits, consistency, and premium products. Here are five simple yet highly effective daily skincare routines endorsed by top beauty experts in Bangladesh.</p><h4>1. Double Cleanse Every Night</h4><p>Remove surface oils, debris, and makeup using a gentle oil-based cleanser, followed by a hydrating water-based cleanser.</p><h4>2. Regular Hydration</h4><p>Drink ample water and apply a premium hyaluronic acid serum immediately after washing your face to seal in hydration.</p>',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
  'Skincare',
  ARRAY['skincare', 'glow', 'beauty'],
  'published',
  timezone('utc'::text, now())
),
(
  'Top Bridal Makeup Trends for 2026',
  'top-bridal-makeup-trends-2026',
  'From classic gold glow to bold contemporary looks, explore the most sought-after bridal makeup trends for Bangladeshi weddings.',
  '<h3>The Ultimate Bridal Glam</h3><p>Every bride deserves to look like a queen on her special day. This season, bridal makeup is all about striking the perfect balance between traditional elegance and modern minimalism.</p><h4>1. The Glass-Skin Finish</h4><p>Luminous, dewy bases are taking center stage, creating a natural lit-from-within glow that looks stunning in photos.</p>',
  'https://images.unsplash.com/photo-1595085816353-d1f5e2239fc4?auto=format&fit=crop&w=800&q=80',
  'Makeup',
  ARRAY['bridal', 'makeup', 'trends'],
  'published',
  timezone('utc'::text, now())
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Activity Logging Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL, -- e.g., 'THEME_UPDATE', 'PRODUCT_DELETE', 'USER_BAN'
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Theme settings: Anyone can select, only Admins can update/insert
CREATE POLICY "Anyone can view theme settings." ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage theme settings." ON public.theme_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Blog Posts: Anyone can select published, only Admin/Editor can manage all
CREATE POLICY "Anyone can view published blog posts." ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins/Editors can manage all blog posts." ON public.blog_posts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'editor')
  )
);

-- Activity Logs: Only Admins can view/manage
CREATE POLICY "Only Admins can access activity logs." ON public.activity_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
