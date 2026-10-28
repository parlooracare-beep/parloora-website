"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, SlidersHorizontal, Star, MapPin, Clock, ChevronDown, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatParlourName } from "@/lib/utils"

import { getParlours } from "@/lib/actions/parlours"
import { toggleFavorite, getCustomerWishlist } from "@/lib/actions/favorites"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"
import { Heart } from "lucide-react"
import { BANGLADESH_DISTRICTS } from "@/lib/constants"

type Parlour = Database["public"]["Tables"]["parlours"]["Row"]

const CITIES = ["All Cities", ...BANGLADESH_DISTRICTS]
const TYPES = ["All Types", "Full Service Salon", "Hair & Skin", "Bridal & Makeup", "Nail Art & Spa", "Spa & Relaxation"]
const SORT_OPTIONS = ["Most Popular", "Highest Rated"]

const PARLOUR_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1595085816353-d1f5e2239fc4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80",
]

export default function ParloursPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get("search") || "")
  const [city, setCity] = React.useState("All Cities")
  const [type, setType] = React.useState("All Types")
  const [sortBy, setSortBy] = React.useState("Most Popular")
  const [minRating, setMinRating] = React.useState<number>(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFilters, setShowFilters] = React.useState(false)
  const [parlours, setParlours] = React.useState<Parlour[]>([])
  const [loading, setLoading] = React.useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [favorites, setFavorites] = React.useState<string[]>([])
  const [isSemantic, setIsSemantic] = React.useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)
  const pageSize = 12
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRange = Math.min(currentPage * pageSize, totalCount)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  React.useEffect(() => {
    async function loadFavorites() {
      if (!user) return
      const favs = await getCustomerWishlist()
      setFavorites(favs.map(f => f.id))
    }
    loadFavorites()
  }, [user])

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      if (isSemantic && search.trim().length > 0) {
        try {
          const response = await fetch("/api/search/semantic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: search, match_threshold: 0.25 }),
          })
          const resData = await response.json()
          if (resData.success && Array.isArray(resData.results)) {
            // Apply other filters locally on semantic results
            let filtered = resData.results;
            if (city !== "All Cities") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filtered = filtered.filter((p: any) => p.city === city)
            }
            if (type !== "All Types") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filtered = filtered.filter((p: any) => p.type === type)
            }
            if (minRating > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filtered = filtered.filter((p: any) => (p.rating || 5.0) >= minRating)
            }
            // Apply sorting
            if (sortBy === "Highest Rated") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filtered.sort((a: any, b: any) => (b.rating || 5.0) - (a.rating || 5.0))
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              filtered.sort((a: any, b: any) => (b.total_bookings || 0) - (a.total_bookings || 0))
            }
            setParlours(filtered)
            setTotalCount(filtered.length)
            setTotalPages(1)
            setCurrentPage(1)
          } else {
            setParlours([])
            setTotalCount(0)
            setTotalPages(1)
            setCurrentPage(1)
          }
        } catch (err) {
          console.error("Semantic search failed:", err)
          setParlours([])
          setTotalCount(0)
          setTotalPages(1)
          setCurrentPage(1)
        }
      } else {
        const res = await getParlours({ 
          search, 
          city, 
          type, 
          sortBy, 
          minRating: minRating > 0 ? minRating : undefined,
          page: currentPage,
          pageSize
        })
        setParlours(res.data)
        setTotalCount(res.totalCount)
        setTotalPages(res.totalPages)
      }
      setLoading(false)
    }
    
    // Execute immediately on initial navigation; debounce only when user types
    if (!search) {
      load()
      return
    }

    const timer = setTimeout(() => {
      load()
    }, 250)
    
    return () => clearTimeout(timer)
  }, [search, city, type, sortBy, minRating, isSemantic, currentPage])

  const hasActiveFilters = city !== "All Cities" || type !== "All Types" || minRating > 0

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] pt-20 pb-24 relative overflow-hidden">
        {/* Ambient luxury glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E2A9A9]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#C8A2D6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #E2A9A9 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-4 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-[#E2A9A9]" />
            <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
              Verified Salons & Parlours
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Find Your Perfect Parlour
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto font-medium">
            Browse hundreds of verified beauty parlours, salons, and spas across Bangladesh
          </p>
          {/* Search */}
          <div className="flex gap-2 bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl p-1.5 max-w-2xl mx-auto shadow-2xl shadow-purple-950/40">
            <div className="flex items-center gap-2 flex-1 px-3 sm:px-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2A9A9] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={isSemantic ? "Describe what you want (e.g. bridal glow, haircut)..." : "Search by parlour name or service type..."}
                className="bg-transparent text-white placeholder:text-white/60 outline-none w-full text-xs sm:text-sm font-medium"
              />
              {search && (
                <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="text-white/60 hover:text-white shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button variant="rosegold" size="sm" className="rounded-xl px-5 sm:px-6 shrink-0 font-black text-xs sm:text-sm h-10 shadow-lg shadow-[#E2A9A9]/30">
              Search
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-5">
            <span className="hidden xs:inline text-[10px] sm:text-xs text-white/70 font-bold uppercase tracking-wider">Search mode:</span>
            <button
              onClick={() => { setIsSemantic(false); setCurrentPage(1); }}
              className={cn(
                "px-3.5 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all uppercase tracking-wider",
                !isSemantic 
                  ? "bg-white text-brand-gray-900 shadow-md" 
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              Keyword
            </button>
            <button
              onClick={() => { setIsSemantic(true); setCurrentPage(1); }}
              className={cn(
                "px-3.5 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 uppercase tracking-wider",
                isSemantic 
                  ? "bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] font-black shadow-md shadow-[#E2A9A9]/30" 
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              ✨ AI Search
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 md:px-6 -mt-8 md:-mt-10">
        {/* Mobile Filter Bar & Quick Pills */}
        <div className="md:hidden mb-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-sm",
                hasActiveFilters
                  ? "bg-primary text-white border-primary shadow-primary/20"
                  : "bg-white text-brand-charcoal border-brand-gray-200"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-black">
                  {(city !== "All Cities" ? 1 : 0) + (type !== "All Types" ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Quick Sort Toggle */}
            <button
              onClick={() => {
                setSortBy(sortBy === "Most Popular" ? "Highest Rated" : "Most Popular")
                setCurrentPage(1)
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-brand-gray-200 text-brand-charcoal shadow-sm active:scale-95 transition-all"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{sortBy}</span>
            </button>

            {/* Result count */}
            <span className="text-[11px] text-brand-coolgray font-medium ml-auto">
              {totalCount} Found
            </span>
          </div>

          {/* Quick Filter Horizontal Scroll Chips */}
          <div className="flex overflow-x-auto gap-2 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["All", "Dhaka", "Chittagong", "Sylhet"].map((cName) => {
              const active = (cName === "All" && city === "All Cities") || city === cName
              return (
                <button
                  key={cName}
                  onClick={() => {
                    setCity(cName === "All" ? "All Cities" : cName)
                    setCurrentPage(1)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition-all border",
                    active
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-white border-brand-gray-200 text-brand-coolgray hover:border-brand-gray-300"
                  )}
                >
                  {cName}
                </button>
              )
            })}

            <button
              onClick={() => {
                setMinRating(minRating === 4.5 ? 0 : 4.5)
                setCurrentPage(1)
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition-all border flex items-center gap-1",
                minRating >= 4.5
                  ? "bg-amber-50 border-amber-300 text-amber-800 font-bold"
                  : "bg-white border-brand-gray-200 text-brand-coolgray hover:border-brand-gray-300"
              )}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.5+ Stars
            </button>

            {["Bridal & Makeup", "Hair & Skin", "Spa & Relaxation"].map((tName) => {
              const active = type === tName
              return (
                <button
                  key={tName}
                  onClick={() => {
                    setType(type === tName ? "All Types" : tName)
                    setCurrentPage(1)
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 transition-all border",
                    active
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-white border-brand-gray-200 text-brand-coolgray hover:border-brand-gray-300"
                  )}
                >
                  {tName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Filter Bottom Sheet Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 md:hidden animate-in fade-in duration-200">
            <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="p-4 border-b border-brand-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-base text-brand-charcoal">Filter Parlours</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 rounded-full text-brand-coolgray hover:text-brand-charcoal hover:bg-brand-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5">
                {/* City Filter */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-coolgray mb-2 block">
                    City / District
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
                      className="w-full appearance-none px-3.5 py-2.5 text-sm border border-brand-gray-200 rounded-xl bg-white text-brand-charcoal font-medium focus:outline-none focus:border-primary"
                    >
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-coolgray" />
                  </div>
                </div>

                {/* Service Type Filter */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-coolgray mb-2 block">
                    Service Speciality
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setType(t); setCurrentPage(1); }}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs text-left transition-all",
                          type === t
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-brand-gray-200 text-brand-charcoal hover:bg-brand-gray-50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-coolgray mb-2 block">
                    Minimum Rating
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "All", val: 0 },
                      { label: "3.5+ ★", val: 3.5 },
                      { label: "4.0+ ★", val: 4.0 },
                      { label: "4.5+ ★", val: 4.5 },
                    ].map((r) => (
                      <button
                        key={r.val}
                        onClick={() => { setMinRating(r.val); setCurrentPage(1); }}
                        className={cn(
                          "py-2 px-1 text-center rounded-xl border text-xs transition-all",
                          minRating === r.val
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-brand-gray-200 text-brand-charcoal hover:bg-brand-gray-50"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-coolgray mb-2 block">
                    Sort Order
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSortBy(s); setCurrentPage(1); }}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs text-center transition-all",
                          sortBy === s
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                            : "border-brand-gray-200 text-brand-charcoal hover:bg-brand-gray-50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Sheet Actions */}
              <div className="p-4 border-t border-brand-gray-100 flex gap-3 bg-white pb-safe-offset-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCity("All Cities")
                    setType("All Types")
                    setMinRating(0)
                    setCurrentPage(1)
                  }}
                  className="flex-1 rounded-xl text-xs h-11 border-brand-gray-200"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="flex-2 rounded-xl text-xs font-bold h-11 bg-primary text-white shadow-md shadow-primary/20"
                >
                  Apply Filters ({totalCount})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filter Bar (Hidden on Mobile) */}
        <div className="hidden md:flex bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8 flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* City Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[110px]">
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm border border-brand-gray-200 rounded-xl bg-white text-brand-gray-700 cursor-pointer focus:outline-none focus:border-primary hover:bg-brand-gray-50 transition-colors"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-400" />
            </div>

            {/* Type Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[110px]">
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm border border-brand-gray-200 rounded-xl bg-white text-brand-gray-700 cursor-pointer focus:outline-none focus:border-primary hover:bg-brand-gray-50 transition-colors"
              >
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-400" />
            </div>

            {/* Rating Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[110px]">
              <select
                value={minRating}
                onChange={(e) => { setMinRating(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm border border-brand-gray-200 rounded-xl bg-white text-brand-gray-700 cursor-pointer focus:outline-none focus:border-primary hover:bg-brand-gray-50 transition-colors"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
              </select>
              <Star className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-400" />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => { setCity("All Cities"); setType("All Types"); setMinRating(0); setCurrentPage(1); }}
              className="flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-2 transition-colors w-full sm:w-auto"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between sm:justify-end gap-3 w-full sm:w-auto sm:ml-auto border-t sm:border-t-0 pt-3 sm:pt-0">
            {/* Result Count */}
            <span className="text-xs sm:text-sm text-brand-gray-500 text-center xs:text-left">
              Showing <strong className="text-brand-gray-800">{startRange}–{endRange}</strong> of <strong className="text-brand-gray-800">{totalCount}</strong>
            </span>
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm border border-brand-gray-200 rounded-xl bg-white text-brand-gray-700 cursor-pointer focus:outline-none focus:border-primary hover:bg-brand-gray-50 transition-colors"
              >
                {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray-400" />
            </div>
          </div>
        </div>


        {/* Parlour Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-pulse w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-brand-gray-400">Loading parlours...</p>
          </div>
        ) : parlours.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-brand-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-brand-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-brand-gray-700 mb-2">No parlours found</h3>
            <p className="text-brand-gray-400 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearch(""); setCity("All Cities"); setType("All Types"); setCurrentPage(1); }} variant="outline">
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-8">
              {parlours.map((parlour, i) => {
                const coverSrc = parlour.cover_url || parlour.image || parlour.logo_url || 
                  PARLOUR_FALLBACK_IMAGES[i % PARLOUR_FALLBACK_IMAGES.length]

                return (
                  <Link key={parlour.id} href={`/parlours/${parlour.id}`}>
                    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-brand-gray-100 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-square bg-brand-gray-100 overflow-hidden">
                        <Image
                          src={coverSrc}
                          alt={parlour.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                          {parlour.featured && (
                            <Badge className="bg-primary text-white border-0 text-[8px] md:text-[9px] px-2 py-0.5 font-bold shadow-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {/* Favorite Button */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault()
                            if (!user) return alert("Log in to save favorites")
                            const res = await toggleFavorite(parlour.id)
                            if (res.success) {
                              setFavorites(prev => 
                                res.action === "added" 
                                  ? [...prev, parlour.id] 
                                  : prev.filter(id => id !== parlour.id)
                              )
                            }
                          }}
                          className={cn(
                            "absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-10",
                            favorites.includes(parlour.id) 
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                              : "bg-white/80 text-brand-charcoal hover:bg-white hover:text-red-500 shadow-xs"
                          )}
                          aria-label="Save to favorites"
                        >
                          <Heart className={cn("w-3.5 h-3.5", favorites.includes(parlour.id) && "fill-current")} />
                        </button>
                      </div>

                    <CardContent className="p-2.5 md:p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-brand-gray-900 group-hover:text-primary transition-colors leading-tight text-sm md:text-base line-clamp-1">
                        {formatParlourName(parlour.name)}
                      </h3>
                      <p className="text-[10px] md:text-xs text-brand-gray-500 mt-0.5">{parlour.type}</p>

                      <div className="flex items-center gap-1 mt-1.5 text-[10px] md:text-xs text-brand-gray-500">
                        <MapPin className="w-2.5 h-2.5 text-brand-gray-400" />
                        <span className="line-clamp-1">{parlour.city}</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2 md:pt-3 border-t border-brand-gray-100">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs md:text-sm font-semibold text-brand-gray-800">{parlour.rating || 5.0}</span>
                          <span className="hidden xs:inline text-[9px] text-brand-gray-400">({parlour.total_bookings || 0})</span>
                        </div>
                        <span className="text-xs font-black bg-gradient-to-r from-[#E2A9A9] via-[#EBC1C1] to-[#D89898] text-[#341045] px-3.5 py-1.5 rounded-xl shadow-sm shadow-[#E2A9A9]/30 group-hover:shadow-md group-hover:scale-105 active:scale-95 transition-all">
                          Book Now
                        </span>
                      </div>


                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 mb-16">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl px-2 sm:px-3"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">Previous</span>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isNear = Math.abs(p - currentPage) <= 1;
                  const isEdge = p === 1 || p === totalPages;
                  if (!isNear && !isEdge) {
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} className="text-brand-gray-400 px-0.5 sm:px-1">...</span>;
                    }
                    return null;
                  }
                  return (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "rounded-xl w-8 h-8 sm:w-9 sm:h-9 p-0 font-semibold transition-all text-xs sm:text-sm",
                        currentPage === p 
                          ? "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20" 
                          : "text-brand-gray-700 hover:bg-brand-gray-50"
                      )}
                    >
                      {p}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl px-2 sm:px-3"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="w-4 h-4 ml-0.5 sm:ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
