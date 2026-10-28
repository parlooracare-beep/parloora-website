"use client"

import * as React from "react"
import Link from "next/link"
import { Phone, MapPin, ChevronRight, Sparkles, MessageCircle, ArrowUpRight, HelpCircle, Compass, Users } from "lucide-react"
import { contactInfo } from "@/config/contact"
import { useI18n } from "@/lib/store/useI18n"
import { Button } from "@/components/ui/button"

// Official Brand SVGs
const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const YoutubeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export default function ContactPage() {
  const { t, currentLang } = useI18n()
  const isBn = currentLang.code === "bn"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": isBn ? "পারলুরার সাথে যোগাযোগ করুন" : "Contact Parloora",
    "description": isBn
      ? "বুকিং, সৌন্দর্য সেবা বা পার্টনার হিসেবে পারলুরায় যোগদানের বিষয়ে যোগাযোগ করুন। কাস্টমার কেয়ার ও হোয়াটসঅ্যাপ: 01884599271।"
      : "Contact Parloora for customer care, beauty appointment inquiries, and service provider partnerships. Customer care & WhatsApp: 01884599271.",
    "url": `${contactInfo.website}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Parloora",
      "url": contactInfo.website,
      "telephone": contactInfo.customerCareInternational,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dhaka",
        "addressCountry": "BD"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": contactInfo.customerCareInternational,
          "contactType": "customer service",
          "areaServed": "BD",
          "availableLanguage": ["English", "Bengali"]
        }
      ],
      "sameAs": [
        contactInfo.social.facebook,
        contactInfo.social.instagram,
        contactInfo.social.youtube
      ]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#FAF8FC] text-brand-gray-900 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-brand-rose/20 backdrop-blur-md sticky top-[64px] md:top-[72px] z-30">
          <div className="container mx-auto px-4 md:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-brand-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">
                {t("common.home", "Home")}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-brand-gray-400" />
              <span className="text-primary font-bold">
                {t("contact.title", "Contact Parloora")}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[#FAF8FC] pt-12 md:pt-16 pb-12 border-b border-brand-rose/10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E2A9A9]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-extrabold uppercase tracking-widest">
                {t("contact.badge", "Official Support & Inquiries")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A0824] tracking-tight mb-4">
              {t("contact.title", "Contact Parloora")}
            </h1>

            <p className="text-base sm:text-lg text-brand-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              {t(
                "contact.subtitle",
                "Have a question about bookings, beauty services, or joining Parloora as a service provider? Contact our team through the channels below."
              )}
            </p>
          </div>
        </section>

        {/* Primary Contact Channels Grid */}
        <section className="container mx-auto px-4 md:px-6 max-w-5xl -mt-6 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Customer Care */}
            <div className="bg-white rounded-3xl p-7 border border-[#4B1D5F]/10 shadow-[0_10px_30px_rgba(75,29,95,0.05)] hover:shadow-[0_16px_40px_rgba(75,29,95,0.1)] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#4B1D5F]/10 border border-[#4B1D5F]/15 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-gray-400 block mb-1">
                  {t("contact.customerCare", "Customer Care")}
                </span>
                <a
                  href={contactInfo.customerCareTel}
                  className="text-2xl font-black text-brand-gray-900 hover:text-primary transition-colors block tracking-tight"
                >
                  {contactInfo.customerCare}
                </a>
                <p className="text-xs text-brand-gray-500 mt-2.5 leading-relaxed font-medium">
                  {t("contact.customerCareDesc", "Direct phone assistance for bookings, appointments & questions.")}
                </p>
              </div>

              <div className="pt-6">
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-[#3D164E] text-white rounded-2xl h-12 font-bold shadow-md shadow-primary/20 gap-2 text-sm"
                >
                  <a href={contactInfo.customerCareTel} aria-label={`Call ${contactInfo.customerCare}`}>
                    <Phone className="w-4 h-4" />
                    <span>{t("contact.callNow", "Call Now")}</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Card 2: WhatsApp Support */}
            <div className="bg-white rounded-3xl p-7 border border-emerald-500/20 shadow-[0_10px_30px_rgba(37,211,102,0.06)] hover:shadow-[0_16px_40px_rgba(37,211,102,0.12)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                {isBn ? "তাৎক্ষণিক চ্যাট" : "Instant Chat"}
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-gray-400 block mb-1">
                  {t("contact.whatsappSupport", "WhatsApp Support")}
                </span>
                <a
                  href={contactInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-black text-brand-gray-900 hover:text-emerald-600 transition-colors block tracking-tight"
                >
                  {contactInfo.whatsappDisplay}
                </a>
                <p className="text-xs text-brand-gray-500 mt-2.5 leading-relaxed font-medium">
                  {t("contact.whatsappDesc", "Instant chat for quick questions, provider support & assistance.")}
                </p>
              </div>

              <div className="pt-6">
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold shadow-md shadow-emerald-600/20 gap-2 text-sm"
                >
                  <a
                    href={contactInfo.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat on WhatsApp with Parloora at ${contactInfo.whatsappDisplay}`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>{t("contact.messageNow", "Chat on WhatsApp")}</span>
                  </a>
                </Button>
              </div>
            </div>

            {/* Card 3: Office Location */}
            <div className="bg-white rounded-3xl p-7 border border-[#4B1D5F]/10 shadow-[0_10px_30px_rgba(75,29,95,0.05)] hover:shadow-[0_16px_40px_rgba(75,29,95,0.1)] transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-gray-400 block mb-1">
                  {t("contact.office", "Office")}
                </span>
                <h3 className="text-2xl font-black text-brand-gray-900 tracking-tight">
                  {isBn ? contactInfo.officeBn : contactInfo.office}
                </h3>
                <p className="text-xs text-brand-gray-500 mt-2.5 leading-relaxed font-medium">
                  {t("contact.officeDesc", "Parloora Operations & Support Headquarters.")}
                </p>
              </div>

              <div className="pt-6">
                <div className="w-full bg-brand-gray-50 rounded-2xl p-3 border border-brand-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-brand-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isBn ? "বাংলাদেশ ভিত্তিক প্ল্যাটফর্ম" : "Bangladesh Operations Hub"}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Official Social Media Channels Section */}
        <section className="container mx-auto px-4 md:px-6 max-w-5xl mt-14">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-rose/20 shadow-sm relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-primary block mb-2">
                {isBn ? "সামাজিক যোগাযোগ মাধ্যম" : "Social Presence"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A0824] tracking-tight">
                {t("contact.followUs", "Follow Parloora")}
              </h2>
              <p className="text-sm text-brand-gray-600 mt-2 font-medium">
                {t("contact.followUsDesc", "Connect with us on official social channels for updates and offers.")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Facebook */}
              <a
                href={contactInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 rounded-2xl bg-[#FAF8FC] border border-[#4B1D5F]/10 hover:border-blue-500/30 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FacebookIcon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-brand-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-black text-brand-gray-900 text-lg">Facebook</h3>
                <span className="text-xs font-semibold text-blue-600 mt-1">/parloora</span>
                <p className="text-xs text-brand-gray-500 mt-2">
                  {isBn ? "অফিসিয়াল ফেসবুক পেজ" : "Official Facebook page & community"}
                </p>
              </a>

              {/* Instagram */}
              <a
                href={contactInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 rounded-2xl bg-[#FAF8FC] border border-[#4B1D5F]/10 hover:border-pink-500/30 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-purple-600/15 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-brand-gray-400 group-hover:text-pink-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-black text-brand-gray-900 text-lg">Instagram</h3>
                <span className="text-xs font-semibold text-pink-600 mt-1">@parloora</span>
                <p className="text-xs text-brand-gray-500 mt-2">
                  {isBn ? "সৌন্দর্য অনুপ্রেরণা ও আপডেট" : "Beauty inspiration, reels & stories"}
                </p>
              </a>

              {/* YouTube */}
              <a
                href={contactInfo.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 rounded-2xl bg-[#FAF8FC] border border-[#4B1D5F]/10 hover:border-red-500/30 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <YoutubeIcon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-brand-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-black text-brand-gray-900 text-lg">YouTube</h3>
                <span className="text-xs font-semibold text-red-600 mt-1">@Parloora</span>
                <p className="text-xs text-brand-gray-500 mt-2">
                  {isBn ? "ভিডিও ও পার্লার স্পটলাইট" : "Tutorials & parlour spotlights"}
                </p>
              </a>

            </div>
          </div>
        </section>

        {/* Helpful Shortcuts / Navigation Prompts */}
        <section className="container mx-auto px-4 md:px-6 max-w-5xl mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-white rounded-3xl border border-brand-rose/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-gray-900 mb-1">
                  {isBn ? "সেবা খুঁজছেন?" : "Looking for Services?"}
                </h4>
                <p className="text-xs text-brand-gray-500 mb-3">
                  {isBn ? "আপনার এলাকার শীর্ষ পার্লারগুলো খুঁজুন।" : "Explore vetted beauty parlours & salons across Bangladesh."}
                </p>
                <Link href="/parlours" className="text-xs font-bold text-primary hover:underline">
                  {t("contact.browseParlours", "Explore Parlours")} &rarr;
                </Link>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-brand-rose/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E2A9A9]/20 text-brand-purple flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-gray-900 mb-1">
                  {isBn ? "পার্লার পার্টনার হতে চান?" : "Are you a Parlour Owner?"}
                </h4>
                <p className="text-xs text-brand-gray-500 mb-3">
                  {t("contact.partnerDesc", "Grow your business by listing your salon on Parloora.")}
                </p>
                <Link href="/signup?role=seller" className="text-xs font-bold text-primary hover:underline">
                  {t("contact.partnerWithUs", "Join as a Partner")} &rarr;
                </Link>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-brand-rose/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-brand-gray-900 mb-1">
                  {isBn ? "সাধারণ প্রশ্নাবলী" : "Frequently Asked Questions"}
                </h4>
                <p className="text-xs text-brand-gray-500 mb-3">
                  {t("contact.faqPrompt", "Looking for quick answers about how Parloora works?")}
                </p>
                <Link href="/about#faq" className="text-xs font-bold text-primary hover:underline">
                  {t("contact.checkAbout", "Read About Us")} &rarr;
                </Link>
              </div>
            </div>

          </div>
        </section>

      </div>
    </>
  )
}
