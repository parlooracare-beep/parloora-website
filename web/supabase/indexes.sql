-- ==============================================================================
-- PARLOORA DATABASE PERFORMANCE INDEXES MIGRATION
-- Run this SQL in your Supabase SQL Editor to optimize query response times.
-- This shifts query complexity from O(N) full table scans to O(log N) index lookups.
-- ==============================================================================

-- 1. Bookings Table Indexes (Critical for slots, client dashboards, and seller dashboards)
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parlour_id ON public.bookings(parlour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_id ON public.bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- 2. Parlours Table Indexes (Critical for search listings, city filters, and owner lookups)
CREATE INDEX IF NOT EXISTS idx_parlours_owner_id ON public.parlours(owner_id);
CREATE INDEX IF NOT EXISTS idx_parlours_city ON public.parlours(city);
CREATE INDEX IF NOT EXISTS idx_parlours_status ON public.parlours(status);
CREATE INDEX IF NOT EXISTS idx_parlours_rating ON public.parlours(rating DESC);
CREATE INDEX IF NOT EXISTS idx_parlours_featured ON public.parlours(featured) WHERE featured = true;

-- 3. Services Table Indexes (Critical for parlour details service grids)
CREATE INDEX IF NOT EXISTS idx_services_parlour_id ON public.services(parlour_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active) WHERE is_active = true;

-- 4. Reviews Table Indexes (Critical for details page ratings listings)
CREATE INDEX IF NOT EXISTS idx_reviews_parlour_id ON public.reviews(parlour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);

-- 5. Notifications Table Indexes (Critical for notification bell unread indicators)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status) WHERE status = 'unread';

-- 6. Favorites Table Indexes (Critical for wishlist loads)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- 7. Orders Table Indexes (Critical for ecommerce order history checks)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 8. Products Table Indexes (Critical for shop collections)
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 9. Blog Table Indexes (Critical for CMS filters and dynamic slug route lookups)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

-- 10. Activity Logs Indexes (Critical for 슈퍼 어드민 audit trail log sorting)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
