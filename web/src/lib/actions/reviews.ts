"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getParlourReviews(parlourId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .eq("parlour_id", parlourId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching parlour reviews:", error)
    return []
  }

  return data
}

export async function submitReview(data: {
  parlourId: string
  rating: number
  comment: string
  customerName: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Authentication required" }
  }

  const { error } = await supabase
    .from("reviews")
    .insert([
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parlour_id: data.parlourId,
        rating: data.rating,
        comment: data.comment,
        customer_id: user.id,
        customer_name: data.customerName,
      },
    ])

  if (error) {
    console.error("Error submitting review:", error)
    return { success: false, error: error.message }
  }

  // Update parlour average rating (simplified)
  // In a real app, this would be a trigger or a more complex calculation
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .eq("parlour_id", data.parlourId)

  if (allReviews && allReviews.length > 0) {
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length
    await supabase
      .from("parlours")
      .update({ rating: parseFloat(avgRating.toFixed(1)) })
      .eq("id", data.parlourId)
  }

  revalidatePath(`/parlours/${data.parlourId}`)
  return { success: true }
}
