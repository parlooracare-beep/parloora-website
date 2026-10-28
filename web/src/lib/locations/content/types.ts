/**
 * Parloora District SEO Article Interface
 * Standardized 1,000-word content structure across all 64 districts of Bangladesh
 */

export interface FAQItem {
  q: string
  a: string
}

export type DistrictArticleStatus = "published" | "review-ready" | "draft" | "noindex"

export interface DistrictSEOArticle {
  districtId: string
  districtName: string
  bnName: string
  slug: string
  divisionId: string
  divisionName: string
  canonicalUrl: string
  primaryKeyword: string
  secondaryKeywords: string[]
  longTailKeywords: string[]
  seoTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  featuredImageAlt: string
  status: DistrictArticleStatus
  indexStatus: boolean
  wordCount: number
  lastUpdated: string
  // Outline Sections (Sections 1-9)
  h1: string
  section1_intro: string
  section2_discovery: string
  section3_types: string
  section4_howToChoose: string
  section5_booking: string
  section6_localDiscovery: string
  section7_tips: string
  section8_faqs: FAQItem[]
  section9_cta: string
}

export function calculateArticleWordCount(article: Partial<DistrictSEOArticle>): number {
  const textBlocks = [
    article.h1,
    article.section1_intro,
    article.section2_discovery,
    article.section3_types,
    article.section4_howToChoose,
    article.section5_booking,
    article.section6_localDiscovery,
    article.section7_tips,
    article.section9_cta,
    ...(article.section8_faqs || []).flatMap((f) => [f.q, f.a]),
  ].filter(Boolean)

  const combined = textBlocks.join(" ")
  // Split on whitespace to count words
  const words = combined.trim().split(/\s+/)
  return words.filter((w) => w.length > 0).length
}
