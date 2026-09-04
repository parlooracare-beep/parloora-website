"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function calculateProfileCompletion(profile: {
  displayName?: string
  phone?: string
  email?: string
  avatarUrl?: string
  gender?: string
  dob?: string
  location?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beautyPreferences?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emergencyContact?: any
}) {
  let score = 0
  if (profile.displayName?.trim()) score += 15
  if (profile.phone?.trim()) score += 15
  if (profile.email && !profile.email.endsWith("@parloora.com")) score += 10
  if (profile.avatarUrl?.trim()) score += 15
  if (profile.gender?.trim()) score += 10
  if (profile.dob?.trim() || profile.dob) score += 10
  if (profile.location?.trim()) score += 10
  if (Array.isArray(profile.beautyPreferences) && profile.beautyPreferences.length > 0) score += 10
  if (profile.emergencyContact?.name?.trim() && profile.emergencyContact?.phone?.trim()) score += 5
  return Math.min(score, 100)
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Fetch full details including preferences from the public users table
  const { data: profile } = await supabase
    .from("users")
    .select("email_notifications, sms_notifications, role, gender, dob, location, preferred_language, beauty_preferences, favorite_services, emergency_contact, profile_completion, avatar_url")
    .eq("id", user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any

  return {
    id: user.id,
    email: user.email,
    displayName: profile?.display_name || user.user_metadata?.display_name || "",
    phone: profile?.phone || user.user_metadata?.phone || "",
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || "",
    emailNotifications: profile?.email_notifications !== false,
    smsNotifications: profile?.sms_notifications !== false,
    role: profile?.role || "customer",
    gender: profile?.gender || "",
    dob: profile?.dob || "",
    location: profile?.location || "",
    preferredLanguage: profile?.preferred_language || "en",
    beautyPreferences: profile?.beauty_preferences || [],
    favoriteServices: profile?.favorite_services || [],
    emergencyContact: profile?.emergency_contact || { name: "", phone: "", relation: "" },
    profileCompletion: profile?.profile_completion || 0
  }
}

export async function updateCustomerProfile(data: {
  displayName?: string
  phone?: string
  gender?: string
  dob?: string
  location?: string
  preferredLanguage?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beautyPreferences?: any
  favoriteServices?: string[]
  emergencyContact?: { name: string; phone: string; relation: string }
}) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { success: false, error: "Unauthorized" }
  }

  // Clean phone number
  const cleanPhone = data.phone?.trim().replace(/[\s-]/g, "") || ""

  // Update auth user metadata for basic fields
  if (data.displayName || cleanPhone) {
    const { error: authUpdateErr } = await supabase.auth.updateUser({
      data: {
        display_name: data.displayName,
        phone: cleanPhone,
      }
    })
    if (authUpdateErr) {
      return { success: false, error: authUpdateErr.message }
    }
  }

  // Fetch current profile to compute new completion score
  const { data: currentProfile } = await supabase
    .from("users")
    .select("avatar_url, email")
    .eq("id", user.id)
    .single()

  // Calculate completion percentage
  const completionScore = await calculateProfileCompletion({
    displayName: data.displayName,
    phone: cleanPhone,
    email: currentProfile?.email || user.email,
    avatarUrl: currentProfile?.avatar_url || undefined,
    gender: data.gender,
    dob: data.dob,
    location: data.location,
    beautyPreferences: data.beautyPreferences,
    emergencyContact: data.emergencyContact
  })

  // Update public.users
  const { error: updateErr } = await supabase
    .from("users")
    .update({
      display_name: data.displayName || null,
      phone: cleanPhone || null,
      gender: data.gender || null,
      dob: data.dob || null,
      location: data.location || null,
      preferred_language: data.preferredLanguage || 'en',
      beauty_preferences: data.beautyPreferences || [],
      favorite_services: data.favoriteServices || [],
      emergency_contact: data.emergencyContact || {},
      profile_completion: completionScore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", user.id)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  revalidatePath("/")
  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true, completionScore }
}

export async function updateNotificationPrefs(data: {
  emailNotifications: boolean
  smsNotifications: boolean
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error: updateErr } = await supabase
    .from("users")
    .update({
      email_notifications: data.emailNotifications,
      sms_notifications: data.smsNotifications,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", user.id)

  if (updateErr) {
    return { success: false, error: updateErr.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const file = formData.get("file") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  // Extract file extension and construct unique filename
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${user.id}.${ext}`

  // Convert File to ArrayBuffer then Buffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to avatars bucket (overwrite if exists)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadErr) {
    console.error("Error uploading avatar to storage:", uploadErr)
    return { success: false, error: uploadErr.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName)

  // Update auth metadata
  const { error: authUpdateErr } = await supabase.auth.updateUser({
    data: {
      avatar_url: publicUrl
    }
  })

  if (authUpdateErr) {
    console.error("Error updating auth user metadata:", authUpdateErr)
    return { success: false, error: authUpdateErr.message }
  }

  // Fetch current user details for completion score recalculation
  const { data: currentProfile } = await supabase
    .from("users")
    .select("display_name, phone, email, gender, dob, location, beauty_preferences, emergency_contact")
    .eq("id", user.id)
    .single()

  const completionScore = await calculateProfileCompletion({
    displayName: currentProfile?.display_name || undefined,
    phone: currentProfile?.phone || undefined,
    email: currentProfile?.email || user.email,
    avatarUrl: publicUrl,
    gender: currentProfile?.gender || undefined,
    dob: currentProfile?.dob || undefined,
    location: currentProfile?.location || undefined,
    beautyPreferences: currentProfile?.beauty_preferences || undefined,
    emergencyContact: currentProfile?.emergency_contact || undefined
  })

  // Sync with public.users table
  const { error: publicUpdateErr } = await supabase
    .from("users")
    .update({
      avatar_url: publicUrl,
      profile_completion: completionScore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", user.id)

  if (publicUpdateErr) {
    console.error("Error syncing avatar to public users table:", publicUpdateErr)
  }

  revalidatePath("/")
  revalidatePath("/profile")
  revalidatePath("/dashboard")
  
  return { success: true, avatarUrl: publicUrl, completionScore }
}
