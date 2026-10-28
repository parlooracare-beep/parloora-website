"use server"

import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { revalidatePath } from "next/cache"
import {
  DistrictSEOArticle,
  calculateArticleWordCount,
  getDistrictSEOArticle,
  getAllDistrictSEOArticles,
} from "@/lib/locations/content"
import { logActivity } from "./site"

export interface DistrictAdminMetrics {
  totalDistricts: number
  publishedCount: number
  reviewReadyCount: number
  draftCount: number
  noindexCount: number
  totalWordCount: number
  averageWordCount: number
  healthScore: number
}

export interface AdminDistrictListItem extends DistrictSEOArticle {
  hasMissingMetadata: boolean
  isContentUnique: boolean
}

/**
 * Fetch a single district SEO article by slug.
 * Checks Supabase database first; falls back to curated static dataset.
 */
export async function getDistrictArticleData(
  slug: string
): Promise<DistrictSEOArticle | null> {
  const fallback = getDistrictSEOArticle(slug)

  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from("district_seo_pages" as any)
      .select("*")
      .eq("slug", slug.toLowerCase())
      .single()

    if (!error && data) {
      // Map database row to DistrictSEOArticle
      const row = data as any
      const article: DistrictSEOArticle = {
        districtId: row.id,
        districtName: row.district_name,
        bnName: row.bn_name,
        slug: row.slug,
        divisionId: row.division_id,
        divisionName: row.division_name,
        canonicalUrl: row.canonical_url,
        primaryKeyword: row.primary_keyword,
        secondaryKeywords: row.secondary_keywords || [],
        longTailKeywords: row.long_tail_keywords || [],
        seoTitle: row.seo_title,
        metaDescription: row.meta_description,
        ogTitle: row.og_title || row.seo_title,
        ogDescription: row.og_description || row.meta_description,
        featuredImageAlt: row.featured_image_alt || "",
        status: row.status,
        indexStatus: row.index_status ?? (row.status === "published"),
        wordCount: row.word_count || calculateArticleWordCount(row),
        lastUpdated: row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : fallback?.lastUpdated || "2026-10-28",
        h1: row.h1,
        section1_intro: row.section1_intro,
        section2_discovery: row.section2_discovery,
        section3_types: row.section3_types,
        section4_howToChoose: row.section4_how_to_choose,
        section5_booking: row.section5_booking,
        section6_localDiscovery: row.section6_local_discovery,
        section7_tips: row.section7_tips,
        section8_faqs: Array.isArray(row.section8_faqs) ? row.section8_faqs : [],
        section9_cta: row.section9_cta,
      }
      return article
    }
  } catch (err) {
    console.warn(`Database query for district SEO page "${slug}" skipped, using verified fallback:`, err)
  }

  return fallback || null
}

/**
 * Fetch all 64 district SEO articles for the Super Admin CMS.
 * Merges Supabase overrides with default static drafts.
 */
export async function getAllDistrictArticlesAdmin(): Promise<{
  articles: AdminDistrictListItem[]
  metrics: DistrictAdminMetrics
}> {
  const defaults = getAllDistrictSEOArticles()
  let merged: DistrictSEOArticle[] = [...defaults]

  try {
    const supabase = createPublicClient()
    const { data: dbRows, error } = await supabase
      .from("district_seo_pages" as any)
      .select("*")

    if (!error && dbRows && dbRows.length > 0) {
      const dbMap = new Map<string, any>()
      dbRows.forEach((r: any) => dbMap.set(r.slug.toLowerCase(), r))

      merged = defaults.map((def) => {
        const row = dbMap.get(def.slug.toLowerCase())
        if (!row) return def

        return {
          ...def,
          districtName: row.district_name || def.districtName,
          primaryKeyword: row.primary_keyword || def.primaryKeyword,
          secondaryKeywords: row.secondary_keywords || def.secondaryKeywords,
          longTailKeywords: row.long_tail_keywords || def.longTailKeywords,
          seoTitle: row.seo_title || def.seoTitle,
          metaDescription: row.meta_description || def.metaDescription,
          ogTitle: row.og_title || def.ogTitle,
          ogDescription: row.og_description || def.ogDescription,
          featuredImageAlt: row.featured_image_alt || def.featuredImageAlt,
          status: row.status || def.status,
          indexStatus: row.index_status ?? def.indexStatus,
          wordCount: row.word_count || calculateArticleWordCount(row) || def.wordCount,
          lastUpdated: row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : def.lastUpdated,
          h1: row.h1 || def.h1,
          section1_intro: row.section1_intro || def.section1_intro,
          section2_discovery: row.section2_discovery || def.section2_discovery,
          section3_types: row.section3_types || def.section3_types,
          section4_howToChoose: row.section4_how_to_choose || def.section4_howToChoose,
          section5_booking: row.section5_booking || def.section5_booking,
          section6_localDiscovery: row.section6_local_discovery || def.section6_localDiscovery,
          section7_tips: row.section7_tips || def.section7_tips,
          section8_faqs: Array.isArray(row.section8_faqs) ? row.section8_faqs : def.section8_faqs,
          section9_cta: row.section9_cta || def.section9_cta,
        }
      })
    }
  } catch (err) {
    console.warn("Could not query db district_seo_pages, using memory store:", err)
  }

  // Calculate audit flags & uniqueness
  const titleSet = new Set<string>()
  const duplicates = new Set<string>()

  merged.forEach((art) => {
    const key = art.seoTitle.toLowerCase().trim()
    if (titleSet.has(key)) {
      duplicates.add(key)
    } else {
      titleSet.add(key)
    }
  })

  let cleanMetadataCount = 0

  const items: AdminDistrictListItem[] = merged.map((art) => {
    const missingTitle = !art.seoTitle || art.seoTitle.length < 20
    const missingDesc = !art.metaDescription || art.metaDescription.length < 50
    const missingKw = !art.primaryKeyword
    const missingFaqs = !art.section8_faqs || art.section8_faqs.length === 0
    const hasMissing = missingTitle || missingDesc || missingKw || missingFaqs
    const isUnique = !duplicates.has(art.seoTitle.toLowerCase().trim())

    if (!hasMissing && isUnique) cleanMetadataCount++

    return {
      ...art,
      hasMissingMetadata: hasMissing,
      isContentUnique: isUnique,
    }
  })

  const total = items.length
  const published = items.filter((a) => a.status === "published").length
  const reviewReady = items.filter((a) => a.status === "review-ready").length
  const draft = items.filter((a) => a.status === "draft").length
  const noindex = items.filter((a) => a.status === "noindex" || !a.indexStatus).length
  const totalWords = items.reduce((acc, a) => acc + a.wordCount, 0)
  const avgWords = total > 0 ? Math.round(totalWords / total) : 0
  const healthScore = total > 0 ? Math.round((cleanMetadataCount / total) * 100) : 100

  return {
    articles: items,
    metrics: {
      totalDistricts: total,
      publishedCount: published,
      reviewReadyCount: reviewReady,
      draftCount: draft,
      noindexCount: noindex,
      totalWordCount: totalWords,
      averageWordCount: avgWords,
      healthScore,
    },
  }
}

/**
 * Update a district SEO article in the database.
 * Requires Admin or Editor authentication.
 */
export async function updateDistrictArticle(
  slug: string,
  updates: Partial<DistrictSEOArticle>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Verify user authentication & admin/editor authorization
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated. Please log in as an administrator." }
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = (profile?.role || "").toLowerCase()
    if (userRole !== "admin" && userRole !== "editor") {
      return { success: false, error: "Unauthorized. Super Admin or Editor privileges required." }
    }

    // 2. Load existing record to merge
    const existing = await getDistrictArticleData(slug)
    if (!existing) {
      return { success: false, error: `District article with slug "${slug}" not found.` }
    }

    const merged = { ...existing, ...updates }
    const calculatedWords = calculateArticleWordCount(merged)

    // 3. Upsert into Supabase database
    const payload = {
      id: merged.districtId,
      district_name: merged.districtName,
      bn_name: merged.bnName,
      slug: merged.slug.toLowerCase(),
      division_id: merged.divisionId,
      division_name: merged.divisionName,
      canonical_url: merged.canonicalUrl || `/locations/${merged.slug}`,
      primary_keyword: merged.primaryKeyword,
      secondary_keywords: merged.secondaryKeywords || [],
      long_tail_keywords: merged.longTailKeywords || [],
      seo_title: merged.seoTitle,
      meta_description: merged.metaDescription,
      og_title: merged.ogTitle || merged.seoTitle,
      og_description: merged.ogDescription || merged.metaDescription,
      featured_image_alt: merged.featuredImageAlt || "",
      status: merged.status,
      index_status: merged.status === "published",
      word_count: calculatedWords,
      h1: merged.h1,
      section1_intro: merged.section1_intro,
      section2_discovery: merged.section2_discovery,
      section3_types: merged.section3_types,
      section4_how_to_choose: merged.section4_howToChoose,
      section5_booking: merged.section5_booking,
      section6_local_discovery: merged.section6_localDiscovery,
      section7_tips: merged.section7_tips,
      section8_faqs: merged.section8_faqs || [],
      section9_cta: merged.section9_cta,
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from("district_seo_pages" as any)
      .upsert(payload, { onConflict: "slug" })

    if (upsertError) {
      console.error("Failed to update district SEO page in database:", upsertError)
      return { success: false, error: upsertError.message }
    }

    // 4. Log admin audit activity
    await logActivity(
      "UPDATE_DISTRICT_SEO",
      `Updated local SEO article for district: ${merged.districtName} (${merged.slug}), Status: ${merged.status}`
    )

    // 5. Revalidate cache
    revalidatePath(`/locations/${merged.slug}`)
    revalidatePath("/locations")
    revalidatePath("/admin/locations")
    revalidatePath("/sitemap.xml")

    return { success: true }
  } catch (err: any) {
    console.error("Exception in updateDistrictArticle:", err)
    return { success: false, error: err.message || "An unexpected error occurred." }
  }
}

/**
 * Bulk update publication status for multiple districts.
 */
export async function bulkUpdateDistrictStatus(
  slugs: string[],
  status: DistrictSEOArticle["status"]
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, updatedCount: 0, error: "Not authenticated" }
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = (profile?.role || "").toLowerCase()
    if (userRole !== "admin" && userRole !== "editor") {
      return { success: false, updatedCount: 0, error: "Unauthorized" }
    }

    let count = 0
    for (const slug of slugs) {
      const res = await updateDistrictArticle(slug, { status })
      if (res.success) count++
    }

    revalidatePath("/admin/locations")
    revalidatePath("/sitemap.xml")

    return { success: true, updatedCount: count }
  } catch (err: any) {
    return { success: false, updatedCount: 0, error: err.message }
  }
}
