-- PARLOORA SUPABASE SCHEMA
-- This file documents the complete database structure required for the Parloora platform.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- USERS TABLE (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  status TEXT DEFAULT 'active',
  reward_points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}'::jsonb,
  gender TEXT,
  dob DATE,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARLOURS TABLE
CREATE TABLE public.parlours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT, -- e.g., 'Beauty Salon', 'Spa', 'Nail Bar'
  description TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  website TEXT,
  image TEXT, -- Main profile image
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_bookings INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending', -- pending, approved, suspended
  opening_hours JSONB DEFAULT '{}'::jsonb,
  commission_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICES TABLE
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.users(id), -- Redundant but useful for filtering
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  duration TEXT, -- e.g., '30 mins'
  gender TEXT DEFAULT 'unisex', -- male, female, unisex
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.users(id),
  customer_name TEXT,
  customer_phone TEXT,
  parlour_name TEXT,
  service_name TEXT,
  service_address TEXT,
  date DATE,
  time TIME,
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
  payment_method TEXT,
  amount DECIMAL(10,2),
  original_price DECIMAL(10,2),
  price DECIMAL(10,2), -- final price after discounts
  reward_discount DECIMAL(10,2) DEFAULT 0,
  reward_points_redeemed INTEGER DEFAULT 0,
  points_awarded BOOLEAN DEFAULT false,
  notes TEXT,
  is_guest BOOLEAN DEFAULT false,
  booking_type TEXT DEFAULT 'in-parlour', -- in-parlour, at-home
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE, -- Fix for the @ts-ignore
  product_id UUID, -- Optional if review is for a product
  customer_name TEXT,
  seller_name TEXT, -- Parlour name or individual seller
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE (For Shop)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITES TABLE
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, parlour_id)
);

-- ORDERS TABLE
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'Processing',
  payment_method TEXT,
  items JSONB, -- Snapshot of cart items
  items_count INTEGER,
  delivery_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT, -- booking, system, offer, order
  status TEXT DEFAULT 'unread',
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE CATEGORIES TABLE
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOMEPAGE CONTENT TABLE
CREATE TABLE public.homepage_content (
  id TEXT PRIMARY KEY, -- 'default'
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_pill_text TEXT,
  shop_title TEXT,
  shop_subtitle TEXT,
  cta_title TEXT,
  cta_subtitle TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FOOTER SETTINGS TABLE
CREATE TABLE public.footer_settings (
  id TEXT PRIMARY KEY, -- 'default'
  about_text TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. FUNCTIONS & RPCs
-- ══════════════════════════════════════════════════════════════════════════════

-- Create Parlour RPC (bypasses some checks if needed)
CREATE OR REPLACE FUNCTION public.create_parlour_v1(
  p_name TEXT,
  p_owner_id UUID,
  p_city TEXT,
  p_phone TEXT,
  p_type TEXT,
  p_address TEXT DEFAULT ''
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.parlours (name, owner_id, city, phone, type, address, status)
  VALUES (p_name, p_owner_id, p_city, p_phone, p_type, p_address, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Is Admin Check
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. RLS POLICIES (Summary from enable_rls.sql)
-- ══════════════════════════════════════════════════════════════════════════════

-- [Policies already documented in web/enable_rls.sql]
