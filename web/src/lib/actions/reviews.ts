"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"
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

  // 1. Validate rating bounds
  const rating = Math.round(Number(data.rating))
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5 stars." }
  }

  // 2. Verified Customer Check: Ensure customer has completed an appointment at this parlour
  const { hasCompletedBooking } = await import("./bookings")
  const isEligible = await hasCompletedBooking(data.parlourId)
  const userRole = (user.app_metadata?.role ?? user.user_metadata?.role ?? "").toLowerCase()

  if (!isEligible && userRole !== "admin") {
    return {
      success: false,
      error: "Only customers who have completed an appointment at this parlour can leave a verified review.",
    }
  }

  // 3. Duplicate prevention: Customers can submit only one review per parlour
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .eq("parlour_id", data.parlourId)
    .eq("customer_id", user.id)
    .maybeSingle()

  if (existingReview && userRole !== "admin") {
    return {
      success: false,
      error: "You have already submitted a review for this parlour. Thank you for your feedback!",
    }
  }

  const { error } = await supabase
    .from("reviews")
    .insert([
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        parlour_id: data.parlourId,
        rating,
        comment: data.comment ? data.comment.trim() : "",
        customer_id: user.id,
        customer_name: data.customerName || user.user_metadata?.display_name || "Valued Customer",
      },
    ])

  if (error) {
    console.error("Error submitting review:", error)
    return { success: false, error: error.message }
  }

  // 4. Update parlour average rating accurately
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .eq("parlour_id", data.parlourId)

  if (allReviews && allReviews.length > 0) {
    const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length
    const updateClient = hasServiceRoleKey() ? createAdminClient() : supabase
    await updateClient
      .from("parlours")
      .update({ rating: parseFloat(avgRating.toFixed(1)) })
      .eq("id", data.parlourId)
  }

  revalidatePath(`/parlours/${data.parlourId}`)
  return { success: true }
}
