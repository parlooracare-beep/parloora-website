import { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/blog/",
          "/parlours",
          "/parlours/",
          "/shop",
          "/shop/",
          "/about",
          "/privacy",
          "/terms",
          "/cookies",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/seller",
          "/seller/",
          "/dashboard",
          "/dashboard/",
          "/profile",
          "/profile/",
          "/bookings",
          "/bookings/",
          "/notifications",
          "/notifications/",
          "/wishlist",
          "/wishlist/",
          "/checkout",
          "/checkout/",
          "/orders",
          "/orders/",
          "/api/",
          "/auth/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
