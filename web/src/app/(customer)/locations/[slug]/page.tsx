import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Store,
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import {
  getDistrictBySlug,
  getDivisionBySlug,
  getAllDistricts,
  getAllDivisions,
  getDistrictsByDivision,
  getNearbyDistricts,
  getAllServiceCategoriesSEO,
} from "@/lib/locations/data"
import {
  getDistrictSEOData,
  getDivisionSEOData,
  getLocationDirectoryMetrics,
} from "@/lib/actions/locations"
import { LocationBreadcrumbs } from "@/components/locations/LocationBreadcrumbs"
import { LocationSchema } from "@/components/locations/LocationSchema"
import { DistrictPageClient } from "@/components/locations/DistrictPageClient"
import { DistrictParlourCard } from "@/components/locations/DistrictParlourCard"
import { getSiteUrl } from "@/lib/site-url"

interface PageProps {
  params: Promise<{ slug: string }>
}

const siteUrl = getSiteUrl()

// ─── DYNAMIC METADATA ────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  // 1. Division route
  if (slug.endsWith("-division")) {
    const division = getDivisionBySlug(slug)
    if (!division) return { title: "Location Not Found | Parloora" }

    return {
      title: `Beauty Parlours & Salons in ${division.name} Division (${division.bnName}) | Parloora`,
      description: `Discover verified beauty parlours, salons, and self-care providers across ${division.name} Division, Bangladesh. Explore districts, compare service prices, and book appointments with Parloora.`,
      alternates: {
        canonical: `${siteUrl}/locations/${division.slug}`,
      },
      openGraph: {
        title: `Beauty Parlours in ${division.name} Division | Parloora`,
        description: `Explore beauty parlours and salons across ${division.name} Division (${division.bnName}). Book self-care services online.`,
        url: `${siteUrl}/locations/${division.slug}`,
        siteName: "Parloora",
        locale: "en_BD",
        type: "website",
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }

  // 2. District route
  const district = getDistrictBySlug(slug)
  if (!district) return { title: "District Not Found | Parloora" }

  const data = await getDistrictSEOData(slug)
  const hasActiveParlours = !!data?.hasActiveParlours

  return {
    title: `Beauty Parlours & Salons in ${district.name} (${district.bnName}) | Parloora`,
    description: `Discover verified beauty parlours, hair salons, and self-care services in ${district.name}. Compare available services, explore provider profiles, and book appointments online with Parloora.`,
    keywords: [
      `beauty parlour in ${district.name}`,
      `salon in ${district.name}`,
      `makeup artist ${district.name}`,
      `hair salon ${district.name}`,
      `parlour booking ${district.name}`,
      `${district.name} beauty parlour`,
      district.bnName,
    ],
    alternates: {
      canonical: `${siteUrl}/locations/${district.slug}`,
    },
    openGraph: {
      title: `Beauty Parlours & Salons in ${district.name} | Parloora`,
      description: `Looking for beauty parlours in ${district.name}? Explore providers on Parloora, compare real prices, and book appointments online.`,
      url: `${siteUrl}/locations/${district.slug}`,
      siteName: "Parloora",
      locale: "en_BD",
      type: "website",
    },
    // Only index districts that have real verified providers or curated listings.
    // Unpopulated districts render a helpful page with noindex, follow to preserve site quality.
    robots: {
      index: hasActiveParlours,
      follow: true,
    },
  }
}

// ─── STATIC PARAMS ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const divisions = getAllDivisions().map((d) => ({ slug: d.slug }))
  const districts = getAllDistricts().map((d) => ({ slug: d.slug }))
  return [...divisions, ...districts]
}

// ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────

export default async function LocationSlugPage({ params }: PageProps) {
  const { slug } = await params

  // ── BRANCH A: DIVISION LANDING PAGE ────────────────────────────────────────
  if (slug.endsWith("-division")) {
    const divisionData = await getDivisionSEOData(slug)
    if (!divisionData) notFound()

    const { division, districts, parlours } = divisionData
    const districtCounts = await getLocationDirectoryMetrics()
    const allDivisions = getAllDivisions().filter((d) => d.id !== division.id)

    const divisionFaqs = [
      {
        q: `How many districts are in ${division.name} Division?`,
        a: `${division.name} Division comprises ${districts.length} administrative districts: ${districts.map((d) => d.name).join(", ")}.`,
      },
      {
        q: `How can I book a salon in ${division.name} Division?`,
        a: `Select your specific district from the list below, browse verified parlour listings, view authentic service rates, and reserve your appointment directly on Parloora.`,
      },
      {
        q: `Are you accepting new parlour partners in ${division.name}?`,
        a: `Yes! Salon and parlour owners across all ${districts.length} districts of ${division.name} can register for free at parloora.com/seller/register.`,
      },
    ]

    return (
      <div className="min-h-screen bg-brand-gray-50 pb-20">
        <LocationSchema
          divisionName={division.name}
          breadcrumbs={[
            { name: `${division.name} Division`, href: `/locations/${division.slug}` },
          ]}
          faqs={divisionFaqs}
          parlours={parlours}
        />

        {/* Division Hero Banner */}
        <div className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] text-white pt-24 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E2A9A9]/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-4 backdrop-blur-xl">
              <Building className="w-4 h-4 text-[#E2A9A9]" />
              <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
                Division Guide • {division.bnName}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Beauty Parlours & Salons in <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#F5E9E2]">
                {division.name} Division
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
              {division.description} Explore all {districts.length} districts in {division.name} to discover verified parlours, compare pricing, and book your visit.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 -mt-6 relative z-20">
          {/* Breadcrumbs */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-100 px-4 py-2 mb-8">
            <LocationBreadcrumbs
              items={[{ name: `${division.name} Division`, href: `/locations/${division.slug}` }]}
            />
          </div>

          {/* Districts in this Division Grid */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-gray-100 shadow-sm mb-12">
            <div className="mb-6 pb-4 border-b border-brand-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {districts.length} Administrative Districts
              </span>
              <h2 className="text-2xl font-black text-brand-gray-900 mt-1">
                Districts in {division.name} Division
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {districts.map((district) => {
                const count = districtCounts[district.id] || 0
                return (
                  <Link
                    key={district.id}
                    href={`/locations/${district.slug}`}
                    className="p-4 rounded-2xl border border-brand-gray-100 hover:border-primary/40 hover:bg-brand-gray-50/70 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-sm text-brand-gray-900 group-hover:text-primary transition-colors">
                        {district.name}
                      </div>
                      <div className="text-xs text-brand-gray-400">
                        {district.bnName}
                      </div>
                    </div>
                    {count > 0 ? (
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                        {count} {count === 1 ? "parlour" : "parlours"}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-gray-400 font-medium group-hover:text-primary">
                        View &rarr;
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Parlours across this division */}
          {parlours.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-brand-gray-900">
                    Featured Parlours in {division.name}
                  </h2>
                  <p className="text-xs text-brand-gray-500 font-medium">
                    Verified salons and beauty services available right now.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parlours.map((p) => (
                  <DistrictParlourCard
                    key={p.id}
                    parlour={p}
                    districtName={p.city || division.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Division FAQs */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-gray-100 shadow-sm mb-12">
            <h2 className="text-xl font-black text-brand-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Questions About {division.name} Division</span>
            </h2>
            <div className="space-y-4">
              {divisionFaqs.map((faq, i) => (
                <div key={i} className="p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                  <h3 className="font-bold text-sm text-brand-gray-900 mb-1.5">{faq.q}</h3>
                  <p className="text-xs text-brand-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Divisions Navigation */}
          <div className="p-6 bg-white rounded-3xl border border-brand-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-brand-gray-500 uppercase tracking-wider mb-4">
              Explore Other Divisions of Bangladesh
            </h3>
            <div className="flex flex-wrap gap-2">
              {allDivisions.map((d) => (
                <Link
                  key={d.id}
                  href={`/locations/${d.slug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-gray-50 border border-brand-gray-100 text-xs font-semibold text-brand-gray-700 hover:text-primary hover:border-primary/20 transition-all"
                >
                  {d.name} Division ({d.districtCount} Districts)
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── BRANCH B: DISTRICT LANDING PAGE ────────────────────────────────────────
  const data = await getDistrictSEOData(slug)
  if (!data) notFound()

  const { district, parlours, totalParlours, hasActiveParlours } = data
  const categories = getAllServiceCategoriesSEO()
  const nearbyDistricts = getNearbyDistricts(district.id, 4)

  const districtFaqs = [
    {
      q: `How do I book a beauty parlour in ${district.name}?`,
      a: `Browse verified parlour listings in ${district.name} on this page. Click on any parlour to view their services, real prices, and customer reviews. Select your preferred date, time, and service to reserve your appointment online with instant confirmation.`,
    },
    {
      q: `Which areas of ${district.name} have parlours listed?`,
      a: `Parloora covers parlours and salons across ${district.popularAreas.join(", ")} and surrounding areas in ${district.name}. You can filter parlours by locality directly on this page.`,
    },
    {
      q: `Can I pay cash at the parlour in ${district.name}?`,
      a: `Yes! All bookings on Parloora support Pay at Parlour (Cash on Delivery), allowing you to confirm your reservation and pay after enjoying your service.`,
    },
    {
      q: `How can local parlour owners in ${district.name} join Parloora?`,
      a: `Beauty professionals and parlour owners in ${district.name} can sign up for free at parloora.com/seller/register to manage bookings, attract new local clients, and accept digital appointments.`,
    },
  ]

  const breadcrumbs = [
    { name: `${district.divisionName} Division`, href: `/locations/${district.divisionSlug}` },
    { name: district.name, href: `/locations/${district.slug}` },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <LocationSchema
        district={district}
        divisionName={district.divisionName}
        parlours={parlours}
        faqs={districtFaqs}
        breadcrumbs={breadcrumbs}
      />

      {/* District Header Banner */}
      <div className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E2A9A9]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-4 backdrop-blur-xl">
            <MapPin className="w-4 h-4 text-[#E2A9A9]" />
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
              {district.divisionName} Division • {district.bnName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Find Beauty Parlours and Salons in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#F5E9E2]">
              {district.name}
            </span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Looking for beauty parlours, hair salons, or self-care services in {district.name}? Explore
            the verified providers listed on Parloora, compare authentic service prices, and book your
            appointment online with instant confirmation.
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
            categories={categories}
            initialParlours={parlours}
          />
        </div>

        {/* District SEO Content & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column: Local Guide */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-brand-gray-100 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 mb-4 tracking-tight">
              Self-Care and Grooming Services in {district.name}
            </h2>
            <div className="prose prose-sm text-brand-gray-600 leading-relaxed space-y-3">
              <p>
                Whether you need a quick haircut, a bridal makeover, facial rejuvenation, or regular grooming,
                Parloora helps you discover available salons and parlours in {district.name}.
              </p>
              <p>
                Our platform connects you directly with local service specialists across popular localities
                including {district.popularAreas.join(", ")}. All listed services feature transparent pricing,
                clearly defined durations, and verified operating hours.
              </p>
            </div>

            {/* Local FAQs */}
            <div className="mt-8 pt-8 border-t border-brand-gray-100">
              <h3 className="text-lg font-bold text-brand-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Frequently Asked Questions — {district.name}</span>
              </h3>
              <div className="space-y-3">
                {districtFaqs.map((faq, i) => (
                  <div key={i} className="p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                    <h4 className="font-bold text-xs sm:text-sm text-brand-gray-900 mb-1">{faq.q}</h4>
                    <p className="text-xs text-brand-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Nearby Districts & Quick Links */}
          <div className="space-y-6">
            {nearbyDistricts.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-brand-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Nearby Districts in {district.divisionName}</span>
                </h3>
                <div className="space-y-2">
                  {nearbyDistricts.map((d) => (
                    <Link
                      key={d.id}
                      href={`/locations/${d.slug}`}
                      className="p-3 rounded-xl border border-brand-gray-100 hover:border-primary/30 hover:bg-brand-gray-50 transition-all flex items-center justify-between text-xs font-semibold text-brand-gray-700 hover:text-primary group"
                    >
                      <span>{d.name} ({d.bnName})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-brand-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Service Category Deep Links */}
            <div className="bg-white rounded-3xl p-6 border border-brand-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-brand-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Categories in {district.name}</span>
              </h3>
              <div className="space-y-2">
                {categories.map((c) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
