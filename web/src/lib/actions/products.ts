"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Product = Database["public"]["Tables"]["products"]["Row"]

export async function getProducts(filters?: { category?: string; search?: string }) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProduct(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase
    .from("products")
    .insert([{ ...data, seller_id: user.id }])

  if (error) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  return { success: true }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(id: string, data: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/seller/products")
  return { success: true }
}
