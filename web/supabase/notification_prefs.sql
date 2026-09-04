-- MIGRATION: NOTIFICATION PREFERENCES
-- Adds opt-in columns to users table for email and SMS notifications.
-- Run in Supabase SQL Editor.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_notifications   BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.users.email_notifications IS
  'Customer opt-in for transactional email alerts (booking confirmations, reminders, status updates).';
COMMENT ON COLUMN public.users.sms_notifications IS
  'Customer opt-in for SMS reminders (1-hour before appointment, status alerts).';
