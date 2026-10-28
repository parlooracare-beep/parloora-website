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

  // 1. Parlour URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parlourUrls = parlours.map((parlour: any) => ({
    url: `${baseUrl}/parlours/${parlour.username || parlour.id}`,
    lastModified: parlour.updated_at ? new Date(parlour.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // 2. Product URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // 3. Blog URLs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogUrls = blogPosts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // 4. Division URLs (All 8 divisions)
  const divisionUrls = getAllDivisions().map((div) => ({
    url: `${baseUrl}/locations/${div.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

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
      activeDistrictUrls.push({
        url: `${baseUrl}/locations/${d.slug}`,
        lastModified: article?.lastUpdated ? new Date(article.lastUpdated) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })

      // Category pages for active districts
      for (const cat of allCategories) {
        activeDistrictUrls.push({
          url: `${baseUrl}/locations/${d.slug}/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })
      }
    }
  }

  // 6. Static Main Pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parlours`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  return [
    ...staticUrls,
    ...divisionUrls,
    ...activeDistrictUrls,
    ...parlourUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
