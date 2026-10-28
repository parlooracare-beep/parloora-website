import { DistrictSEOArticle, calculateArticleWordCount } from "./types"
import { DHAKA_DISTRICT_ARTICLES } from "./dhaka"
import { CHATTOGRAM_DISTRICT_ARTICLES } from "./chattogram"
import { RAJSHAHI_DISTRICT_ARTICLES } from "./rajshahi"
import { KHULNA_DISTRICT_ARTICLES } from "./khulna"
import { SYLHET_DISTRICT_ARTICLES } from "./sylhet"
import { RANGPUR_DISTRICT_ARTICLES } from "./rangpur"
import { MYMENSINGH_DISTRICT_ARTICLES } from "./mymensingh"
import { BARISHAL_DISTRICT_ARTICLES } from "./barishal"

export * from "./types"

const RAW_ARTICLES: DistrictSEOArticle[] = [
  ...DHAKA_DISTRICT_ARTICLES,
  ...CHATTOGRAM_DISTRICT_ARTICLES,
  ...RAJSHAHI_DISTRICT_ARTICLES,
  ...KHULNA_DISTRICT_ARTICLES,
  ...SYLHET_DISTRICT_ARTICLES,
  ...RANGPUR_DISTRICT_ARTICLES,
  ...MYMENSINGH_DISTRICT_ARTICLES,
  ...BARISHAL_DISTRICT_ARTICLES,
]

// Ensure exact calculated word counts on all articles
export const DISTRICT_SEO_ARTICLES: DistrictSEOArticle[] = RAW_ARTICLES.map((article) => {
  const calculated = calculateArticleWordCount(article)
  return {
    ...article,
    wordCount: calculated,
  }
})

// Fast Map Lookup by district slug and district ID
const ARTICLES_BY_SLUG = new Map<string, DistrictSEOArticle>()
const ARTICLES_BY_ID = new Map<string, DistrictSEOArticle>()

DISTRICT_SEO_ARTICLES.forEach((art) => {
  ARTICLES_BY_SLUG.set(art.slug.toLowerCase(), art)
  ARTICLES_BY_ID.set(art.districtId.toLowerCase(), art)
})

export function getAllDistrictSEOArticles(): DistrictSEOArticle[] {
  return DISTRICT_SEO_ARTICLES
}

export function getDistrictSEOArticle(slugOrId: string): DistrictSEOArticle | undefined {
  if (!slugOrId) return undefined
  const clean = slugOrId.toLowerCase().trim()
  return ARTICLES_BY_SLUG.get(clean) || ARTICLES_BY_ID.get(clean)
}

export function getDistrictSEOArticlesByDivision(divisionId: string): DistrictSEOArticle[] {
  const clean = divisionId.toLowerCase().replace("-division", "").trim()
  return DISTRICT_SEO_ARTICLES.filter((a) => a.divisionId === clean)
}

export function getDistrictSEOArticleStats() {
  const total = DISTRICT_SEO_ARTICLES.length
  const published = DISTRICT_SEO_ARTICLES.filter((a) => a.status === "published").length
  const reviewReady = DISTRICT_SEO_ARTICLES.filter((a) => a.status === "review-ready").length
  const draft = DISTRICT_SEO_ARTICLES.filter((a) => a.status === "draft").length
  const noindex = DISTRICT_SEO_ARTICLES.filter((a) => a.status === "noindex" || !a.indexStatus).length
  const totalWords = DISTRICT_SEO_ARTICLES.reduce((acc, a) => acc + a.wordCount, 0)
  const averageWords = total > 0 ? Math.round(totalWords / total) : 0

  return {
    total,
    published,
    reviewReady,
    draft,
    noindex,
    totalWords,
    averageWords,
  }
}
