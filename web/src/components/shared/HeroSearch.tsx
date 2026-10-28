"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/store/useI18n"
import { useLocationStore } from "@/lib/store/useLocation"

const BANGLADESH_CITIES = [
  { en: "All Cities", bn: "সকল শহর" },
  { en: "Dhaka", bn: "ঢাকা" },
  { en: "Moulvibazar", bn: "মৌলভীবাজার" },
  { en: "Sylhet", bn: "সিলেট" },
  { en: "Chittagong", bn: "চট্টগ্রাম" },
  { en: "Rajshahi", bn: "রাজশাহী" },
  { en: "Khulna", bn: "খুলনা" },
  { en: "Barisal", bn: "বরিশাল" }
]

export function HeroSearch() {
  const { t, locale } = useI18n()
  const { selectedDistrict } = useLocationStore()
  const [query, setQuery] = React.useState("")
  const [city, setCity] = React.useState(selectedDistrict || "All Cities")
  const router = useRouter()

  // Keep in sync with user's selected/detected location
  React.useEffect(() => {
    if (selectedDistrict) {
      setCity(selectedDistrict)
    }
  }, [selectedDistrict])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())
    if (city && city !== "All Cities") params.set("city", city)
    
    router.push(`/parlours?${params.toString()}`)
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-white/15 backdrop-blur-2xl border border-white/30 rounded-2xl p-2.5 max-w-2xl mx-auto shadow-[0_12px_40px_rgba(28,8,37,0.4)] transition-all hover:border-[#E2A9A9]/50"
    >
      {/* Service Query Input */}
      <div className="flex items-center gap-2.5 flex-1 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 transition-all focus-within:border-[#E2A9A9]/80 focus-within:bg-white/20">
        <Sparkles className="w-4 h-4 text-[#E2A9A9] shrink-0 animate-pulse" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.searchPlaceholder")}
          className="bg-transparent text-white placeholder:text-white/70 outline-none w-full text-xs sm:text-sm font-medium"
        />
      </div>

      {/* City Selector */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 sm:w-44 shrink-0 transition-all focus-within:border-[#E2A9A9]/80">
        <MapPin className="w-4 h-4 text-[#E2A9A9] shrink-0" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent text-white outline-none w-full text-xs sm:text-sm font-medium cursor-pointer [&>option]:text-brand-gray-900 [&>option]:bg-white"
        >
          {BANGLADESH_CITIES.map((c) => (
            <option key={c.en} value={c.en}>
              {locale === "bn" ? c.bn : c.en}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="rosegold"
        size="default"
        className="rounded-xl px-7 h-11 font-black shrink-0 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E2A9A9]/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Search className="w-4 h-4" />
        <span>{t("common.search")}</span>
      </Button>
    </form>
  )
}
