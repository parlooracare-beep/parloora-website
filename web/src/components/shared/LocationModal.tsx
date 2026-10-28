"use client"

import * as React from "react"
import {
  MapPin,
  X,
  Search,
  Navigation,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react"
import { useLocationStore } from "@/lib/store/useLocation"
import { useI18n } from "@/lib/store/useI18n"
import { BANGLADESH_DISTRICTS_DATA } from "@/lib/locations/data"
import { cn } from "@/lib/utils"

const POPULAR_DISTRICTS = [
  { name: "Moulvibazar", bnName: "মৌলভীবাজার", isFocus: true },
  { name: "Dhaka", bnName: "ঢাকা" },
  { name: "Sylhet", bnName: "সিলেট" },
  { name: "Chattogram", bnName: "চট্টগ্রাম" },
  { name: "Gazipur", bnName: "গাজীপুর" },
  { name: "Rajshahi", bnName: "রাজশাহী" },
  { name: "Khulna", bnName: "খুলনা" },
  { name: "Barishal", bnName: "বরিশাল" },
]

export function LocationModal() {
  const { t, locale } = useI18n()
  const {
    isModalOpen,
    closeModal,
    selectedDistrict,
    detectedArea,
    setDistrict,
    detectLocation,
    isDetecting,
    detectError,
  } = useLocationStore()

  const [search, setSearch] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Focus search input when modal opens
  React.useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearch("")
    }
  }, [isModalOpen])

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, closeModal])

  if (!isModalOpen) return null

  const filteredDistricts = BANGLADESH_DISTRICTS_DATA.filter((dist) => {
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    return (
      dist.name.toLowerCase().includes(q) ||
      dist.bnName.includes(q) ||
      dist.divisionName.toLowerCase().includes(q) ||
      dist.popularAreas.some((area) => area.toLowerCase().includes(q)) ||
      dist.aliases.some((a) => a.toLowerCase().includes(q))
    )
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div className="bg-white text-brand-charcoal w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl border border-brand-rose/20 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-purple/5 via-white to-brand-rose/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 id="location-modal-title" className="font-black text-base sm:text-lg text-brand-charcoal leading-tight">
                {locale === "bn" ? "আপনার অবস্থান নির্বাচন করুন" : "Select Your Location"}
              </h2>
              <p className="text-xs text-brand-coolgray">
                {locale === "bn"
                  ? "নিকটবর্তী পার্লার এবং সেবা পেতে আপনার জেলা বেছে নিন"
                  : "Discover parlours and beauty services in your district"}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-brand-gray-100 hover:bg-brand-gray-200 active:scale-95 flex items-center justify-center text-brand-coolgray hover:text-brand-charcoal transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[calc(88vh-80px)]">
          {/* GPS Auto-Detect Button Card */}
          <button
            type="button"
            onClick={() => detectLocation()}
            disabled={isDetecting}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary to-[#6B2D8B] text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all group disabled:opacity-80"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                {isDetecting ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5 text-rose-200 group-hover:rotate-45 transition-transform" />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">
                    {locale === "bn" ? "বর্তমান জিপিএস লোকেশন ব্যবহার করুন" : "Use Current Location"}
                  </span>
                  <span className="text-[10px] bg-rose-300/30 text-rose-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    GPS
                  </span>
                </div>
                <p className="text-[11px] text-white/80">
                  {isDetecting
                    ? locale === "bn"
                      ? "জিপিএস অবস্থান শনাক্ত করা হচ্ছে..."
                      : "Detecting your exact GPS coordinates..."
                    : locale === "bn"
                    ? "স্বয়ংক্রিয়ভাবে আপনার জেলা নির্ধারণ করুন"
                    : "Auto-detect your Bangladesh district & area"}
                </p>
              </div>
            </div>
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/80 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            )}
          </button>

          {/* Detect Error Alert */}
          {detectError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{detectError}</p>
                <p className="text-[11px] text-rose-600/90 mt-0.5">
                  {locale === "bn"
                    ? "নিচের তালিকা থেকে সরাসরি আপনার জেলা নির্বাচন করতে পারেন।"
                    : "You can select your district from the list below."}
                </p>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-brand-coolgray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                locale === "bn"
                  ? "জেলা বা এলাকা খুঁজুন (যেমন মৌলভীবাজার, ঢাকা, সিলেট)..."
                  : "Search district or area (e.g. Moulvibazar, Dhaka, Sylhet)..."
              }
              className="w-full pl-10 pr-4 py-2.5 bg-brand-gray-50 border border-brand-gray-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl text-xs sm:text-sm outline-none transition-all placeholder:text-brand-coolgray font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-coolgray hover:text-brand-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Popular Districts */}
          {!search && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-coolgray">
                  {locale === "bn" ? "জনপ্রিয় জেলাসমূহ" : "Popular Districts"}
                </span>
                {detectedArea && (
                  <span className="text-[11px] text-primary font-medium">
                    {locale === "bn" ? `শনাক্ত: ${detectedArea}` : `Detected: ${detectedArea}`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DISTRICTS.map((item) => {
                  const isSelected = selectedDistrict.toLowerCase() === item.name.toLowerCase()
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setDistrict(item.name)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95",
                        isSelected
                          ? "bg-primary text-white shadow-sm shadow-primary/30 font-bold"
                          : item.isFocus
                          ? "bg-brand-rose/20 text-brand-purple border border-brand-rose/40 hover:bg-brand-rose/30"
                          : "bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-charcoal"
                      )}
                    >
                      {item.isFocus && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                      <span>{locale === "bn" ? item.bnName : item.name}</span>
                      {item.isFocus && (
                        <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-bold uppercase">
                          Focus
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Full Districts Grid (64 Districts) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-coolgray">
                {locale === "bn"
                  ? `সকল ৬৪ জেলা (${filteredDistricts.length})`
                  : `All 64 Districts (${filteredDistricts.length})`}
              </span>
            </div>

            {filteredDistricts.length === 0 ? (
              <div className="py-8 text-center text-xs text-brand-coolgray">
                {locale === "bn"
                  ? `"${search}" এর সাথে কোনো জেলা মেলেনি`
                  : `No districts found matching "${search}"`}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[36vh] overflow-y-auto pr-1">
                {filteredDistricts.map((dist) => {
                  const isSelected = selectedDistrict.toLowerCase() === dist.name.toLowerCase()
                  return (
                    <button
                      key={dist.id}
                      type="button"
                      onClick={() => setDistrict(dist.name)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all active:scale-95",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-brand-gray-100 hover:border-brand-gray-200 hover:bg-brand-gray-50/80 text-brand-charcoal"
                      )}
                    >
                      <div className="min-w-0 pr-1">
                        <div className="text-xs font-bold truncate">
                          {locale === "bn" ? dist.bnName : dist.name}
                        </div>
                        <div className="text-[10px] text-brand-coolgray truncate">
                          {dist.divisionName} Div.
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
