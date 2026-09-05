import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export interface AuthContext {
  user: User
  role: string
}

/**
 * Validates that an authenticated session exists.
 * Throws an error if the user is not logged in.
 */
export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized: Please sign in to continue.")
  }

  const role = (
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    "customer"
  ).toLowerCase()

  return { user, role }
}

/**
 * Enforces that the current authenticated user has administrative privileges.
 * Throws a forbidden error if the role is not 'admin'.
 */
export async function requireAdmin(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized: Please sign in with an admin account.")
  }

  // Check app_metadata first (JWT cached)
  let role = (
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    ""
  ).toLowerCase()

  // Verify against the database users table for absolute authoritative check
  if (role !== "admin") {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    role = (profile?.role ?? "").toLowerCase()
  }

  if (role !== "admin") {
    throw new Error("Forbidden: Administrator privileges required.")
  }

  return { user, role }
}

/**
 * Enforces that the current authenticated user is a verified seller or admin.
 * Throws a forbidden error if the role is not 'seller' or 'admin'.
 */
export async function requireSeller(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized: Please sign in with a seller account.")
  }

  let role = (
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    ""
  ).toLowerCase()

  if (role !== "seller" && role !== "admin") {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    role = (profile?.role ?? "").toLowerCase()
  }

  if (role !== "seller" && role !== "admin") {
    throw new Error("Forbidden: Seller privileges required.")
  }

  return { user, role }
}
