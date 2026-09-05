"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function signUpAction(formData: {
  email?: string
  password: string
  fullName: string
  phone: string
  role: "Customer" | "Seller"
  businessName?: string
  district?: string
}) {
  console.log("signUpAction called for:", formData.email || formData.phone)
  const { email, password, fullName, phone, role, businessName, district } = formData
  const supabase = await createClient()

  // Clean phone number
  const cleanPhone = phone.trim().replace(/[\s-]/g, "")
  if (!cleanPhone) {
    return { success: false, error: "Mobile number is required" }
  }

  // Check unique phone number in public.users
  const { data: existingPhone } = await supabase
    .from("users")
    .select("id")
    .eq("phone", cleanPhone)
    .maybeSingle()

  if (existingPhone) {
    return { success: false, error: "This mobile number is already registered" }
  }

  // If email is not provided (optional for customers), generate a placeholder email
  const finalEmail = email?.trim() || `${cleanPhone}@parloora.com`

  // Construct redirect URL
  const headersList = await headers()
  const origin = headersList.get("origin") || ""

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error } = await supabase.auth.signUp({
    email: finalEmail,
    password,
    options: {
      data: {
        display_name: fullName,
        phone_number: cleanPhone,
        role: role.toLowerCase(),
        business_name: businessName,
        district: district
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error)
    return { success: false, error: error.message }
  }

  // Profile creation & parlour stub creation is handled by the database trigger (sync_users.sql / schema_profile_extension.sql)
  // which automatically inserts records into public.users and public.parlours on auth.signUp

  try {
    const { sendWelcomeEmail } = await import("@/lib/email")
    sendWelcomeEmail(finalEmail, fullName).catch(console.error)
  } catch (err) {
    console.error("Failed to import or send welcome email:", err)
  }

  return { success: true, email: finalEmail }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signInAction(formData: any) {
  console.log("signInAction called for:", formData.email)
  const { password } = formData
  let { email } = formData
  const supabase = await createClient()

  // Resolve phone number to email if it looks like a phone number
  const isPhone = /^[+0-9\s-]{8,15}$/.test(email.trim())
  if (isPhone) {
    const cleanPhone = email.trim().replace(/[\s-]/g, "")
    const { data: userProfile } = await supabase
      .from("users")
      .select("email")
      .eq("phone", cleanPhone)
      .maybeSingle()
    
    if (userProfile?.email) {
      email = userProfile.email
    } else {
      return { success: false, error: "No account found with this phone number" }
    }
  }

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = profile?.role || "customer"
    // Normalize role to return capitalized matching routing expectations
    const capitalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1)

    return { 
      success: true, 
      role: capitalizedRole
    }
  }

  return { success: true, role: "Customer" }
}


