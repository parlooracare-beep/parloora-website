"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, MapPin, Sparkles, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/store/useI18n"
import { useLocationStore } from "@/lib/store/useLocation"

interface MobileHomeHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[]
  pillText?: string
}

const PROMO_BANNERS = [
  {
    id: 1,
    title: "Glow Up Season ✨",
    highlight: "Up to 30% OFF",
    subtext: "Top-rated salons in Dhaka & Moulvibazar",
    tag: "Limited Offer",
    bg: "from-[#4B1D5F] via-[#6A1B9A] to-[#E2A9A9]",
    link: "/parlours?sort=Highest+Rated",
  },
  {
    id: 2,
    title: "Bridal & Glam Makeovers",
    highlight: "Expert Artists",
    subtext: "Book verified beauty specialists in seconds",
    tag: "Trending",
    bg: "from-[#880E4F] via-[#AD1457] to-[#F48FB1]",
    link: "/parlours?type=Bridal+%26+Makeup",
  },
  {
    id: 3,
    title: "Zero Advance Needed",
    highlight: "Cash on Service",
    subtext: "Pay directly at the parlour counter after treatment",
    tag: "Guaranteed",
    bg: "from-[#1B5E20] via-[#2E7D32] to-[#81C784]",
    link: "/parlours",
  },
]

export function MobileHomeHeader({ categories, pillText }: MobileHomeHeaderProps) {
  const router = useRouter()
  const { t, currentLang } = useI18n()
  const { selectedDistrict, openModal } = useLocationStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0)

  // Auto scroll promo banners
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/parlours?search=${encodeURIComponent(searchQuery.trim())}&city=${encodeURIComponent(selectedDistrict)}`)
    } else {
      router.push(`/parlours?city=${encodeURIComponent(selectedDistrict)}`)
    }
  }

  return (
    <div className="md:hidden bg-gradient-to-b from-[#4B1D5F] via-[#5C236D] to-white pb-4 text-white">
      {/* 1. App Subheader: Market Focus & Tagline Indicator */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-3 py-1 rounded-full border border-white/15 backdrop-blur-md"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-300" />
          <span className="text-xs font-bold tracking-tight text-white">{selectedDistrict}, BD</span>
          <ChevronRight className="w-3 h-3 text-white/60" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-rose-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300" /> {pillText || t("home.instantBooking")}
          </span>
        </div>
      </div>

      {/* 2. Headline & Search Bar */}
      <div className="px-4 pt-2 pb-3">
        <h1 className="text-xl font-black text-white tracking-tight leading-tight mb-3">
          {t("home.heroTitle")} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-300 to-amber-200">
            {t("home.heroTitleGradient")}
          </span>
        </h1>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-purple-950/20 border border-brand-rose/30 p-1">
            <Search className="w-4 h-4 text-brand-coolgray ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.searchPlaceholder")}
              className="w-full bg-transparent text-brand-charcoal text-xs sm:text-sm pl-2.5 pr-3 py-2.5 outline-none placeholder:text-brand-coolgray font-medium"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-md active:scale-95 transition-transform"
            >
              {t("common.search")}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Horizontal Category Story Avatars */}
      <div className="pt-2 pb-3">
        <div className="px-4 flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-white/90">{t("common.categories")}</span>
          <Link href="/parlours" className="text-[11px] font-bold text-rose-200 flex items-center gap-0.5">
            {t("common.seeAll")} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-3 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id || idx}
              href={`/parlours?category=${encodeURIComponent(cat.name)}&city=${encodeURIComponent(selectedDistrict)}`}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[68px] snap-start group"
            >
              <div className="w-15 h-15 rounded-2xl p-0.5 bg-gradient-to-br from-rose-300 via-white/80 to-purple-400 shadow-md group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-[14px] overflow-hidden relative bg-brand-gray-100">
                  <Image
                    src={cat.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80"}
                    alt={cat.name}
                    fill
                    sizes="60px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-center text-white/95 leading-tight line-clamp-1 group-hover:text-rose-200 transition-colors">
                {currentLang.code === "bn" && cat.bnName ? cat.bnName : cat.name.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Special Offers Promo Carousel */}
      <div className="px-4 pt-1 pb-1">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
          >
            {PROMO_BANNERS.map((banner) => (
              <div
                key={banner.id}
                className={cn(
                  "w-full shrink-0 p-4 bg-gradient-to-r text-white flex flex-col justify-between min-h-[110px]",
                  banner.bg
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20">
                    {banner.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[10px] text-white/80 font-medium">{t("common.verified")}</span>
                  </div>
                </div>

                <div className="my-1">
                  <p className="text-xs text-white/90 font-medium">
                    {banner.id === 1 ? t("home.glowUpSeason") : banner.id === 2 ? t("home.bridalGlam") : t("home.zeroAdvance")}
                  </p>
                  <h3 className="text-base font-black tracking-tight text-white">
                    {banner.id === 1 ? t("home.upTo30Off") : banner.id === 2 ? t("home.expertArtists") : t("home.cashOnService")}
                  </h3>
                  <p className="text-[10px] text-white/80 line-clamp-1">
                    {banner.id === 1 ? t("home.topSalonsDhakaCtg") : banner.id === 2 ? t("home.bookVerifiedSpecialists") : t("booking.payAtParlourDesc")}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-1 bg-white text-brand-charcoal text-[11px] font-black px-3 py-1 rounded-xl shadow-md active:scale-95 transition-transform"
                  >
                    {t("common.explore")} <ArrowRight className="w-3 h-3 text-primary" />
                  </Link>
                  <div className="flex gap-1">
                    {PROMO_BANNERS.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          i === activeBannerIndex ? "bg-white w-3" : "bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
