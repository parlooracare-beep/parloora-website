"use server"

import { createClient } from "@/lib/supabase/server"
import { logActivity } from "./site"

// ─── Public read-only actions (no auth required) ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPublishedBlogPosts(limit = 20): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .select(`
      id, title, slug, excerpt, cover_image, category, tags,
      created_at, published_at,
      users:author_id ( display_name, email )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching published blog posts:", error)
    return []
  }
  return data ?? []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBlogPostBySlug(slug: string): Promise<any | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .select(`
      *,
      users:author_id ( display_name, email, avatar_url )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error) {
    console.error("Error fetching blog post by slug:", error)
    return null
  }
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRelatedBlogPosts(currentSlug: string, category: string, limit = 3): Promise<any[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .select("id, title, slug, excerpt, cover_image, category, published_at")
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

export async function getAdminBlogPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .select(`
      *,
      users:author_id (
        id,
        display_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }

  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createBlogPost(payload: any) {
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

  // Auto-generate slug if not provided or empty
  let slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
  if (!slug) slug = `post-${Date.now()}`

  const insertData = {
    ...payload,
    slug,
    author_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data, error } = (await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .insert(insertData)
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single()) as any

  if (error) {
    console.error("Error creating blog post:", error)
    return { success: false, error: error.message }
  }

  await logActivity("BLOG_CREATE", `Created blog post: "${payload.title}"`)
  return { success: true, data }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateBlogPost(id: string, payload: any) {
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

  const { data, error } = (await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single()) as any

  if (error) {
    console.error("Error updating blog post:", error)
    return { success: false, error: error.message }
  }

  await logActivity("BLOG_UPDATE", `Updated blog post: "${payload.title || data.title}"`)
  return { success: true, data }
}

export async function deleteBlogPost(id: string) {
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

  // Get title for logging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post } = (await supabase.from("blog_posts" as any).select("title").eq("id", id).single()) as any

  const { error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("blog_posts" as any)
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting blog post:", error)
    return { success: false, error: error.message }
  }

  await logActivity("BLOG_DELETE", `Deleted blog post: "${post?.title || id}"`)
  return { success: true }
}
