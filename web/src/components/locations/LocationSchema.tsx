import React from "react"
import { getSiteUrl } from "@/lib/site-url"
import { District, ServiceCategorySEO } from "@/lib/locations/data"
import { Parlour } from "@/lib/actions/locations"

interface LocationSchemaProps {
  district?: District
  divisionName?: string
  category?: ServiceCategorySEO
  parlours?: Parlour[]
  faqs?: { q: string; a: string }[]
  breadcrumbs: { name: string; href: string }[]
}

export function LocationSchema({
  district,
  category,
  parlours = [],
  faqs = [],
  breadcrumbs,
}: LocationSchemaProps) {
  const siteUrl = getSiteUrl()

  // 1. BreadcrumbList Schema
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: `${siteUrl}/locations`,
      },
      ...breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 3,
        name: b.name,
        item: b.href.startsWith("http") ? b.href : `${siteUrl}${b.href}`,
      })),
    ],
  }

  // 2. ItemList of verified parlours (if parlours exist)
  const itemListSchema =
    parlours.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: category && district
            ? `${category.name} in ${district.name}`
            : district
            ? `Beauty Parlours in ${district.name}`
            : "Beauty Parlours and Salons in Bangladesh",
          numberOfItems: parlours.length,
          itemListElement: parlours.map((p, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "BeautySalon",
              name: p.name,
              url: `${siteUrl}/parlours/${p.username || p.id}`,
              address: {
                "@type": "PostalAddress",
                streetAddress: p.address || p.city || "Bangladesh",
                addressLocality: p.city || (district ? district.name : "Bangladesh"),
                addressCountry: "BD",
              },
              telephone: p.phone || undefined,
              priceRange: "৳৳",
              ...(p.rating && p.rating > 0
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: p.rating,
                      reviewCount: (p as { reviews_count?: number }).reviews_count || p.total_bookings || 1,
                    },
                  }
                : {}),
            },
          })),
        }
      : null

  // 3. FAQPage Schema
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
