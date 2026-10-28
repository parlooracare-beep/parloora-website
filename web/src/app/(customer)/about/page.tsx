import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  TrendingUp,
  Award,
  CalendarCheck,
  Building,
  Scissors,
  Palette,
  HeartPulse,
  Clock,
  Layers,
  Store,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Users,
  Search,
  SlidersHorizontal,
  Smile,
  BadgeCheck,
} from "lucide-react"
import { contactInfo } from "@/config/contact"

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
import { getSiteUrl } from "@/lib/site-url"
import { AboutFaqAccordion, type FaqItem } from "./AboutFaqAccordion"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: "About Parloora | Beauty & Salon Booking in Bangladesh",
  description:
    "Discover Parloora, a beauty and self-care marketplace in Bangladesh connecting customers with parlours, salons and beauty professionals. Starting in Moulvibazar.",
  keywords: [
    "beauty and self-care marketplace in Bangladesh",
    "Beauty parlour booking in Bangladesh",
    "Salon booking in Bangladesh",
    "Beauty parlours in Moulvibazar",
    "Salons in Moulvibazar",
    "Online beauty service booking",
    "Beauty and grooming services",
    "Self-care services in Bangladesh",
    "Find beauty parlours and salons",
    "Book salon appointments online",
    "Parloora",
    "Amdads Group",
    "Amdadur Rahman",
  ],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "About Parloora | Beauty & Self-Care in Bangladesh",
    description:
      "Discover Parloora's mission to connect customers and beauty professionals through convenient digital discovery and booking.",
    url: `${siteUrl}/about`,
    siteName: "Parloora",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "Parloora - Beauty and Self-Care Marketplace in Bangladesh",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Parloora | Beauty & Self-Care in Bangladesh",
    description:
      "Discover Parloora's mission to connect customers and beauty professionals through convenient digital discovery and booking.",
    creator: "@parloora",
    images: [`${siteUrl}/logo.png`],
  },
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-parloora",
    question: "What is Parloora?",
    answer:
      "Parloora is a Bangladesh-based beauty and self-care marketplace designed to connect customers with beauty parlours, salons, and independent beauty professionals.",
  },
  {
    id: "services-discovered",
    question: "What services can I discover on Parloora?",
    answer:
      "Parloora's intended marketplace covers services such as haircuts, hairstyling, makeup, skincare, grooming, and other eligible beauty and personal-care services. Actual availability depends on participating providers.",
  },
  {
    id: "where-operates",
    question: "Where does Parloora operate?",
    answer:
      "Parloora's initial target market is Moulvibazar, Bangladesh, with plans to expand to other areas as the marketplace grows.",
  },
  {
    id: "book-online",
    question: "Can I book beauty services online?",
    answer:
      "Parloora is designed to support online appointment booking. Customers should be able to book services wherever the relevant providers and booking functionality are available.",
  },
  {
    id: "parlours-join",
    question: "Can parlours and salons join Parloora?",
    answer:
      "Parloors and salons can explore the available provider registration or partnership process, where implemented, to learn how to establish a business presence on the platform.",
  },
  {
    id: "sell-products",
    question: "Does Parloora sell beauty products?",
    answer:
      "Beauty product commerce is part of Parloora's broader vision. Do not claim that products are currently available for purchase unless the product marketplace is operational.",
  },
  {
    id: "who-founded",
    question: "Who founded Parloora?",
    answer: "Parloora was founded by Amdadur Rahman, who serves as its Founder and CEO.",
  },
  {
    id: "how-contact",
    question: "How can I contact Parloora?",
    answer:
      `Customers and interested providers can contact Parloora Customer Care and WhatsApp Support at ${contactInfo.customerCare}. Our office is located in ${contactInfo.office}. You can also connect with us on Facebook (${contactInfo.social.facebook}), Instagram (${contactInfo.social.instagram}), and YouTube (${contactInfo.social.youtube}).`,
  },
]

export default function AboutPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Parloora",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        telephone: contactInfo.customerCareInternational,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhaka",
          addressCountry: "BD",
        },
        sameAs: [
          contactInfo.social.facebook,
          contactInfo.social.instagram,
          contactInfo.social.youtube,
        ],
        founder: {
          "@type": "Person",
          name: "Amdadur Rahman",
          jobTitle: "Founder & CEO",
        },
        parentOrganization: {
          "@type": "Organization",
          name: "Amdads Group",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Moulvibazar, Bangladesh",
        },
        description:
          "Parloora is a Bangladesh-based beauty and self-care marketplace and a concern of Amdads Group.",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/about#webpage`,
        url: `${siteUrl}/about`,
        name: "About Parloora | Beauty & Salon Booking in Bangladesh",
        description:
          "Discover Parloora, a beauty and self-care marketplace in Bangladesh connecting customers with parlours, salons and beauty professionals. Starting in Moulvibazar.",
        inLanguage: "en-US",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "Parloora",
          url: siteUrl,
        },
        about: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/about#breadcrumb`,
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
            name: "About Parloora",
            item: `${siteUrl}/about`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/about#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <article className="min-h-screen bg-[#FAF9F6] text-[#2B2B2B] antialiased selection:bg-[#5A189A] selection:text-white">
        {/* ── Breadcrumb Navigation ─────────────────────────────────────────── */}
        <div className="bg-white/80 border-b border-[#E0AFA0]/20 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-xs font-semibold text-[#2B2B2B]/60">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#5A189A] transition-colors flex items-center gap-1"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3 h-3 text-[#2B2B2B]/40" />
                </li>
                <li aria-current="page" className="text-[#5A189A] font-bold">
                  About Us
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* ── Section A: SEO-Optimized Hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-white via-[#FAF9F6] to-[#FAF9F6]">
          {/* Subtle decorative brand glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5A189A]/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#E0AFA0]/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-12 gap-10 md:gap-14 items-center">
              {/* Hero Left Column: Headline, Copy & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Tagline Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5A189A]/10 border border-[#5A189A]/20 text-[#5A189A] text-xs font-bold tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#5A189A]" />
                  <span>Book Your self care services in seconds.</span>
                </div>

                {/* H1 Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#2B2B2B] tracking-tight leading-[1.12]">
                  About Parloora —{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A189A] via-[#7B2E9F] to-[#E0AFA0]">
                    Your Beauty & Self-Care Booking Platform
                  </span>
                </h1>

                {/* Introductory Copy */}
                <p className="text-base sm:text-lg md:text-xl text-[#2B2B2B]/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Parloora is a beauty and self-care marketplace in Bangladesh that helps people
                  discover beauty parlours, salons, and independent beauty professionals. Our platform
                  aims to make it easier to explore services, compare prices, and book appointments
                  while helping beauty businesses grow through digital technology.
                </p>

                {/* Key Context Highlights */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-[#2B2B2B]/70 font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E0AFA0]/40 shadow-xs">
                    <Building className="w-3.5 h-3.5 text-[#5A189A]" />
                    <a
                      href="https://amdadsgroup.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#5A189A] transition-colors"
                    >
                      A Concern of Amdads Group
                    </a>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E0AFA0]/40 shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#5A189A]" />
                    Starting in Moulvibazar, Bangladesh
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link
                    href="/parlours"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl font-bold text-white bg-[#5A189A] hover:bg-[#471279] shadow-lg shadow-[#5A189A]/25 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A189A]"
                  >
                    <span>Explore Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/seller/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl font-bold text-[#5A189A] bg-white border-2 border-[#5A189A] hover:bg-[#5A189A]/5 shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A189A]"
                  >
                    <span>Partner With Parloora</span>
                  </Link>
                </div>
              </div>

              {/* Hero Right Column: Optimized Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-[#5A189A]/20 via-[#E0AFA0]/30 to-transparent rounded-3xl blur-lg transform -rotate-1" />

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/60 bg-white">
                    <Image
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                      alt="Modern aesthetic salon interior representing Parloora beauty and self-care marketplace in Bangladesh"
                      width={800}
                      height={600}
                      priority
                      className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    />

                    {/* Overlay Glass Card */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-white/80 shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#5A189A]">
                            Local Focus
                          </p>
                          <p className="text-sm font-black text-[#2B2B2B]">
                            Beauty Parlours & Salons in Moulvibazar
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E0AFA0]/20 text-[#2B2B2B]">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#5A189A]" />
                          Sylhet Division
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section B: Who We Are ─────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white border-y border-[#E0AFA0]/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0AFA0]/20 text-[#2B2B2B] text-xs font-black uppercase tracking-widest">
                  Company Background
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                  Who We Are
                </h2>
                <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
              </div>

              <div className="bg-[#FAF9F6] p-8 sm:p-12 rounded-3xl border border-[#E0AFA0]/30 shadow-sm space-y-6 text-[#2B2B2B]/85 text-base sm:text-lg leading-relaxed">
                <p>
                  Parloora is a Bangladesh-based beauty and self-care marketplace and a concern of
                  Amdads Group. Founded by Amdadur Rahman, who serves as Founder and CEO, Parloora
                  aims to connect customers with beauty parlours, salons, and independent beauty
                  professionals through a convenient digital platform.
                </p>
                <p>
                  We want to make beauty-service discovery and appointment booking simpler, more
                  transparent, and more accessible. At the same time, we aim to help parlour owners
                  and beauty professionals establish a digital presence, showcase their services,
                  attract customers, and manage appointments more efficiently.
                </p>
                <p className="font-medium text-[#2B2B2B]">
                  Starting with Moulvibazar, Bangladesh, our long-term ambition is to build a trusted
                  beauty and self-care ecosystem that can expand across Bangladesh and potentially
                  into other markets.
                </p>

                {/* Structured Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E0AFA0]/25">
                  <div className="p-4 rounded-xl bg-white border border-[#E0AFA0]/30">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Organization
                    </p>
                    <p className="text-sm font-black text-[#2B2B2B]">
                      A concern of Amdads Group
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E0AFA0]/30">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Leadership
                    </p>
                    <p className="text-sm font-black text-[#2B2B2B]">
                      Amdadur Rahman, Founder &amp; CEO
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-[#E0AFA0]/30">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Initial Market
                    </p>
                    <p className="text-sm font-black text-[#2B2B2B]">
                      Moulvibazar, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section C: Our Mission ────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#FAF9F6]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Our Purpose
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl font-medium text-[#2B2B2B]/85 leading-relaxed">
                &ldquo;Our mission is to connect customers with suitable beauty professionals while
                empowering parlour owners and service providers with digital tools and business
                opportunities.&rdquo;
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            {/* 5 Visually Attractive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: CalendarCheck,
                  title: "Simpler Booking",
                  desc: "Make beauty-service discovery and appointment booking convenient.",
                },
                {
                  icon: SlidersHorizontal,
                  title: "Transparent Choices",
                  desc: "Help customers compare providers, services, and prices.",
                },
                {
                  icon: TrendingUp,
                  title: "Digital Growth",
                  desc: "Help parlours and salons reach more customers online.",
                },
                {
                  icon: ShieldCheck,
                  title: "Trust and Confidence",
                  desc: "Encourage accurate service information and transparent booking policies.",
                },
                {
                  icon: Award,
                  title: "Professional Development",
                  desc: "Support the growth and digital transformation of beauty businesses.",
                },
              ].map((card, idx) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.title}
                    className={`p-8 rounded-3xl bg-white border border-[#E0AFA0]/30 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                      idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
                    }`}
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5A189A]/10 to-[#E0AFA0]/20 flex items-center justify-center mb-6 text-[#5A189A]">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-[#2B2B2B] mb-3">
                        {card.title}
                      </h3>
                      <p className="text-[#2B2B2B]/75 leading-relaxed text-sm sm:text-base">
                        {card.desc}
                      </p>
                    </div>
                    <div className="pt-6 mt-4 border-t border-[#FAF9F6] flex items-center gap-1.5 text-xs font-bold text-[#5A189A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5A189A]" />
                      <span>Parloora Core Value</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Section D: Our Vision ─────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-[#1A0824] via-[#261C36] to-[#1A0824] text-white relative overflow-hidden">
          {/* Ambient Lighting Blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5A189A]/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E0AFA0]/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#E0AFA0] text-xs font-black uppercase tracking-widest border border-white/10">
                <Compass className="w-3.5 h-3.5" /> Forward Vision
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Our Vision
              </h2>

              <blockquote className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FAF9F6] leading-tight tracking-tight">
                &ldquo;To become a leading beauty and self-care marketplace in Bangladesh by making
                beauty services accessible, convenient, trustworthy, and digitally connected.&rdquo;
              </blockquote>

              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                We envision a future where customers can discover and book suitable self-care
                services easily, while beauty professionals can use digital tools to strengthen
                their businesses and reach new customers.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E0AFA0]" /> Accessible Services
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E0AFA0]" /> Digital Transparency
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E0AFA0]" /> Provider Empowerment
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section E: What We Do ─────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Marketplace Scope
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                One Platform for Beauty and Self-Care
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                Parloora brings essential beauty and grooming services together in a single
                intuitive platform designed for discovery, transparency, and convenient booking.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            {/* 6 Responsive Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
              {[
                {
                  icon: Store,
                  title: "Beauty Parlour Discovery",
                  desc: "Discover parlours and explore their available services.",
                  badge: "Discovery",
                },
                {
                  icon: Scissors,
                  title: "Salon and Grooming Services",
                  desc: "Find salons and grooming professionals for different needs.",
                  badge: "Grooming",
                },
                {
                  icon: Palette,
                  title: "Makeup and Styling",
                  desc: "Explore makeup artists and styling services.",
                  badge: "Artistry",
                },
                {
                  icon: HeartPulse,
                  title: "Skincare and Personal Care",
                  desc: "Discover eligible skincare and personal-care services.",
                  badge: "Self-Care",
                },
                {
                  icon: Clock,
                  title: "Online Appointment Booking",
                  desc: "Select services and request suitable appointment times.",
                  badge: "Scheduling",
                },
                {
                  icon: Layers,
                  title: "Digital Business Profiles",
                  desc: "Help providers showcase their businesses, services, prices, and photographs.",
                  badge: "Storefront",
                },
              ].map((service) => {
                const Icon = service.icon
                return (
                  <div
                    key={service.title}
                    className="p-7 rounded-3xl bg-[#FAF9F6] border border-[#E0AFA0]/30 hover:border-[#5A189A]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0AFA0]/40 flex items-center justify-center text-[#5A189A] shadow-xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A]">
                          {service.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#2B2B2B] mb-2.5">
                        {service.title}
                      </h3>
                      <p className="text-[#2B2B2B]/75 text-sm sm:text-base leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clear Roadmap Disclosure for Planned Offerings */}
            <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#5A189A]/5 via-[#E0AFA0]/10 to-[#5A189A]/5 border border-[#5A189A]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#5A189A] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#5A189A]">
                    Planned &amp; Future Marketplace Capabilities
                  </h4>
                  <p className="text-xs sm:text-sm text-[#2B2B2B]/80 leading-relaxed">
                    As part of Parloora&apos;s broader vision, additional offerings such as beauty
                    product commerce, professional training programs, featured promotional
                    placements, and advanced business analytics are currently planned for future
                    releases as the marketplace ecosystem matures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section F: How Parloora Works ─────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#FAF9F6] border-y border-[#E0AFA0]/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Customer Experience
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Your Journey to Easier Self-Care
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                Discover, compare, and arrange appointments through a straightforward four-step
                customer journey.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            {/* 4-Step Journey Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Discover",
                  desc: "Browse beauty parlours, salons, and service providers.",
                  icon: Search,
                },
                {
                  step: "02",
                  title: "Compare",
                  desc: "Explore available services, prices, and provider information.",
                  icon: SlidersHorizontal,
                },
                {
                  step: "03",
                  title: "Book",
                  desc: "Choose a service and an available appointment time, then submit your booking.",
                  icon: CalendarCheck,
                },
                {
                  step: "04",
                  title: "Enjoy",
                  desc: "Visit your selected provider and receive the service.",
                  icon: Smile,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.step}
                    className="relative p-7 rounded-3xl bg-white border border-[#E0AFA0]/30 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-3xl font-black text-[#5A189A]/20">
                          {item.step}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-[#5A189A]/10 flex items-center justify-center text-[#5A189A]">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-[#2B2B2B] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[#2B2B2B]/75 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-6 mt-4 border-t border-[#FAF9F6]">
                      <span className="text-xs font-bold text-[#5A189A] uppercase tracking-wider">
                        Step {item.step} of 4
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Section G: For Beauty Professionals ───────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-10 md:gap-14 items-center">
                {/* Visual / Left Side */}
                <div className="lg:col-span-5 relative order-2 lg:order-1">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E0AFA0]/30">
                    <Image
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                      alt="Beauty professional providing hairstyling and beauty services"
                      width={600}
                      height={700}
                      className="w-full h-auto object-cover aspect-[4/5]"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0824]/90 via-[#1A0824]/20 to-transparent flex flex-col justify-end p-6 text-white">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#E0AFA0]">
                        Provider Empowerment
                      </p>
                      <h4 className="text-xl font-black">
                        Digital Tools for Beauty Salons &amp; Parlours
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Content / Right Side */}
                <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                    For Beauty Professionals
                  </span>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                    Helping Beauty Businesses Grow Digitally
                  </h2>

                  <div className="space-y-4 text-base sm:text-lg text-[#2B2B2B]/80 leading-relaxed">
                    <p>
                      Parloora aims to make it easier for parlours, salons, and independent beauty
                      professionals to establish a digital storefront and connect with potential
                      customers.
                    </p>
                    <p>
                      By bringing service information, pricing, business profiles, and appointment
                      management into a connected platform, we want to help beauty businesses improve
                      their online visibility and build stronger customer relationships.
                    </p>
                  </div>

                  {/* Supported Benefits List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      "Digital business profiles",
                      "Online service and price listings",
                      "Appointment management",
                      "Improved customer discovery",
                      "Promotional opportunities",
                      "Potential access to advanced business tools",
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-[#E0AFA0]/30 text-sm font-semibold text-[#2B2B2B]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#5A189A] shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link
                      href="/seller/register"
                      className="inline-flex items-center gap-2 h-12 px-7 rounded-xl font-bold text-white bg-[#5A189A] hover:bg-[#471279] shadow-lg shadow-[#5A189A]/25 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A189A]"
                    >
                      <span>Become a Partner</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section H: Why Parloora? ──────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#FAF9F6] border-y border-[#E0AFA0]/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Our Distinctive Approach
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Why Choose Parloora?
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                We are building a thoughtful, locally grounded beauty-tech platform designed to
                serve customers and providers with clarity and care.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            {/* 6 Value Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  title: "Convenience",
                  desc: "Discover services and arrange appointments online.",
                  icon: CalendarCheck,
                },
                {
                  title: "Choice",
                  desc: "Explore different providers and available services.",
                  icon: Store,
                },
                {
                  title: "Price Transparency",
                  desc: "Review published service prices where available.",
                  icon: SlidersHorizontal,
                },
                {
                  title: "Local Focus",
                  desc: "Begin with the beauty-service market in Moulvibazar.",
                  icon: MapPin,
                },
                {
                  title: "Provider Empowerment",
                  desc: "Help beauty professionals build their digital presence.",
                  icon: Users,
                },
                {
                  title: "Technology-Driven Experience",
                  desc: "Make the beauty-service journey simpler through digital tools.",
                  icon: Sparkles,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="p-8 rounded-3xl bg-white border border-[#E0AFA0]/30 shadow-xs hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#5A189A]/10 flex items-center justify-center text-[#5A189A] mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-[#2B2B2B] mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-[#2B2B2B]/75 leading-relaxed text-sm sm:text-base">
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Section I: Our Journey and Future Goals ───────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Strategic Roadmap
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Building the Future of Beauty and Self-Care
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                Our staged roadmap outlines our current operational focus and future strategic
                ambitions for the Bangladesh beauty market.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            {/* 5-Phase Timeline Layout */}
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  phase: "Phase 1",
                  status: "Active Foundation",
                  isActive: true,
                  title: "Local Marketplace",
                  desc: "Build a reliable network of beauty parlours, salons, and professionals in Moulvibazar.",
                },
                {
                  phase: "Phase 2",
                  status: "Upcoming Plan",
                  isActive: false,
                  title: "Customer Growth",
                  desc: "Increase awareness, encourage completed bookings, and develop repeat customer relationships.",
                },
                {
                  phase: "Phase 3",
                  status: "Planned Offering",
                  isActive: false,
                  title: "Better Business Tools",
                  desc: "Improve provider booking management, business profiles, and customer communication.",
                },
                {
                  phase: "Phase 4",
                  status: "Strategic Ambition",
                  isActive: false,
                  title: "Geographic Expansion",
                  desc: "Expand into other Bangladeshi cities when demand and operational capacity support growth.",
                },
                {
                  phase: "Phase 5",
                  status: "Long-term Vision",
                  isActive: false,
                  title: "Broader Beauty Ecosystem",
                  desc: "Explore beauty product commerce, professional training, premium provider tools, and AI-powered recommendations.",
                },
              ].map((phaseItem, index) => (
                <div
                  key={phaseItem.phase}
                  className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                    phaseItem.isActive
                      ? "bg-white border-[#5A189A] shadow-md shadow-[#5A189A]/10"
                      : "bg-[#FAF9F6] border-[#E0AFA0]/30 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5A189A] text-white text-xs font-black">
                        {index + 1}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#5A189A]">
                        {phaseItem.phase}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-[#2B2B2B]">
                        {phaseItem.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                        phaseItem.isActive
                          ? "bg-[#5A189A] text-white"
                          : "bg-white border border-[#E0AFA0]/40 text-[#2B2B2B]/70"
                      }`}
                    >
                      {phaseItem.status}
                    </span>
                  </div>
                  <p className="text-[#2B2B2B]/80 text-sm sm:text-base leading-relaxed pl-0 sm:pl-11">
                    {phaseItem.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section J: Brand and Organizational Information ───────────────── */}
        <section className="py-16 md:py-24 bg-[#FAF9F6] border-y border-[#E0AFA0]/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Official Information
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Meet Parloora
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                Confirmed corporate details and verified communication channels.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E0AFA0]/30 shadow-md p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-5">
                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Brand Name
                    </p>
                    <p className="text-lg font-black text-[#2B2B2B]">Parloora</p>
                  </div>

                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Industry
                    </p>
                    <p className="text-base font-bold text-[#2B2B2B]">
                      Beauty and self-care marketplace
                    </p>
                  </div>

                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Organization
                    </p>
                    <p className="text-base font-bold text-[#2B2B2B]">
                      A concern of Amdads Group
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Founder &amp; CEO
                    </p>
                    <p className="text-base font-bold text-[#2B2B2B]">Amdadur Rahman</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Country
                    </p>
                    <p className="text-lg font-black text-[#2B2B2B]">Bangladesh</p>
                  </div>

                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Initial Target Market
                    </p>
                    <p className="text-base font-bold text-[#2B2B2B]">
                      Moulvibazar, Bangladesh
                    </p>
                  </div>

                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Customer Care & WhatsApp
                    </p>
                    <a
                      href={contactInfo.customerCareTel}
                      className="text-base font-bold text-[#5A189A] hover:underline flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {contactInfo.customerCare}
                    </a>
                  </div>

                  <div className="pb-4 border-b border-[#FAF9F6]">
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Office Location
                    </p>
                    <p className="text-base font-bold text-[#2B2B2B] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#5A189A]" />
                      {contactInfo.office}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase font-bold text-[#5A189A] tracking-wider mb-1">
                      Official Channels
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={contactInfo.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-[#5A189A] hover:underline"
                      >
                        Facebook
                      </a>
                      <span className="text-brand-gray-300">&middot;</span>
                      <a
                        href={contactInfo.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-[#5A189A] hover:underline"
                      >
                        Instagram
                      </a>
                      <span className="text-brand-gray-300">&middot;</span>
                      <a
                        href={contactInfo.social.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-[#5A189A] hover:underline"
                      >
                        YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section K: Frequently Asked Questions ─────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5A189A]/10 text-[#5A189A] text-xs font-black uppercase tracking-widest">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2B2B] tracking-tight">
                Frequently Asked Questions About Parloora
              </h2>
              <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed">
                Clear answers regarding our beauty marketplace, services, coverage, and operations.
              </p>
              <div className="w-16 h-1 bg-[#5A189A] mx-auto rounded-full" />
            </div>

            <AboutFaqAccordion items={FAQ_ITEMS} />
          </div>
        </section>

        {/* ── Section L: Final Call to Action ───────────────────────────────── */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-[#5A189A] via-[#471279] to-[#261C36] text-white relative overflow-hidden">
          {/* Subtle Ambient Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E0AFA0]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#E0AFA0] text-xs font-black uppercase tracking-widest border border-white/15">
                <Sparkles className="w-3.5 h-3.5" /> Start Your Self-Care Journey
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Your Next Self-Care Experience Starts Here
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed">
                Discover beauty and self-care services with Parloora. Explore available providers,
                compare your options, and take the next step toward a more convenient booking
                experience.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/parlours"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl font-bold text-[#1C1C1C] bg-gradient-to-r from-[#E0AFA0] via-[#EBC1C1] to-[#D89898] hover:brightness-105 shadow-xl shadow-black/20 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/seller/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border-2 border-white/60 backdrop-blur-md shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Join as a Provider</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
