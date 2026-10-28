import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Scissors,
  CheckCircle2,
} from "lucide-react"
import {
  getDistrictBySlug,
  getAllDistricts,
  getAllServiceCategoriesSEO,
  getServiceCategorySEOBySlug,
  getNearbyDistricts,
} from "@/lib/locations/data"
import { getDistrictSEOData } from "@/lib/actions/locations"
import { LocationBreadcrumbs } from "@/components/locations/LocationBreadcrumbs"
import { LocationSchema } from "@/components/locations/LocationSchema"
import { DistrictPageClient } from "@/components/locations/DistrictPageClient"
import { getSiteUrl } from "@/lib/site-url"

interface CategoryPageProps {
  params: Promise<{ slug: string; category: string }>
}

const siteUrl = getSiteUrl()

// ─── DYNAMIC METADATA ────────────────────────────────────────────────────────

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, category: categorySlug } = await params
  const district = getDistrictBySlug(slug)
  const category = getServiceCategorySEOBySlug(categorySlug)

  if (!district || !category) {
    return { title: "Category Not Found | Parloora" }
  }

  const data = await getDistrictSEOData(slug, categorySlug)
  const hasActiveParlours = !!data?.hasActiveParlours

  return {
    title: `${category.name} in ${district.name} (${district.bnName}) | Parloora`,
    description: `Looking for ${category.name.toLowerCase()} in ${district.name}? Explore verified local providers, check authentic service prices, read reviews, and book appointments online with Parloora.`,
    keywords: [
      `${category.name.toLowerCase()} in ${district.name}`,
      `${category.name.toLowerCase()} ${district.name}`,
      ...category.keywords.map((kw) => `${kw} ${district.name}`),
      district.bnName,
      category.bnName,
    ],
    alternates: {
      canonical: `${siteUrl}/locations/${district.slug}/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} in ${district.name} | Parloora`,
      description: `Find top ${category.name.toLowerCase()} in ${district.name}. Book verified appointments online in seconds.`,
      url: `${siteUrl}/locations/${district.slug}/${category.slug}`,
      siteName: "Parloora",
      locale: "en_BD",
      type: "website",
    },
    robots: {
      index: hasActiveParlours,
      follow: true,
    },
  }
}

// ─── STATIC PARAMS ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const districts = getAllDistricts()
  const categories = getAllServiceCategoriesSEO()

  const params: { slug: string; category: string }[] = []
  for (const d of districts) {
    for (const c of categories) {
      params.push({ slug: d.slug, category: c.slug })
    }
  }
  return params
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────

export default async function DistrictCategoryPage({ params }: CategoryPageProps) {
  const { slug, category: categorySlug } = await params
  const district = getDistrictBySlug(slug)
  const category = getServiceCategorySEOBySlug(categorySlug)

  if (!district || !category) notFound()

  const data = await getDistrictSEOData(slug, categorySlug)
  if (!data) notFound()

  const { parlours } = data
  const allCategories = getAllServiceCategoriesSEO()
  const otherCategories = allCategories.filter((c) => c.id !== category.id)
  const nearbyDistricts = getNearbyDistricts(district.id, 4)

  const breadcrumbs = [
    { name: `${district.divisionName} Division`, href: `/locations/${district.divisionSlug}` },
    { name: district.name, href: `/locations/${district.slug}` },
    { name: category.name, href: `/locations/${district.slug}/${category.slug}` },
  ]

  const categoryFaqs = [
    {
      q: `How do I book ${category.name.toLowerCase()} in ${district.name}?`,
      a: `Select any verified parlour listed below in ${district.name}. Choose your preferred service from their menu, pick a date and time slot, and confirm your appointment with instant booking.`,
    },
    {
      q: `What is the average cost for ${category.name.toLowerCase()} in ${district.name}?`,
      a: `Prices vary depending on the service provider, package selection, and products used. You can view real, transparent prices directly on each provider's profile before confirming.`,
    },
    {
      q: `Are the service providers in ${district.name} verified?`,
      a: `Yes. All parlour profiles on Parloora are verified by our moderation team to ensure authentic business details, genuine services, and real prices.`,
    },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <LocationSchema
        district={district}
        divisionName={district.divisionName}
        category={category}
        parlours={parlours}
        faqs={categoryFaqs}
        breadcrumbs={breadcrumbs}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E2A9A9]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-4 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-[#E2A9A9]" />
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
              {district.name} • {category.bnName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {category.name} in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#F5E9E2]">
              {district.name}
            </span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            {category.description} Explore verified providers in {district.name} ({district.bnName}), compare authentic service packages, and book online with Parloora.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-6 relative z-20">
        {/* Breadcrumb Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-100 px-4 py-2 mb-8">
          <LocationBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Client Interactive Filter & Parlours Grid */}
        <div className="mb-16">
          <DistrictPageClient
            district={district}
            categories={allCategories}
            activeCategorySlug={category.slug}
            initialParlours={parlours}
          />
        </div>

        {/* Content & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Column */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-brand-gray-100 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 mb-4 tracking-tight">
              About {category.name} in {district.name}
            </h2>
            <div className="prose prose-sm text-brand-gray-600 leading-relaxed space-y-3">
              <p>
                Finding trusted {category.name.toLowerCase()} in {district.name} is now simple with Parloora.
                Whether you reside in {district.popularAreas.slice(0, 3).join(", ")} or surrounding areas, you can
                browse vetted parlours offering personalized services.
              </p>
              <p>
                Our platform enforces double-booking prevention, guaranteed slot reservations, and flexible payment options
                including Pay at Parlour (Cash on Delivery).
              </p>
            </div>

            {/* Category FAQs */}
            <div className="mt-8 pt-8 border-t border-brand-gray-100">
              <h3 className="text-lg font-bold text-brand-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {categoryFaqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                    <h4 className="font-bold text-xs sm:text-sm text-brand-gray-900 mb-1">{faq.q}</h4>
                    <p className="text-xs text-brand-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Other Categories & Nearby Districts */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                <span>Other Services in {district.name}</span>
              </h3>
              <div className="space-y-2">
                {otherCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/locations/${district.slug}/${c.slug}`}
                    className="p-3 rounded-xl border border-brand-gray-100 hover:border-primary/30 hover:bg-brand-gray-50 transition-all flex items-center justify-between text-xs font-semibold text-brand-gray-700 hover:text-primary group"
                  >
                    <span>{c.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-brand-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {nearbyDistricts.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-brand-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{category.name} in Nearby Districts</span>
                </h3>
                <div className="space-y-2">
                  {nearbyDistricts.map((d) => (
                    <Link
                      key={d.id}
                      href={`/locations/${d.slug}/${category.slug}`}
                      className="p-3 rounded-xl border border-brand-gray-100 hover:border-primary/30 hover:bg-brand-gray-50 transition-all flex items-center justify-between text-xs font-semibold text-brand-gray-700 hover:text-primary group"
                    >
                      <span>{d.name} ({d.bnName})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-brand-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
