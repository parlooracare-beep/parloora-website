"use server"

import { createPublicClient } from "@/lib/supabase/public"
import { unstable_cache } from "next/cache"
import {
  getDistrictBySlug,
  getDivisionBySlug,
  getAllDistricts,
  District,
  getServiceCategorySEOBySlug,
} from "@/lib/locations/data"
import { Database } from "@/types/supabase"

export type Parlour = Database["public"]["Tables"]["parlours"]["Row"]
export type Service = Database["public"]["Tables"]["services"]["Row"]

export interface DistrictSEOData {
  district: District
  parlours: (Parlour & { servicesCount?: number; sampleServices?: Service[] })[]
  totalParlours: number
  hasActiveParlours: boolean
  matchedCategory?: {
    name: string
    bnName: string
    slug: string
  }
}

/**
 * Fetch real parlours for a given district slug and optional service category.
 * Uses aliases to safely match database records (e.g. "Moulvibazar ", "Sylhet ").
 */
export async function getDistrictSEOData(
  districtSlug: string,
  categorySlug?: string
): Promise<DistrictSEOData | null> {
  const district = getDistrictBySlug(districtSlug)
  if (!district) return null

  try {
    const supabase = createPublicClient()

    // Build match conditions for city: district name and aliases
    const searchTerms = [district.name, ...district.aliases]
      .map((t) => t.trim().toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i)

    // Query active parlours
    const { data: rawParlours, error } = await supabase
      .from("parlours")
      .select("*, services(*)")
      .in("status", ["Active", "active"])
      .order("featured", { ascending: false })

    if (error || !rawParlours) {
      console.error("Error querying parlours for district:", error)
      return {
        district,
        parlours: [],
        totalParlours: 0,
        hasActiveParlours: false,
      }
    }

    // Filter parlours belonging to this district (handling whitespace and casing)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let matchingParlours = rawParlours.filter((p: any) => {
      const city = (p.city || "").trim().toLowerCase()
      const address = (p.address || "").toLowerCase()
      return searchTerms.some((term) => city === term || address.includes(term))
    })

    const category = categorySlug ? getServiceCategorySEOBySlug(categorySlug) : undefined

    // If a category is requested, filter parlours that offer matching services
    if (category) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matchingParlours = matchingParlours.filter((p: any) => {
        const services = p.services || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return services.some((s: any) => {
          const sName = (s.name || "").toLowerCase()
          const sCat = (s.category || "").toLowerCase()
          const sDesc = (s.description || "").toLowerCase()
          return category.keywords.some(
            (kw) => sName.includes(kw) || sCat.includes(kw) || sDesc.includes(kw)
          )
        })
      })
    }

    // Format results with service counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = matchingParlours.map((p: any) => ({
      ...p,
      servicesCount: Array.isArray(p.services) ? p.services.length : 0,
      sampleServices: Array.isArray(p.services) ? p.services.slice(0, 3) : [],
    }))

    return {
      district,
      parlours: formatted,
      totalParlours: formatted.length,
      hasActiveParlours: formatted.length > 0,
      matchedCategory: category
        ? {
            name: category.name,
            bnName: category.bnName,
            slug: category.slug,
          }
        : undefined,
    }
  } catch (err) {
    console.error("Exception fetching district SEO data:", err)
    return {
      district,
      parlours: [],
      totalParlours: 0,
      hasActiveParlours: false,
    }
  }
}

/**
 * Fetch real parlours for an entire division.
 */
export async function getDivisionSEOData(divisionSlug: string) {
  const division = getDivisionBySlug(divisionSlug)
  if (!division) return null

  try {
    const supabase = createPublicClient()
    const allDistricts = getAllDistricts().filter((d) => d.divisionId === division.id)
    const districtTerms = allDistricts
      .flatMap((d) => [d.name, ...d.aliases])
      .map((t) => t.trim().toLowerCase())

    const { data: rawParlours, error } = await supabase
      .from("parlours")
      .select("*, services(*)")
      .in("status", ["Active", "active"])
      .order("featured", { ascending: false })

    if (error || !rawParlours) {
      return {
        division,
        districts: allDistricts,
        parlours: [],
        totalParlours: 0,
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchingParlours = rawParlours.filter((p: any) => {
      const city = (p.city || "").trim().toLowerCase()
      const address = (p.address || "").toLowerCase()
      return districtTerms.some((term) => city === term || address.includes(term))
    })

    return {
      division,
      districts: allDistricts,
      parlours: matchingParlours,
      totalParlours: matchingParlours.length,
    }
  } catch (err) {
    console.error("Exception in getDivisionSEOData:", err)
    return null
  }
}

/**
 * Fast cached directory metrics for all 64 districts.
 * Returns map of districtId -> activeParlourCount.
 */
export const getLocationDirectoryMetrics = unstable_cache(
  async (): Promise<Record<string, number>> => {
    try {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        .from("parlours")
        .select("city, address")
        .in("status", ["Active", "active"])

      if (error || !data) return {}

      const districts = getAllDistricts()
      const counts: Record<string, number> = {}

      for (const district of districts) {
        const terms = [district.name, ...district.aliases].map((t) => t.trim().toLowerCase())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchCount = data.filter((row: any) => {
          const city = (row.city || "").trim().toLowerCase()
          const address = (row.address || "").toLowerCase()
          return terms.some((term) => city === term || address.includes(term))
        }).length
        counts[district.id] = matchCount
      }

      return counts
    } catch (e) {
      console.error("Error computing location metrics:", e)
      return {}
    }
  },
  ["location_directory_metrics"],
  { revalidate: 300, tags: ["locations_metrics", "parlours"] }
)
