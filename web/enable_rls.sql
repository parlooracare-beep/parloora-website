-- ==============================================================================
-- PARLOORA: ROW LEVEL SECURITY POLICIES (UPDATED & BULLETPROOF)
-- ==============================================================================

-- 1. USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view basic user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Public can view basic user profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

-- 2. ORDERS (Allows guest + authenticated checkout)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create orders." ON public.orders;
DROP POLICY IF EXISTS "Customers can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers and admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Sellers and admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = customer_id) OR customer_id IS NULL
);
CREATE POLICY "Sellers and admins can view orders" ON public.orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (LOWER(u.role) = 'admin' OR LOWER(u.role) = 'seller'))
);
CREATE POLICY "Sellers and admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (LOWER(u.role) = 'admin' OR LOWER(u.role) = 'seller'))
);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

-- 3. BOOKINGS (Allows guest + authenticated bookings)
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

CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = customer_id) OR customer_id IS NULL
);
CREATE POLICY "Sellers can view own parlour bookings" ON public.bookings FOR SELECT TO authenticated USING (
  seller_id = auth.uid() OR EXISTS (SELECT 1 FROM public.parlours p WHERE p.id = bookings.parlour_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Sellers can update booking status" ON public.bookings FOR UPDATE TO authenticated USING (
  seller_id = auth.uid() OR EXISTS (SELECT 1 FROM public.parlours p WHERE p.id = bookings.parlour_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Customers can cancel own bookings" ON public.bookings FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

-- 4. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 5. REVIEWS & FAVORITES
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view reviews." ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews." ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers manage own favorites." ON public.favorites;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = customer_id);

-- 6. PARLOURS, SERVICES, PRODUCTS
ALTER TABLE public.parlours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active parlours" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can view their own parlour" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can create their parlour" ON public.parlours;
DROP POLICY IF EXISTS "Sellers can update their own parlour" ON public.parlours;
DROP POLICY IF EXISTS "Admins can manage all parlours" ON public.parlours;

CREATE POLICY "Public can view active parlours" ON public.parlours FOR SELECT USING (status = 'active' OR status = 'approved');
CREATE POLICY "Sellers can view their own parlour" ON public.parlours FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Sellers can create their parlour" ON public.parlours FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Sellers can update their own parlour" ON public.parlours FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all parlours" ON public.parlours FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Sellers can manage own services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;

CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own services" ON public.services FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parlours p WHERE p.id = services.parlour_id AND p.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON public.products FOR ALL TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);

-- 7. THEME & CMS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Admins can manage theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.service_categories;
DROP POLICY IF EXISTS "Anyone can view homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Admins can manage homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Anyone can view footer settings" ON public.footer_settings;
DROP POLICY IF EXISTS "Admins can manage footer settings" ON public.footer_settings;

CREATE POLICY "Anyone can view theme settings" ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage theme settings" ON public.theme_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);
CREATE POLICY "Anyone can view categories" ON public.service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.service_categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);
CREATE POLICY "Anyone can view homepage content" ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage homepage content" ON public.homepage_content FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);
CREATE POLICY "Anyone can view footer settings" ON public.footer_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage footer settings" ON public.footer_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND LOWER(u.role) = 'admin')
);
