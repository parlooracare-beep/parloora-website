"use server"

import { createClient } from "@/lib/supabase/server"

export async function calculateSellerCompletion(parlour: {
  logoUrl?: string
  coverUrl?: string
  description?: string
  address?: string
  nidNumber?: string
  tradeLicense?: string
  hasOpeningHours?: boolean
  hasPaymentInfo?: boolean
}) {
  let score = 0
  if (parlour.logoUrl?.trim()) score += 15
  if (parlour.coverUrl?.trim()) score += 10
  if (parlour.description?.trim()) score += 10
  if (parlour.address?.trim()) score += 15
  if (parlour.nidNumber?.trim()) score += 15
  if (parlour.tradeLicense?.trim()) score += 15
  if (parlour.hasOpeningHours) score += 10
  if (parlour.hasPaymentInfo) score += 10
  return Math.min(score, 100)
}

export async function getSellerProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return null
  }

  // Fetch parlour where owner_id = user.id
  const { data: parlour, error } = await supabase
    .from("parlours")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (error || !parlour) {
    return null
  }

  // Check if has opening hours (not empty json)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hours = parlour.opening_hours as any
  const hasHours = hours && Object.keys(hours).length > 0

  // Check if has payment details
  const hasPayment = !!(parlour.bank_account || parlour.bkash_number || parlour.nagad_number)

  return {
    id: parlour.id,
    ownerId: parlour.owner_id,
    name: parlour.name,
    type: parlour.type || "",
    description: parlour.description || "",
    address: parlour.address || "",
    fullAddress: parlour.full_address || "",
    city: parlour.city || "",
    phone: parlour.phone || "",
    website: parlour.website || "",
    logoUrl: parlour.logo_url || "",
    coverUrl: parlour.cover_url || "",
    rating: parlour.rating || 5.0,
    status: parlour.status || "pending",
    openingHours: hours || {},
    bankAccount: parlour.bank_account || "",
    bkashNumber: parlour.bkash_number || "",
    nagadNumber: parlour.nagad_number || "",
    nidNumber: parlour.nid_number || "",
    tradeLicense: parlour.trade_license || "",
    tradeLicenseUrl: parlour.trade_license_url || "",
    bookingRules: parlour.booking_rules || "",
    cancellationPolicy: parlour.cancellation_policy || "",
    profileCompletion: parlour.profile_completion || 0,
    isBookingReady: parlour.is_booking_ready || false,
    hasOpeningHours: hasHours,
    hasPaymentInfo: hasPayment
  }
}

export async function updateSellerProfile(data: {
  name?: string
  type?: string
  description?: string
  address?: string
  fullAddress?: string
  city?: string
  phone?: string
  website?: string
  bankAccount?: string
  bkashNumber?: string
  nagadNumber?: string
  nidNumber?: string
  tradeLicense?: string
  bookingRules?: string
  cancellationPolicy?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openingHours?: any
}) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { success: false, error: "Unauthorized" }
  }

  // Fetch the existing parlour details
  const { data: currentParlour } = await supabase
    .from("parlours")
    .select("logo_url, cover_url, opening_hours, bank_account, bkash_number, nagad_number")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!currentParlour) {
    return { success: false, error: "Parlour profile not found. Make sure you have completed the seller registration." }
  }

  // Validate presence of opening hours
  const finalHours = data.openingHours !== undefined ? data.openingHours : currentParlour.opening_hours
  const hasHours = !!(finalHours && typeof finalHours === 'object' && Object.keys(finalHours).length > 0)

  // Validate presence of payment details
  const hasPayment = !!(
    (data.bankAccount ?? currentParlour.bank_account) ||
    (data.bkashNumber ?? currentParlour.bkash_number) ||
    (data.nagadNumber ?? currentParlour.nagad_number)
  )

  // Compute profile completion score
  const completionScore = await calculateSellerCompletion({
    logoUrl: currentParlour.logo_url || undefined,
    coverUrl: currentParlour.cover_url || undefined,
    description: data.description,
    address: data.address || data.fullAddress,
    nidNumber: data.nidNumber,
    tradeLicense: data.tradeLicense,
    hasOpeningHours: hasHours,
    hasPaymentInfo: hasPayment
  })

  // Booking ready if completion is 30% or higher
  const isBookingReady = completionScore >= 30

  // Build update payload — only include columns that should change
  // NOTE: status is NOT updated here — only admins change approval status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, any> = {
    profile_completion: completionScore,
    is_booking_ready: isBookingReady,
    opening_hours: finalHours,
  }
  if (data.name !== undefined) updatePayload.name = data.name
  if (data.type !== undefined) updatePayload.type = data.type
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.address !== undefined) updatePayload.address = data.address
  if (data.fullAddress !== undefined) updatePayload.full_address = data.fullAddress
  if (data.city !== undefined) updatePayload.city = data.city
  if (data.phone !== undefined) updatePayload.phone = data.phone
  if (data.website !== undefined) updatePayload.website = data.website
  if (data.bankAccount !== undefined) updatePayload.bank_account = data.bankAccount
  if (data.bkashNumber !== undefined) updatePayload.bkash_number = data.bkashNumber
  if (data.nagadNumber !== undefined) updatePayload.nagad_number = data.nagadNumber
  if (data.nidNumber !== undefined) updatePayload.nid_number = data.nidNumber
  if (data.tradeLicense !== undefined) updatePayload.trade_license = data.tradeLicense
  if (data.bookingRules !== undefined) updatePayload.booking_rules = data.bookingRules
  if (data.cancellationPolicy !== undefined) updatePayload.cancellation_policy = data.cancellationPolicy

  // Update parlour details
  const { error: updateErr } = await supabase
    .from("parlours")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updatePayload as any)
    .eq("owner_id", user.id)

  if (updateErr) {
    console.error("Error updating seller profile:", updateErr)
    return { success: false, error: updateErr.message }
  }

  // NO revalidatePath calls — they trigger DYNAMIC_SERVER_USAGE errors
  // The client component updates its own state on success
  return { success: true, completionScore, isBookingReady }
}

export async function uploadSellerFile(formData: FormData, fileType: "logo" | "cover" | "license") {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { success: false, error: "Unauthorized" }
  }

  // Get parlour
  const { data: parlour } = await supabase
    .from("parlours")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!parlour) {
    return { success: false, error: "Parlour profile not found" }
  }

  const file = formData.get("file") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  const ext = file.name.split(".").pop() || "jpg"
  const bucketName = fileType === "license" ? "verification-docs" : "avatars"
  const fileName = `${user.id}/${fileType}_${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload file
  const { error: uploadErr } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadErr) {
    console.error("Error uploading file to storage:", uploadErr)
    return { success: false, error: `Storage upload failed: ${uploadErr.message} (Make sure the storage bucket '${bucketName}' exists in your Supabase project)` }
  }

  // Get URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName)

  // Generate update payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: any = {}
  if (fileType === "logo") updatePayload.logo_url = publicUrl
  else if (fileType === "cover") updatePayload.cover_url = publicUrl
  else if (fileType === "license") updatePayload.trade_license_url = publicUrl

  // Re-fetch parameters for completion score update
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hours = parlour.opening_hours as any
  const hasHours = !!(hours && typeof hours === 'object' && Object.keys(hours).length > 0)
  const hasPayment = !!(parlour.bank_account || parlour.bkash_number || parlour.nagad_number)

  const completionScore = await calculateSellerCompletion({
    logoUrl: fileType === "logo" ? publicUrl : parlour.logo_url || undefined,
    coverUrl: fileType === "cover" ? publicUrl : parlour.cover_url || undefined,
    description: parlour.description || undefined,
    address: parlour.address || parlour.full_address || undefined,
    nidNumber: parlour.nid_number || undefined,
    tradeLicense: parlour.trade_license || undefined,
    hasOpeningHours: hasHours,
    hasPaymentInfo: hasPayment
  })

  updatePayload.profile_completion = completionScore
  updatePayload.is_booking_ready = completionScore >= 30

  const { error: updateErr } = await supabase
    .from("parlours")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updatePayload as any)
    .eq("id", parlour.id)

  if (updateErr) {
    console.error("Error updating parlour after file upload:", updateErr)
    return { success: false, error: updateErr.message }
  }

  // NO revalidatePath calls — they trigger DYNAMIC_SERVER_USAGE errors
  return { success: true, publicUrl, completionScore }
}
