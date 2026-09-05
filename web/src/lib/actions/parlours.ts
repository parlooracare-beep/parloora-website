"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"
import { revalidatePath } from "next/cache"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Parlour = Database["public"]["Tables"]["parlours"]["Row"]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Service = Database["public"]["Tables"]["services"]["Row"]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Review = Database["public"]["Tables"]["reviews"]["Row"]

export async function getFeaturedParlours() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("parlours")
    .select("*")
    .eq("featured", true)
    .limit(4)

  if (error) {
    console.error("Error fetching featured parlours:", error)
    return []
  }

  return data
}

export async function getParlours(filters?: { 
  search?: string; 
  city?: string; 
  type?: string; 
  sortBy?: string;
  minRating?: number;
  maxPrice?: number;
  gender?: "male" | "female" | "unisex";
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  let query = supabase.from("parlours").select("*", { count: "exact" })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,type.ilike.%${filters.search}%`)
  }
  
  if (filters?.city && filters.city !== "All Cities") {
    query = query.eq("city", filters.city)
  }
  
  if (filters?.type && filters.type !== "All Types") {
    query = query.eq("type", filters.type)
  }

  if (filters?.minRating) {
    query = query.gte("rating", filters.minRating)
  }

  // Handle price filtering via a join check if possible, or simple status
  // Note: Simple implementation for now as prices are in services table

  // Handle sorting
  if (filters?.sortBy === "Highest Rated") {
    query = query.order("rating", { ascending: false })
  } else if (filters?.sortBy === "Newest") {
    query = query.order("created_at", { ascending: false })
  } else {
    query = query.order("total_bookings", { ascending: false })
  }

  // Apply range for pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching parlours:", error)
    return { data: [], totalCount: 0, totalPages: 0, currentPage: page }
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    data: data || [],
    totalCount,
    totalPages,
    currentPage: page
  }
}

export async function getParlourById(id: string) {
  const supabase = await createClient()
  
  const { data: parlour, error: parlourError } = await supabase
    .from("parlours")
    .select("*")
    .eq("id", id)
    .single()

  if (parlourError || !parlour) {
    console.error("Error fetching parlour:", parlourError)
    return null
  }

  // Fetch services for this parlour
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("parlour_id", id)
    .eq("is_active", true)

  if (servicesError) {
    console.error("Error fetching services:", servicesError)
  }

  // Fetch reviews for this parlour
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    // @ts-expect-error - parlour_id column needs to be added to reviews table in Supabase
    .eq("parlour_id", id)
    .order("created_at", { ascending: false })

  if (reviewsError) {
    console.error("Error fetching reviews:", reviewsError)
  }

  return {
    ...parlour,
    is_booking_ready: true,
    services: services || [],
    reviews: reviews || []
  }
}

export async function getParlourByOwnerId(ownerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("parlours")
    .select("*")
    .eq("owner_id", ownerId)
    .single()

  if (error || !data) {
    console.error("Error fetching parlour by owner:", error)
    return null
  }

  return data
}

export async function createParlourAction(data: {
  name: string;
  owner_id: string;
  city: string;
  phone: string;
  type: string;
  address?: string;
}) {
  const supabase = await createClient()

  // Use the RPC to bypass RLS since the user might not be fully authenticated in the server session yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.rpc("create_parlour_v1" as any, {
    p_name: data.name,
    p_owner_id: data.owner_id,
    p_city: data.city,
    p_phone: data.phone,
    p_type: data.type,
    p_address: data.address || ""
  })

  if (error) {
    console.error("Error creating parlour via RPC:", error)
    return { success: false, error: error.message }
  }

  // Generate embedding for new parlour
  try {
    const parlour = await getParlourByOwnerId(data.owner_id)
    if (parlour) {
      const { updateParlourEmbedding } = await import("@/lib/embeddings")
      await updateParlourEmbedding(parlour.id)
    }
  } catch (embedError) {
    console.error("Error generating embedding after creation:", embedError)
  }

  return { success: true }
}

export async function updateParlourAction(id: string, payload: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  type?: string;
  description?: string;
  is_active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opening_hours?: any;
  image?: string;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("parlours")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating parlour:", error)
    return { success: false, error: error.message }
  }

  // Update embedding
  try {
    const { updateParlourEmbedding } = await import("@/lib/embeddings")
    await updateParlourEmbedding(id)
  } catch (embedError) {
    console.error("Error generating embedding after update:", embedError)
  }

  return { success: true, data }
}

export async function uploadGalleryImage(formData: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const parlourId = formData.get("parlourId") as string
  const file = formData.get("file") as File

  if (!parlourId || !file) {
    return { success: false, error: "Missing parlour ID or file" }
  }

  // Check permission (admin or parlour owner)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const { data: parlour } = await supabase
    .from("parlours")
    .select("owner_id, gallery_urls")
    .eq("id", parlourId)
    .single()

  if (!parlour) {
    return { success: false, error: "Parlour not found" }
  }

  const isOwner = parlour.owner_id === user.id
  const isAdmin = profile?.role === "admin"

  if (!isOwner && !isAdmin) {
    return { success: false, error: "Unauthorized to upload images for this parlour" }
  }

  // Construct filepath
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${parlourId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

  // Convert File to ArrayBuffer then Buffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to parlour-gallery bucket
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("parlour-gallery")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadErr) {
    console.error("Error uploading gallery image to storage:", uploadErr)
    return { success: false, error: uploadErr.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("parlour-gallery")
    .getPublicUrl(fileName)

  // Append to parlour's gallery_urls JSONB array
  let existingUrls: string[] = []
  if (parlour.gallery_urls && Array.isArray(parlour.gallery_urls)) {
    existingUrls = parlour.gallery_urls as string[]
  } else if (typeof parlour.gallery_urls === 'string') {
    try {
      existingUrls = JSON.parse(parlour.gallery_urls)
    } catch {
      existingUrls = []
    }
  }

  const updatedUrls = [...existingUrls, publicUrl]

  const { error: dbError } = await supabase
    .from("parlours")
    .update({ gallery_urls: updatedUrls })
    .eq("id", parlourId)

  if (dbError) {
    console.error("Error updating parlour gallery_urls in DB:", dbError)
    return { success: false, error: dbError.message }
  }

  revalidatePath(`/parlours/${parlourId}`)
  return { success: true, url: publicUrl }
}

export async function deleteGalleryImage(parlourId: string, url: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  // Check permission (admin or parlour owner)
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  const { data: parlour } = await supabase
    .from("parlours")
    .select("owner_id, gallery_urls")
    .eq("id", parlourId)
    .single()

  if (!parlour) {
    return { success: false, error: "Parlour not found" }
  }

  const isOwner = parlour.owner_id === user.id
  const isAdmin = profile?.role === "admin"

  if (!isOwner && !isAdmin) {
    return { success: false, error: "Unauthorized to delete images for this parlour" }
  }

  // Extract storage filepath from public URL
  const pathParts = url.split("/parlour-gallery/")
  if (pathParts.length < 2) {
    return { success: false, error: "Invalid image URL" }
  }
  const filePath = decodeURIComponent(pathParts[1])

  // Delete from Storage
  const { error: storageErr } = await supabase.storage
    .from("parlour-gallery")
    .remove([filePath])

  if (storageErr) {
    console.error("Error deleting image from storage:", storageErr)
  }

  // Remove from database list
  let existingUrls: string[] = []
  if (parlour.gallery_urls && Array.isArray(parlour.gallery_urls)) {
    existingUrls = parlour.gallery_urls as string[]
  } else if (typeof parlour.gallery_urls === 'string') {
    try {
      existingUrls = JSON.parse(parlour.gallery_urls)
    } catch {
      existingUrls = []
    }
  }

  const updatedUrls = existingUrls.filter(u => u !== url)

  const { error: dbError } = await supabase
    .from("parlours")
    .update({ gallery_urls: updatedUrls })
    .eq("id", parlourId)

  if (dbError) {
    console.error("Error updating parlour gallery_urls in DB:", dbError)
    return { success: false, error: dbError.message }
  }

  revalidatePath(`/parlours/${parlourId}`)
  return { success: true }
}
