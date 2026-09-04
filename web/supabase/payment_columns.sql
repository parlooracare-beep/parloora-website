-- MIGRATION: ADD PAYMENT COLUMNS TO BOOKINGS AND ORDERS
-- Adds payment tracking columns to enable Stripe, SSLCommerz, and bKash integrations.

-- 1. Bookings Table Updates
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text;

-- 2. Orders Table Updates
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text;

-- Create indexes for payment lookup performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent_id ON public.bookings(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_transaction_id ON public.bookings(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_transaction_id ON public.orders(payment_transaction_id);
