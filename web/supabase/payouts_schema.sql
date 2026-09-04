-- ==============================================================================
-- PARLOORA PAYOUT/WITHDRAWAL SYSTEM SCHEMA
-- Run this SQL in your Supabase SQL Editor.
--
-- This migration adds the payout_requests table to track withdrawals submitted
-- by sellers, alongside indexes and RLS policies.
-- ==============================================================================

-- 1. Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parlour_id UUID REFERENCES public.parlours(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bkash', 'bank_transfer')),
  payment_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { bkashNumber: "017...", bankName: "...", accountNo: "..." }
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for query performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_seller ON public.payout_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- 3. Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Sellers can select/view their own payout requests
CREATE POLICY "Sellers can view own payout requests" ON public.payout_requests
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can insert/submit payout requests
CREATE POLICY "Sellers can submit payout requests" ON public.payout_requests
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Admins can manage all payout requests (select, insert, update, delete)
CREATE POLICY "Admins have full access to payout requests" ON public.payout_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

COMMENT ON TABLE public.payout_requests IS
  'Withdrawal requests created by sellers (parlour owners) and approved by platform administrators.';
