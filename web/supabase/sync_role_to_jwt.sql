-- ==============================================================================
-- PARLOORA ROLE → JWT SYNC TRIGGER
-- Run this SQL in your Supabase SQL Editor.
--
-- WHY: Next.js Edge Middleware reads user roles from the JWT's app_metadata
-- to avoid a database round-trip (Option A: JWT Role Cache).
-- app_metadata is server-controlled and tamper-proof by clients.
--
-- This trigger fires whenever a user's role is updated in public.users and
-- syncs it into auth.users.app_metadata so it's included in subsequent JWTs.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.sync_user_role_to_app_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update app_metadata in Supabase Auth with the new role
  -- This makes the role available in the JWT's app_metadata claim,
  -- readable in middleware via user.app_metadata.role
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any (idempotent migration)
DROP TRIGGER IF EXISTS sync_role_to_jwt ON public.users;

-- Fire AFTER INSERT (new signup) and AFTER UPDATE OF role (role changes)
CREATE TRIGGER sync_role_to_jwt
  AFTER INSERT OR UPDATE OF role
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_app_metadata();

COMMENT ON FUNCTION public.sync_user_role_to_app_metadata IS
  'Syncs public.users.role to auth.users.app_metadata.role for Edge Middleware JWT validation.';
