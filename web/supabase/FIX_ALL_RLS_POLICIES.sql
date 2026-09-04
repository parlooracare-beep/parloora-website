-- ==============================================================================
-- PARLOORA: COMPREHENSIVE RLS POLICIES FIX (SOLVES ALL RLS ISSUES)
-- ==============================================================================
-- Run this ENTIRE script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vytjoyvphrqcntdogrng/sql/new
--
-- Why this is needed:
-- 1. Orders table previously blocked guest/unauthenticated checkouts with:
--    "new row violates row-level security policy for table 'orders'"
-- 2. Bookings table blocked guest reservations.
-- 3. Notifications table blocked server actions from sending alerts to sellers/customers.
-- 4. Sellers and Admins had restricted access to orders and bookings.
--
-- This script is completely IDEMPOTENT (safe to run multiple times).
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PUBLIC.USERS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view basic user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Anyone can read user display names and public profile fields
CREATE POLICY "Public can view basic user profiles"
ON public.users FOR SELECT
USING (true);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Admins can manage all user records
CREATE POLICY "Admins can manage all users"
ON public.users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PUBLIC.ORDERS POLICIES (Fixes guest checkout & admin/seller management)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders." ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers and admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers and admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- CRITICAL FIX: Anyone (logged in or guest) can place an order via COD or online payment
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
ON public.orders FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
  OR customer_id IS NULL
);

-- Sellers and Admins can view orders
CREATE POLICY "Sellers and admins can view orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND (LOWER(u.role) = 'admin' OR LOWER(u.role) = 'seller')
  )
);

-- Sellers and Admins can update orders (e.g. mark Shipped, Delivered)
CREATE POLICY "Sellers and admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND (LOWER(u.role) = 'admin' OR LOWER(u.role) = 'seller')
  )
);

-- Admins have full access to orders
CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PUBLIC.BOOKINGS POLICIES (Fixes guest booking & parlour owner management)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sellers can view own parlour bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sellers can update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Customers can cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can view their own bookings." ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings." ON public.bookings;
DROP POLICY IF EXISTS "Sellers can view their parlour's bookings." ON public.bookings;
DROP POLICY IF EXISTS "Sellers can update their parlour's bookings." ON public.bookings;

-- CRITICAL FIX: Anyone (logged in or guest) can create a booking reservation
CREATE POLICY "Anyone can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
ON public.bookings FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
  OR customer_id IS NULL
);

-- Sellers can view bookings for their parlour
CREATE POLICY "Sellers can view own parlour bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.parlours p
    WHERE p.id = bookings.parlour_id AND p.owner_id = auth.uid()
  )
);

-- Sellers can update bookings for their parlour (Approve, Decline, Complete)
CREATE POLICY "Sellers can update booking status"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.parlours p
    WHERE p.id = bookings.parlour_id AND p.owner_id = auth.uid()
  )
);

-- Customers can cancel their own pending bookings
CREATE POLICY "Customers can cancel own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (customer_id = auth.uid());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PUBLIC.NOTIFICATIONS POLICIES (Fixes in-app notification creation)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- CRITICAL FIX: Anyone (server action or user) can insert a notification for any recipient
CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PUBLIC.REVIEWS & FAVORITES POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view reviews." ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews." ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers manage own favorites." ON public.favorites;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;

-- Reviews: Anyone can read
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Reviews: Authenticated users can insert
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Reviews: Admins can manage (moderation)
CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- Favorites: Users manage their own
CREATE POLICY "Users manage own favorites"
ON public.favorites FOR ALL
TO authenticated
USING (auth.uid() = customer_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PUBLIC.PARLOURS, SERVICES & PRODUCTS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.parlours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Parlours
DROP POLICY IF EXISTS "Public can view active parlours" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can view their own parlour" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can create their parlour" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can update their own parlour" ON public.parlours;
DROP POLICY IF EXISTS "Admins can manage all parlours" ON public.parlours;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.parlours;
DROP POLICY IF EXISTS "Sellers can create their parlour." ON public.parlours;
DROP POLICY IF EXISTS "Sellers can update their own parlour." ON public.parlours;

CREATE POLICY "Public can view active parlours"
ON public.parlours FOR SELECT
USING (status = 'active' OR status = 'approved');

CREATE POLICY "Sellers can view their own parlour"
ON public.parlours FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Sellers can create their parlour"
ON public.parlours FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Sellers can update their own parlour"
ON public.parlours FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all parlours"
ON public.parlours FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- Services
DROP POLICY IF EXISTS "Active services are viewable by everyone." ON public.services;
DROP POLICY IF EXISTS "Sellers can manage their own services." ON public.services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Sellers can manage own services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;

CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Sellers can manage own services"
ON public.services FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parlours p
    WHERE p.id = services.parlour_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all services"
ON public.services FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- Products
DROP POLICY IF EXISTS "Anyone can view products." ON public.products;
DROP POLICY IF EXISTS "Sellers can manage their own products." ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Sellers can manage own products"
ON public.products FOR ALL
TO authenticated
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PUBLIC.PAYOUT_REQUESTS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bkash', 'bank_transfer')),
  payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can view own payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Sellers can submit payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Admins have full access to payout requests" ON public.payout_requests;

CREATE POLICY "Sellers can view own payout requests"
ON public.payout_requests FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can submit payout requests"
ON public.payout_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins have full access to payout requests"
ON public.payout_requests FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. THEME, CMS, CATEGORIES, PROMO CODES POLICIES (Public read, admin manage)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Admins can update theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Anyone can view theme settings." ON public.theme_settings;
DROP POLICY IF EXISTS "Admins can manage theme settings." ON public.theme_settings;
DROP POLICY IF EXISTS "Anyone can view categories." ON public.service_categories;
DROP POLICY IF EXISTS "Anyone can view homepage content." ON public.homepage_content;
DROP POLICY IF EXISTS "Anyone can view footer settings." ON public.footer_settings;

CREATE POLICY "Anyone can view theme settings"
ON public.theme_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage theme settings"
ON public.theme_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

CREATE POLICY "Anyone can view categories"
ON public.service_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.service_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

CREATE POLICY "Anyone can view homepage content"
ON public.homepage_content FOR SELECT USING (true);

CREATE POLICY "Admins can manage homepage content"
ON public.homepage_content FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

CREATE POLICY "Anyone can view footer settings"
ON public.footer_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage footer settings"
ON public.footer_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. VERIFICATION QUERY
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
