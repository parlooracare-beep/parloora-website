"use client"

import * as React from "react"
import { Phone, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ParlooraLogo } from "@/components/shared/Logo"
import { getFooterSettings, FooterSettings } from "@/lib/actions/site"
import { useI18n } from "@/lib/store/useI18n"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { contactInfo } from "@/config/contact"

// Official SVG icons
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function Footer() {
  const { t, currentLang } = useI18n()
  const [settings, setSettings] = React.useState<FooterSettings | null>(null)

  React.useEffect(() => {
    async function fetchSettings() {
      const data = await getFooterSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  const currentYear = new Date().getFullYear()

  const {
    about_text = "Your premium destination for beauty and wellness services. Book appointments with top parlours in your area instantly.",
    facebook_url = contactInfo.social.facebook,
    instagram_url = contactInfo.social.instagram,
    youtube_url = contactInfo.social.youtube,
  } = settings || {}

  const officeLocation = currentLang.code === "bn" ? contactInfo.officeBn : contactInfo.office
  const tagline = currentLang.code === "bn" ? contactInfo.taglineBn : contactInfo.tagline

  return (
    <footer className="bg-gradient-to-b from-[#1A0824] via-[#120419] to-[#0A020E] border-t border-white/10 pt-12 md:pt-20 pb-36 sm:pb-32 md:pb-12 pb-safe-offset-8 relative overflow-hidden">
      {/* Decorative Brand Glow Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#4B1D5F]/20 rounded-full blur-[120px] -ml-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#E2A9A9]/10 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
          {/* Brand & Description */}
          <div className="space-y-4">
            <ParlooraLogo size="lg" variant="light" href="/" />
            <p className="text-[#E2A9A9] text-xs font-bold uppercase tracking-wider">
              {tagline}
            </p>
            <p className="text-white/60 text-sm leading-relaxed font-medium">
              {about_text}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <FacebookIcon />, url: facebook_url, label: "Facebook" },
                { icon: <InstagramIcon />, url: instagram_url, label: "Instagram" },
                { icon: <YoutubeIcon />, url: youtube_url, label: "YouTube" }
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gray-300 hover:text-white hover:bg-[#4B1D5F] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#E2A9A9]/50"
                  aria-label={`Parloora on ${social.label}`}
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-6">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3.5">
              {[
                { name: t("footer.aboutUs"), href: "/about" },
                { name: t("footer.findParlour"), href: "/parlours" },
                { name: t("footer.bangladeshLocations"), href: "/locations" },
                { name: t("footer.allServices"), href: "/parlours" },
                { name: t("footer.beautyBlog"), href: "/blog" },
                { name: t("footer.contactUs"), href: "/contact" }
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-brand-gray-400 hover:text-[#E2A9A9] text-sm font-semibold transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2A9A9]/0 group-hover:bg-[#E2A9A9] transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-6">{t("footer.forPartners")}</h3>
            <ul className="space-y-3.5">
              <li>
                <Link href="/signup?role=seller" className="text-brand-gray-400 hover:text-[#E2A9A9] text-sm font-semibold transition-colors">
                  {t("footer.registerParlour")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-brand-gray-400 hover:text-[#E2A9A9] text-sm font-semibold transition-colors">
                  {t("footer.sellerLogin")}
                </Link>
              </li>
              <li>
                <Link href="/seller/pricing" className="text-brand-gray-400 hover:text-[#E2A9A9] text-sm font-semibold transition-colors">
                  {t("footer.pricingPlans")}
                </Link>
              </li>
              <li>
                <Link href="/seller/resources" className="text-brand-gray-400 hover:text-[#E2A9A9] text-sm font-semibold transition-colors">
                  {t("footer.partnerResources")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact Info */}
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-xs mb-4 md:mb-6">{t("footer.contactUs")}</h3>
            <ul className="space-y-4">
              {/* Office Location */}
              <li className="flex items-start gap-3.5 text-sm text-brand-gray-300 font-medium">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E2A9A9]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    {t("contact.office", "Office")}
                  </span>
                  <span className="text-white/90">{officeLocation}</span>
                </div>
              </li>

              {/* Customer Care Call */}
              <li className="flex items-start gap-3.5 text-sm text-brand-gray-300 font-medium">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E2A9A9]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    {t("contact.customerCare", "Customer Care")}
                  </span>
                  <a 
                    href={contactInfo.customerCareTel} 
                    className="text-white font-semibold hover:text-[#E2A9A9] transition-colors focus:outline-none focus:underline"
                    aria-label={`Call Parloora Customer Care at ${contactInfo.customerCare}`}
                  >
                    {contactInfo.customerCare}
                  </a>
                </div>
              </li>

              {/* WhatsApp Support */}
              <li className="flex items-start gap-3.5 text-sm text-brand-gray-300 font-medium">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">
                    {t("contact.whatsappSupport", "WhatsApp Support")}
                  </span>
                  <a 
                    href={contactInfo.whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors focus:outline-none focus:underline"
                    aria-label={`Open WhatsApp chat with Parloora at ${contactInfo.whatsappDisplay}`}
                  >
                    {contactInfo.whatsappDisplay}
                  </a>
                </div>
              </li>

              {/* Quick Link to Dedicated Contact Page */}
              <li className="pt-1">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E2A9A9] hover:text-white transition-colors group"
                >
                  <span>{t("contact.getInTouch", "Get in Touch")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular Locations SEO Crawl Strip */}
        <div className="pt-8 pb-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E2A9A9]">
              {t("footer.popularLocations")}
            </span>
            <Link href="/locations" className="text-xs font-bold text-white/70 hover:text-white underline">
              {t("footer.viewAllDistricts")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60 font-medium">
            {[
              { en: "Moulvibazar", bn: "মৌলভীবাজার", href: "/locations/moulvibazar" },
              { en: "Sylhet", bn: "সিলেট", href: "/locations/sylhet" },
              { en: "Dhaka", bn: "ঢাকা", href: "/locations/dhaka" },
              { en: "Chattogram", bn: "চট্টগ্রাম", href: "/locations/chattogram" },
              { en: "Cox's Bazar", bn: "কক্সবাজার", href: "/locations/coxs-bazar" },
              { en: "Cumilla", bn: "কুমিল্লা", href: "/locations/cumilla" },
              { en: "Gazipur", bn: "গাজীপুর", href: "/locations/gazipur" },
              { en: "Rajshahi", bn: "রাজশাহী", href: "/locations/rajshahi" },
              { en: "Bogura", bn: "বগুড়া", href: "/locations/bogura" },
              { en: "Khulna", bn: "খুলনা", href: "/locations/khulna" },
              { en: "Rangpur", bn: "রংপুর", href: "/locations/rangpur" },
              { en: "Mymensingh", bn: "ময়মনসিংহ", href: "/locations/mymensingh" },
              { en: "Barishal", bn: "বরিশাল", href: "/locations/barishal" },
            ].map((loc) => (
              <Link key={loc.href} href={loc.href} className="hover:text-white transition-colors">
                {currentLang.code === "bn" ? loc.bn : loc.en}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Developer Credit & Legal */}
        <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-6">
          <div className="order-2 lg:order-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left flex-wrap">
            <p className="text-xs text-brand-gray-400 font-medium tracking-wide">
              &copy; {currentYear} Parloora. {tagline}.
            </p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="text-xs text-brand-gray-300 font-medium">
              Software Developed By{" "}
              <a
                href="https://amdadsgroup.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E2A9A9] hover:text-white font-semibold transition-colors underline underline-offset-4 decoration-[#E2A9A9]/50 hover:decoration-white"
              >
                Amdads Group
              </a>
            </p>
            <span className="hidden sm:inline text-white/20">•</span>
            <LanguageSwitcher variant="dark" />
          </div>
          {/* Legal Links - Prioritized on mobile for instant visibility & touch accessibility */}
          <div className="order-1 lg:order-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 py-1">
            {[
              { name: t("footer.privacyPolicy"), href: "/privacy" },
              { name: t("footer.termsOfService"), href: "/terms" },
              { name: t("footer.cookiePolicy"), href: "/cookies" },
              { name: t("footer.contactUs"), href: "/contact" },
            ].map(item => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-xs sm:text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-[#E2A9A9] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 active:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#E2A9A9]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
