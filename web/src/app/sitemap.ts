import { MetadataRoute } from "next"
import { getParlours } from "@/lib/actions/parlours"
import { getProducts } from "@/lib/actions/products"
import { getPublishedBlogPosts } from "@/lib/actions/blog"
import { getSiteUrl } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parlours: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let blogPosts: any[] = []

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parlourUrls = parlours.map((parlour: any) => ({
    url: `${baseUrl}/parlours/${parlour.username || parlour.id}`,
    lastModified: parlour.updated_at ? new Date(parlour.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogUrls = blogPosts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
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

  return [...staticUrls, ...parlourUrls, ...productUrls, ...blogUrls]
}
