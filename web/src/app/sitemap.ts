import { MetadataRoute } from 'next'
import { getParlours } from '@/lib/actions/parlours'
import { getProducts } from '@/lib/actions/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://parloora.com'

  const { data: parlours } = await getParlours()
  const products = await getProducts()

  const parlourUrls = parlours.map((parlour) => ({
    url: `${baseUrl}/parlours/${parlour.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/parlours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...parlourUrls,
    ...productUrls,
  ]
}
