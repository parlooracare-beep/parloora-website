"use server"

import { createClient } from "@/lib/supabase/server"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"

type PromoCode = {
  id: string
  code: string
  discount_type: "percentage" | "flat"
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  current_uses: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  applies_to: "all" | "products" | "bookings"
  created_at: string
}

// Check if user is admin
async function isAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role === "admin"
}

// 1. Validate promo code
export async function validatePromoCode(
  code: string, 
  orderType: "products" | "bookings", 
  orderAmount: number
) {
  const supabase = await createClient()
  const cleanCode = code.trim().toUpperCase()

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", cleanCode)
    .single()

  if (error || !promo) {
    return { success: false, error: "Invalid promo code" }
  }

  const typedPromo = promo as PromoCode

  if (!typedPromo.is_active) {
    return { success: false, error: "This promo code is inactive" }
  }

  const now = new Date()
  const validFrom = new Date(typedPromo.valid_from)
  if (validFrom > now) {
    return { success: false, error: "This promo code is not active yet" }
  }

  if (typedPromo.valid_until) {
    const validUntil = new Date(typedPromo.valid_until)
    if (validUntil < now) {
      return { success: false, error: "This promo code has expired" }
    }
  }

  if (typedPromo.max_uses !== null && typedPromo.current_uses >= typedPromo.max_uses) {
    return { success: false, error: "This promo code has reached its maximum uses" }
  }

  if (typedPromo.applies_to !== "all" && typedPromo.applies_to !== orderType) {
    return { success: false, error: `This promo code only applies to ${typedPromo.applies_to}` }
  }

  if (orderAmount < Number(typedPromo.min_order_amount)) {
    return { 
      success: false, 
      error: `Minimum order amount of ৳${typedPromo.min_order_amount} is required to use this promo code` 
    }
  }

  let discountAmount = 0
  if (typedPromo.discount_type === "percentage") {
    discountAmount = orderAmount * (Number(typedPromo.discount_value) / 100)
  } else {
    discountAmount = Number(typedPromo.discount_value)
  }

  // Cap discount at order amount
  discountAmount = Math.min(discountAmount, orderAmount)

  return {
    success: true,
    promoId: typedPromo.id,
    code: typedPromo.code,
    discountAmount,
    discountType: typedPromo.discount_type,
    discountValue: typedPromo.discount_value
  }
}

// 2. Increment usage count of promo code
export async function applyPromoCode(code: string) {
  const supabase = await createClient()
  const cleanCode = code.trim().toUpperCase()

  // Increment uses via RPC or direct update
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("id, current_uses")
    .eq("code", cleanCode)
    .single()

  if (promo) {
    await supabase
      .from("promo_codes")
      .update({ current_uses: (promo.current_uses || 0) + 1 })
      .eq("id", promo.id)
    return { success: true }
  }
  return { success: false, error: "Promo code not found" }
}

// 3. Admin CRUD - Fetch all
export async function getAdminPromoCodes() {
  const is_admin = await isAdminUser()
  if (!is_admin) {
    throw new Error("Unauthorized")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promo codes:", error)
    return []
  }

  return data as PromoCode[]
}

// 4. Admin CRUD - Create
export async function createPromoCode(data: {
  code: string
  discount_type: "percentage" | "flat"
  discount_value: number
  min_order_amount?: number
  max_uses?: number | null
  valid_from?: string
  valid_until?: string | null
  is_active?: boolean
  applies_to?: "all" | "products" | "bookings"
}) {
  const is_admin = await isAdminUser()
  if (!is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()
  const cleanCode = data.code.trim().toUpperCase()

  const { error } = await supabase
    .from("promo_codes")
    .insert([{
      ...data,
      code: cleanCode
    }])

  if (error) {
    console.error("Error creating promo code:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/promo-codes")
  return { success: true }
}

// 5. Admin CRUD - Update
export async function updatePromoCode(id: string, data: {
  code?: string
  discount_type?: "percentage" | "flat"
  discount_value?: number
  min_order_amount?: number
  max_uses?: number | null
  valid_from?: string
  valid_until?: string | null
  is_active?: boolean
  applies_to?: "all" | "products" | "bookings"
}) {
  const is_admin = await isAdminUser()
  if (!is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()
  const cleanCode = data.code ? data.code.trim().toUpperCase() : undefined

  const updatePayload = {
    ...data,
    ...(cleanCode ? { code: cleanCode } : {})
  }

  const { error } = await supabase
    .from("promo_codes")
    .update(updatePayload)
    .eq("id", id)

  if (error) {
    console.error("Error updating promo code:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/promo-codes")
  return { success: true }
}

// 6. Admin CRUD - Delete
export async function deletePromoCode(id: string) {
  const is_admin = await isAdminUser()
  if (!is_admin) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting promo code:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/promo-codes")
  return { success: true }
}
