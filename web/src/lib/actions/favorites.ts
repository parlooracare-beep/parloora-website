"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(parlourId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Authentication required" }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("parlour_id", parlourId)
    .eq("customer_id", user.id)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/wishlist")
    revalidatePath(`/parlours/${parlourId}`)
    return { success: true, action: "removed" }
  } else {
    // Add favorite
    const { error } = await supabase
      .from("favorites")
      .insert({
        parlour_id: parlourId,
        customer_id: user.id
      })

    if (error) return { success: false, error: error.message }
    
    revalidatePath("/wishlist")
    revalidatePath(`/parlours/${parlourId}`)
    return { success: true, action: "added" }
  }
}

export async function getIsFavorited(parlourId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("parlour_id", parlourId)
    .eq("customer_id", user.id)
    .single()

  return !!data
}

export async function getCustomerWishlist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get favorite IDs
  const { data: favData, error: favError } = await supabase
    .from("favorites")
    .select("parlour_id")
    .eq("customer_id", user.id)

  if (favError || !favData.length) return []

  const parlourIds = favData.map(f => f.parlour_id)

  // Fetch parlour details for those IDs
  const { data, error } = await supabase
    .from("parlours")
    .select("*")
    .in("id", parlourIds)

  if (error) {
    console.error("Error fetching wishlist parlours:", error)
    return []
  }

  return data
}
