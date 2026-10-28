"use server"

import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { revalidateTag, revalidatePath, unstable_cache } from "next/cache"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from "@/types/supabase"

export interface HomepageContent {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_pill_text: string
  shop_title: string
  shop_subtitle: string
  cta_title: string
  cta_subtitle: string
  updated_at: string
}

export interface FooterSettings {
  id: string
  about_text: string
  address: string
  phone: string
  email: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  youtube_url: string
  linkedin_url: string
  updated_at: string
}

export async function getHomepageContent() {
  const supabase = await createClient()
  
  console.log("getHomepageContent: Fetching...")
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("homepage_content" as any)
    .select("*")
    .eq("id", "default")
    .single()
  console.log("getHomepageContent: Done.", { error })

  if (error) {
    console.error("Error fetching homepage content:", error)
    return null
  }

  return (data as unknown) as HomepageContent
}

export async function getServiceCategories() {
  const supabase = await createClient()
  
  const [{ data: categories, error }, { data: parlours }] = await Promise.all([
    supabase.from("service_categories").select("*").eq("is_active", true),
    supabase.from("parlours").select("type")
  ])

  if (error) {
    console.error("Error fetching service categories:", error)
    return []
  }

  // Count parlours per category by matching type keywords
  const parlourTypes = parlours || []

  return (categories || []).map(cat => {
    const catLower = cat.name.toLowerCase()
    const count = parlourTypes.filter(p => {
      const typeLower = (p.type || "").toLowerCase()
      // Match if the parlour type contains any keyword from the category name
      const keywords = catLower.split(/[\s&,]+/).filter(k => k.length > 2)
      return keywords.some(kw => typeLower.includes(kw)) || typeLower.includes(catLower)
    }).length
    return { ...cat, parlour_count: count }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateHomepageContent(data: any) {
  const supabase = await createClient()
  
  // Check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "Admin") {
    return { success: false, error: "Not authorized" }
  }

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("homepage_content" as any)
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", "default")

  if (error) {
    console.error("Error updating homepage content:", error)
    return { success: false, error: error.message }
  }

  revalidateTag("homepage_content", "max")
  revalidatePath("/")
  return { success: true }
}

export const getFooterSettings = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("footer_settings" as any)
        .select("*")
        .eq("id", "default")
        .single()

      if (error) {
        return null
      }

      return (data as unknown) as FooterSettings
    } catch {
      return null
    }
  },
  ["site_footer_settings"],
  { revalidate: 3600, tags: ["footer_settings"] }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFooterSettings(data: any) {
  const supabase = await createClient()
  
  // Check if admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "Admin") {
    return { success: false, error: "Not authorized" }
  }

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("footer_settings" as any)
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", "default")

  if (error) {
    console.error("Error updating footer settings:", error)
    return { success: false, error: error.message }
  }

  revalidateTag("footer_settings", "max")
  revalidatePath("/")
  return { success: true }
}

export interface ThemeSettings {
  id: string
  primary_color: string
  secondary_color: string
  font_family: string
  is_dark_mode: boolean
  border_radius: string
  glassmorphism_enabled: boolean
  animations_enabled: boolean
  updated_at: string
}

const DEFAULT_THEME: ThemeSettings = {
  id: "default",
  primary_color: "#4B1E6D",
  secondary_color: "#E6B7A9",
  font_family: "Inter",
  is_dark_mode: false,
  border_radius: "0.75rem",
  glassmorphism_enabled: true,
  animations_enabled: true,
  updated_at: new Date().toISOString()
}

export const getThemeSettings = unstable_cache(
  async (): Promise<ThemeSettings> => {
    try {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("theme_settings" as any)
        .select("*")
        .eq("id", "default")
        .single()

      if (error) {
        return DEFAULT_THEME
      }

      return (data as unknown) as ThemeSettings
    } catch {
      return DEFAULT_THEME
    }
  },
  ["site_theme_settings"],
  { revalidate: 3600, tags: ["theme_settings"] }
)

export async function updateThemeSettings(data: Partial<ThemeSettings>) {
  try {
    const supabase = await createClient()
    
    // Check if admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role?.toLowerCase() !== "admin") {
      return { success: false, error: "Not authorized. Admin role required." }
    }

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("theme_settings" as any)
      .upsert({
        id: "default",
        ...data,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error updating theme settings:", error)
      return { success: false, error: error.message }
    }

    revalidateTag("theme_settings", "max")
    revalidatePath("/")

    // Proactively log action
    await logActivity("THEME_UPDATE", `Admin customized system appearance: primary_color=${data.primary_color}`)

    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Exception in updateThemeSettings:", err)
    return { success: false, error: err.message || "Failed to save theme settings" }
  }
}

// Global Activity Logging Helper
export async function logActivity(actionType: string, description: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("activity_logs" as any)
      .insert({
        user_id: user?.id || null,
        action_type: actionType,
        description,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.warn("Failed to write to activity_logs table:", error.message)
    }
  } catch (e) {
    console.warn("Exception while logging activity:", e)
  }
}

