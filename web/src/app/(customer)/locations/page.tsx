import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Scissors,
  CheckCircle2,
  Search,
} from "lucide-react"
import {
  getAllDivisions,
  getAllDistricts,
  getDistrictsByDivision,
} from "@/lib/locations/data"
import { getLocationDirectoryMetrics } from "@/lib/actions/locations"
import { LocationBreadcrumbs } from "@/components/locations/LocationBreadcrumbs"
import { LocationSchema } from "@/components/locations/LocationSchema"
import { getSiteUrl } from "@/lib/site-url"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: "Beauty Parlours & Salons Across Bangladesh — All 64 Districts | Parloora",
  description:
    "Explore verified beauty parlours, hair salons, bridal makeup artists, and spas across all 64 districts and 8 divisions of Bangladesh. Compare prices and book instantly with Parloora.",
  keywords: [
    "beauty parlour Bangladesh",
    "salon booking Bangladesh",
    "beauty parlour directory Bangladesh",
    "hair salon Dhaka",
    "beauty parlour Sylhet",
    "parlour in Moulvibazar",
    "64 districts parlour booking",
    "Parloora marketplace",
  ],
  alternates: {
    canonical: `${siteUrl}/locations`,
    languages: {
      en: `${siteUrl}/en/locations`,
      bn: `${siteUrl}/bn/locations`,
      "x-default": `${siteUrl}/locations`,
    },
  },
  openGraph: {
    title: "Beauty Parlours & Salons Across Bangladesh — All 64 Districts | Parloora",
    description:
      "Explore verified beauty parlours, hair salons, and spas across all 64 districts of Bangladesh. Compare services and book online.",
    url: `${siteUrl}/locations`,
    siteName: "Parloora",
    locale: "en_BD",
    type: "website",
  },
}

export default async function LocationsDirectoryPage() {
  const divisions = getAllDivisions()
  const allDistricts = getAllDistricts()
  const districtCounts = await getLocationDirectoryMetrics()

  const totalActiveParlours = Object.values(districtCounts).reduce((a, b) => a + b, 0)

  const faqs = [
    {
      q: "Which districts of Bangladesh are covered by Parloora?",
      a: "Parloora covers all 64 administrative districts across Bangladesh's 8 divisions (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Rangpur, Mymensingh, and Barishal). You can explore service providers in your local district or division.",
    },
    {
      q: "How do I book a beauty parlour or salon appointment in my district?",
      a: "Select your district from the directory, browse verified provider profiles, choose your desired beauty or grooming service, select your preferred date and time, and confirm your booking. You can pay online or choose Pay at Parlour.",
    },
    {
      q: "Are the prices listed on Parloora genuine?",
      a: "Yes. All service fees, package rates, and durations are set directly by verified parlour owners and verified against our database. No hidden charges.",
    },
    {
      q: "How can parlour owners in other districts list their business on Parloora?",
      a: "Beauty parlour, salon, and spa owners anywhere in Bangladesh can register for free by clicking 'List Your Business' or visiting parloora.com/seller/register. Once reviewed by our team, your shop becomes visible to thousands of local customers.",
    },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <LocationSchema
        breadcrumbs={[]}
        faqs={faqs}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] text-white pt-24 pb-20 relative overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E2A9A9]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#C8A2D6]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-5 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-[#E2A9A9]" />
              <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
                All 64 Districts • 8 Divisions
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
              Find Beauty Parlours <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#F5E9E2]">
                Across Bangladesh
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-8 font-medium max-w-2xl mx-auto">
              Connecting customers with trusted beauty parlours, salons, spas, and makeup artists in every district.
              Compare services, check real prices, and book appointments in seconds.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-black text-white">8</div>
                <div className="text-[11px] md:text-xs text-[#E2A9A9] font-bold uppercase tracking-wider">Divisions</div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-2xl md:text-3xl font-black text-white">64</div>
                <div className="text-[11px] md:text-xs text-[#E2A9A9] font-bold uppercase tracking-wider">Districts</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-white">
                  {totalActiveParlours > 0 ? totalActiveParlours : "Growing"}
                </div>
                <div className="text-[11px] md:text-xs text-[#E2A9A9] font-bold uppercase tracking-wider">Active Parlours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Body */}
      <div className="container mx-auto px-4 md:px-6 -mt-8 relative z-20">
        {/* Breadcrumb container */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-100 px-4 py-2 mb-8">
          <LocationBreadcrumbs items={[]} />
        </div>

        {/* Division Quick Filter Navigation */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-black text-brand-gray-900 mb-6 flex items-center gap-2.5">
            <Building className="w-5 h-5 text-primary" />
            <span>Browse by Administrative Division</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {divisions.map((div) => {
              const divDistricts = getDistrictsByDivision(div.id)
              const divParlours = divDistricts.reduce(
                (sum, d) => sum + (districtCounts[d.id] || 0),
                0
              )

              return (
                <Link
                  key={div.id}
                  href={`/locations/${div.slug}`}
                  className="bg-white rounded-2xl p-4 border border-brand-gray-100 hover:border-primary/40 shadow-xs hover:shadow-md transition-all text-center group flex flex-col items-center justify-between"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors mb-2 font-black text-sm">
                    {div.name.charAt(0)}
                  </div>
                  <div className="font-bold text-sm text-brand-gray-900 group-hover:text-primary transition-colors">
                    {div.name}
                  </div>
                  <div className="text-[11px] text-brand-gray-400 font-medium">
                    {div.bnName}
                  </div>
                  <div className="text-[10px] text-primary font-bold mt-1.5 px-2 py-0.5 bg-primary/5 rounded-full">
                    {div.districtCount} Districts
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Complete 64 District Directory Grouped by Division */}
        <div className="space-y-12">
          {divisions.map((division) => {
            const districts = getDistrictsByDivision(division.id)

            return (
              <section
                key={division.id}
                id={division.slug}
                className="bg-white rounded-3xl p-6 md:p-8 border border-brand-gray-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-brand-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {division.name} Division • {division.bnName}
                      </span>
                      <span className="text-xs text-brand-gray-400">
                        {districts.length} Districts
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-gray-900 mt-1">
                      Beauty Parlours & Salons in {division.name}
                    </h3>
                  </div>

                  <Link
                    href={`/locations/${division.slug}`}
                    className="inline-flex items-center text-xs font-bold text-primary hover:underline gap-1 shrink-0"
                  >
                    <span>View {division.name} Division Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* District Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {districts.map((district) => {
                    const count = districtCounts[district.id] || 0

                    return (
                      <Link
                        key={district.id}
                        href={`/locations/${district.slug}`}
                        className="p-4 rounded-2xl border border-brand-gray-100 hover:border-primary/30 hover:bg-brand-gray-50/60 transition-all flex items-start justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-brand-gray-900 group-hover:text-primary transition-colors truncate">
                              {district.name}
                            </span>
                            <span className="text-[11px] text-brand-gray-400 font-normal">
                              ({district.bnName})
                            </span>
                          </div>

                          <div className="text-[11px] text-brand-gray-500 truncate mt-1">
                            {district.popularAreas.slice(0, 2).join(", ")}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {count > 0 ? (
                            <span className="inline-flex items-center text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                              {count} {count === 1 ? "parlour" : "parlours"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-brand-gray-400">
                              Explore &rarr;
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* Local SEO FAQs */}
        <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-brand-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-gray-900 mb-3 tracking-tight">
              Frequently Asked Questions About Booking in Bangladesh
            </h2>
            <p className="text-sm text-brand-gray-500 font-medium">
              Everything you need to know about finding and reserving salon appointments across Bangladesh.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-gray-50 border border-brand-gray-100"
              >
                <h3 className="font-bold text-sm sm:text-base text-brand-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-brand-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest block mb-2">
              For Parlour & Salon Owners
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              Grow Your Beauty Business with Parloora
            </h3>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Accept appointments, eliminate no-shows, and showcase your services to thousands of customers across your district.
            </p>
          </div>

          <Link href="/seller/register" className="relative z-10 shrink-0">
            <button className="bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] font-black text-sm px-7 py-3 rounded-xl shadow-lg shadow-[#E2A9A9]/20 hover:scale-105 active:scale-95 transition-all">
              List Your Business Free
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
