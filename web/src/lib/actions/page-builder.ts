"use server"

import { createClient } from "@/lib/supabase/server"
import { logActivity } from "./site"

export interface PageSection {
  id: string
  name: string
  visible: boolean
}

const DEFAULT_SECTIONS: PageSection[] = [
  { id: "hero", name: "Hero Banner", visible: true },
  { id: "recommended", name: "Recommended Parlours", visible: true },
  { id: "near-you", name: "Near You Map Section", visible: true },
  { id: "categories", name: "Service Categories", visible: true },
  { id: "steps", name: "How It Works Steps", visible: true },
  { id: "shop", name: "Shop Highlights", visible: true },
  { id: "cta", name: "CTA Banner", visible: true }
]

export async function getHomepageSections(): Promise<PageSection[]> {
  try {
    const supabase = await createClient()
    const { data, error } = (await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("homepage_content" as any)
      .select("*")
      .eq("id", "sections_layout")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single()) as any

    if (error || !data || !data.hero_title) {
      return DEFAULT_SECTIONS
    }

    const parsed = JSON.parse(data.hero_title)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return DEFAULT_SECTIONS
  } catch (err) {
    console.error("Error reading homepage sections layout:", err)
    return DEFAULT_SECTIONS
  }
}

export async function updateHomepageSections(sections: PageSection[]) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = profile?.role?.toLowerCase()
    if (userRole !== "admin" && userRole !== "editor") {
      return { success: false, error: "Unauthorized. Admin or Editor role required." }
    }

    const serialized = JSON.stringify(sections)

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("homepage_content" as any)
      .upsert({
        id: "sections_layout",
        hero_title: serialized,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Error saving homepage sections layout:", error)
      return { success: false, error: error.message }
    }

    await logActivity("PAGE_BUILDER_UPDATE", `Updated homepage section sequencing and visibility`)
    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Exception in updateHomepageSections:", err)
    return { success: false, error: err.message || "Failed to save layout" }
  }
}
