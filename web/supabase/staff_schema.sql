-- MIGRATION: STAFF/SPECIALIST MANAGEMENT SYSTEM
-- Setup tables for staff, mapping to services, and booking assignment.

-- 1. Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Specialist', -- e.g. 'Senior Stylist', 'Masseuse'
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Staff Services Join Table (Multi-assign staff to services)
CREATE TABLE IF NOT EXISTS public.staff_services (
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- 3. Add staff_id Reference to Bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- 5. Staff RLS Policies
-- Anyone can view active staff (necessary for customers booking a service)
CREATE POLICY "Anyone can view active staff" ON public.staff 
  FOR SELECT USING (is_active = true);

-- Staff manage policies: parlour owner/seller or admin can do everything
CREATE POLICY "Sellers/Admins can manage staff" ON public.staff 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.parlours
      WHERE parlours.id = staff.parlour_id AND parlours.owner_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 6. Staff Services Join RLS Policies
CREATE POLICY "Anyone can view staff services mapping" ON public.staff_services 
  FOR SELECT USING (true);

CREATE POLICY "Sellers/Admins can manage staff services" ON public.staff_services 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff
      JOIN public.parlours ON parlours.id = staff.parlour_id
      WHERE staff.id = staff_services.staff_id AND parlours.owner_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 7. Create Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_staff_parlour ON public.staff(parlour_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON public.bookings(staff_id);
