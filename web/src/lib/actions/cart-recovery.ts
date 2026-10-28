"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"

/**
 * Privacy-conscious cart tracking for abandoned cart recovery.
 * Respects customer notification preferences and isolates customer records.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function trackCartActivity(items: any[], totalAmount: number) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !items || items.length === 0) {
      return { success: false }
    }

    const adminSupabase = hasServiceRoleKey() ? createAdminClient() : supabase

    const { error } = await adminSupabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("abandoned_carts" as any)
      .upsert(
        {
          user_id: user.id,
          items,
          total_amount: totalAmount,
          items_count: items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0),
          reminder_sent: false,
          recovered: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (error) {
      console.warn("Failed to record cart activity:", error.message)
      return { success: false }
    }

    return { success: true }
  } catch (err) {
    console.warn("trackCartActivity exception:", err)
    return { success: false }
  }
}

export async function clearCartActivity() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const adminSupabase = hasServiceRoleKey() ? createAdminClient() : supabase

    const { error } = await adminSupabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("abandoned_carts" as any)
      .update({
        recovered: true,
        recovered_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.warn("Failed to clear cart activity:", error.message)
      return { success: false }
    }

    return { success: true }
  } catch (err) {
    console.warn("clearCartActivity exception:", err)
    return { success: false }
  }
}
