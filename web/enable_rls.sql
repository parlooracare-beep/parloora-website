-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.parlours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- 1. Parlours Policies
-- Anyone can view active parlours
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.parlours FOR SELECT 
USING (status = 'active');

-- Sellers can insert their own parlour
CREATE POLICY "Sellers can create their parlour."
ON public.parlours FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Sellers can update their own parlour
CREATE POLICY "Sellers can update their own parlour."
ON public.parlours FOR UPDATE
USING (auth.uid() = owner_id);

-- Admins can view/update all (Assuming admins have a specific role or use service_role key, 
-- but if using standard auth without custom claims, you might need a way to identify admins. 
-- For now, relying on service_role for admin actions bypasses RLS).

-- 2. Services Policies
-- Anyone can view active services
CREATE POLICY "Active services are viewable by everyone."
ON public.services FOR SELECT
USING (is_active = true);

-- Sellers can manage their own services (joined through parlours)
CREATE POLICY "Sellers can manage their own services."
ON public.services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.parlours 
    WHERE parlours.id = services.parlour_id AND parlours.owner_id = auth.uid()
  )
);

-- 3. Bookings Policies
-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings."
ON public.bookings FOR SELECT
USING (auth.uid() = customer_id);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings."
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Sellers can view bookings for their parlour
CREATE POLICY "Sellers can view their parlour's bookings."
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parlours 
    WHERE parlours.id = bookings.parlour_id AND parlours.owner_id = auth.uid()
  )
);

-- Sellers can update bookings for their parlour (e.g. status)
CREATE POLICY "Sellers can update their parlour's bookings."
ON public.bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.parlours 
    WHERE parlours.id = bookings.parlour_id AND parlours.owner_id = auth.uid()
  )
);

-- 4. Favorites & Reviews
-- Customers can manage their own favorites
CREATE POLICY "Customers manage own favorites."
ON public.favorites FOR ALL
USING (auth.uid() = customer_id);

-- Customers can create reviews if they booked (basic check: just allow inserts for authenticated users for now)
CREATE POLICY "Authenticated users can create reviews."
ON public.reviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Everyone can view reviews
CREATE POLICY "Everyone can view reviews."
ON public.reviews FOR SELECT
USING (true);

-- 5. Products Policies
-- Anyone can view active products
CREATE POLICY "Anyone can view products."
ON public.products FOR SELECT
USING (is_active = true);

-- Sellers can manage their own products
CREATE POLICY "Sellers can manage their own products."
ON public.products FOR ALL
USING (auth.uid() = seller_id);

-- 6. Orders Policies
-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders."
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

-- Anyone can insert orders (for checkout)
CREATE POLICY "Anyone can create orders."
ON public.orders FOR INSERT
WITH CHECK (true);

-- 7. Notifications Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications."
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications."
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 8. Site Content & Categories
-- Anyone can view service categories
CREATE POLICY "Anyone can view categories."
ON public.service_categories FOR SELECT
USING (is_active = true);

-- Anyone can view homepage content
CREATE POLICY "Anyone can view homepage content."
ON public.homepage_content FOR SELECT
USING (true);

-- Anyone can view footer settings
CREATE POLICY "Anyone can view footer settings."
ON public.footer_settings FOR SELECT
USING (true);
