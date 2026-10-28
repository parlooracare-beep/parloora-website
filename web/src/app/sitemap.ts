import { MetadataRoute } from "next"
import { getParlours } from "@/lib/actions/parlours"
import { getProducts } from "@/lib/actions/products"
import { getPublishedBlogPosts } from "@/lib/actions/blog"
import { getSiteUrl } from "@/lib/site-url"
import {
  getAllDivisions,
  getAllDistricts,
  getAllServiceCategoriesSEO,
} from "@/lib/locations/data"
import { getAllDistrictSEOArticles } from "@/lib/locations/content"
import { getLocationDirectoryMetrics } from "@/lib/actions/locations"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parlours: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let blogPosts: any[] = []
  let districtCounts: Record<string, number> = {}

  try {
    const { data } = await getParlours()
    parlours = data || []
  } catch (e) {
    console.warn("Failed to load parlours for sitemap:", e)
  }

  try {
    products = (await getProducts()) || []
  } catch (e) {
    console.warn("Failed to load products for sitemap:", e)
  }

  try {
    blogPosts = (await getPublishedBlogPosts(50)) || []
  } catch (e) {
    console.warn("Failed to load blog posts for sitemap:", e)
  }

  try {
    districtCounts = await getLocationDirectoryMetrics()
  } catch (e) {
    console.warn("Failed to load district metrics for sitemap:", e)
  }

  // Helper for generating bilingual language alternates
  const makeAlternates = (path: string) => ({
    languages: {
      en: `${baseUrl}/en${path === "/" ? "" : path}`,
      bn: `${baseUrl}/bn${path === "/" ? "" : path}`,
    },
  })

  // 1. Parlour URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parlourUrls = parlours.map((parlour: any) => {
    const path = `/parlours/${parlour.username || parlour.id}`
    return {
      url: `${baseUrl}${path}`,
      lastModified: parlour.updated_at ? new Date(parlour.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: makeAlternates(path),
    }
  })

  // 2. Product URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productUrls = products.map((product: any) => {
    const path = `/shop/${product.id}`
    return {
      url: `${baseUrl}${path}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: makeAlternates(path),
    }
  })

  // 3. Blog URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogUrls = blogPosts.map((post: any) => {
    const path = `/blog/${post.slug}`
    return {
      url: `${baseUrl}${path}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: makeAlternates(path),
    }
  })

  // 4. Division URLs (All 8 divisions)
  const divisionUrls = getAllDivisions().map((div) => {
    const path = `/locations/${div.slug}`
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: makeAlternates(path),
    }
  })

  // 5. Active & Published District & Category URLs
  const allDistricts = getAllDistricts()
  const allCategories = getAllServiceCategoriesSEO()
  const allArticles = getAllDistrictSEOArticles()
  const articleMap = new Map<string, (typeof allArticles)[0]>()
  allArticles.forEach((art) => articleMap.set(art.slug.toLowerCase(), art))

  const activeDistrictUrls: MetadataRoute.Sitemap = []

  for (const d of allDistricts) {
    const hasParlours = (districtCounts[d.id] || 0) > 0
    const article = articleMap.get(d.slug.toLowerCase())
    const isEligible = (article?.status === "published" && (hasParlours || article.indexStatus)) || hasParlours

    if (isEligible) {
      // Main district page
      const districtPath = `/locations/${d.slug}`
      activeDistrictUrls.push({
        url: `${baseUrl}${districtPath}`,
        lastModified: article?.lastUpdated ? new Date(article.lastUpdated) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
        alternates: makeAlternates(districtPath),
      })

      // Category pages for active districts
      for (const cat of allCategories) {
        const catPath = `/locations/${d.slug}/${cat.slug}`
        activeDistrictUrls.push({
          url: `${baseUrl}${catPath}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: makeAlternates(catPath),
        })
      }
    }
  }

  // 6. Static Main Pages
  const staticPaths: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/locations", priority: 0.9, changeFrequency: "daily" },
    { path: "/parlours", priority: 0.9, changeFrequency: "daily" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
    { path: "/cookies", priority: 0.4, changeFrequency: "monthly" },
  ]

  const staticUrls: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: makeAlternates(path),
  }))

  return [
    ...staticUrls,
    ...divisionUrls,
    ...activeDistrictUrls,
    ...parlourUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
