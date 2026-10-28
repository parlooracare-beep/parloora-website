"use server"

import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Product = Database["public"]["Tables"]["products"]["Row"]

export async function getProducts(filters?: { category?: string; search?: string }) {
  const supabase = createPublicClient()

  let query = supabase.from("products").select("*").eq("is_active", true)

  if (filters?.category && filters.category !== "All") {
    query = query.eq("category", filters.category)
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data
}

export async function getProductById(id: string) {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

import { requireSeller } from "@/lib/auth-guard"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(data: any) {
  const { user } = await requireSeller()
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { success: false, error: "Product name is required." }
  }

  const price = Number(data.price)
  if (isNaN(price) || price <= 0) {
    return { success: false, error: "Product price must be greater than zero." }
  }

  const stock = data.stock !== undefined ? Number(data.stock) : 0
  if (isNaN(stock) || stock < 0) {
    return { success: false, error: "Stock quantity cannot be negative." }
  }

  const { error } = await supabase
    .from("products")
    .insert([{
      ...data,
      name: data.name.trim(),
      price,
      stock,
      seller_id: user.id,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    }])

  if (error) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  revalidatePath("/shop")
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: string, data: any) {
  const { user, role } = await requireSeller()
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  // 1. Verify existence and vendor ownership
  const { data: existing, error: fetchErr } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr || !existing) {
    return { success: false, error: "Product not found." }
  }

  if (role !== "admin" && existing.seller_id !== user.id) {
    return { success: false, error: "Forbidden: You are only authorized to edit your own products." }
  }

  // 2. Validate price and stock if provided
  if (data.price !== undefined) {
    const price = Number(data.price)
    if (isNaN(price) || price <= 0) {
      return { success: false, error: "Product price must be greater than zero." }
    }
  }

  if (data.stock !== undefined) {
    const stock = Number(data.stock)
    if (isNaN(stock) || stock < 0) {
      return { success: false, error: "Stock quantity cannot be negative." }
    }
  }

  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  revalidatePath("/shop")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const { user, role } = await requireSeller()
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  // 1. Verify existence and vendor ownership
  const { data: existing, error: fetchErr } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr || !existing) {
    return { success: false, error: "Product not found." }
  }

  if (role !== "admin" && existing.seller_id !== user.id) {
    return { success: false, error: "Forbidden: You are only authorized to delete your own products." }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  revalidatePath("/shop")
  return { success: true }
}
