"use client"

import * as React from "react"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Search, SlidersHorizontal, Star, MapPin, Clock, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Gradient colors for card image placeholders
const CARD_GRADIENTS = [
  "from-violet-400/30 to-purple-600/30",
  "from-rose-300/30 to-pink-500/30",
  "from-amber-300/30 to-orange-500/30",
  "from-sky-300/30 to-blue-500/30",
  "from-emerald-300/30 to-teal-500/30",
  "from-fuchsia-300/30 to-purple-500/30",
  "from-indigo-300/30 to-violet-500/30",
  "from-red-300/30 to-rose-500/30",
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
    
    // Add a small debounce for search
    const timer = setTimeout(() => {
      load()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [search, city, type, sortBy, minRating, isSemantic, currentPage])

  const hasActiveFilters = city !== "All Cities" || type !== "All Types" || minRating > 0

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#2D0072] via-[#4A148C] to-[#880E4F] pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3">Find a Parlour</h1>
          <p className="text-white/60 text-sm sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
            Browse hundreds of verified beauty parlours across Bangladesh
          </p>
          {/* Search */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-2 sm:px-4">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={isSemantic ? "Describe what you want..." : "Search by name or type..."}
                className="bg-transparent text-white placeholder:text-white/40 outline-none w-full text-xs sm:text-sm"
              />
              {search && (
                <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="text-white/50 hover:text-white shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-4 sm:px-6 shrink-0 font-semibold text-xs sm:text-sm h-9 sm:h-10">
              Search
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-5">
            <span className="hidden xs:inline text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-wider">Search mode:</span>
            <button
              onClick={() => { setIsSemantic(false); setCurrentPage(1); }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all uppercase tracking-wider",
                !isSemantic 
                  ? "bg-white text-brand-gray-900 shadow-xl" 
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              Keyword
            </button>
            <button
              onClick={() => { setIsSemantic(true); setCurrentPage(1); }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 border border-white/10 uppercase tracking-wider",
                isSemantic 
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/30 ring-2 ring-white/20" 
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              ✨ AI Search
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 md:px-6 -mt-10">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
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
              {parlours.map((parlour, i) => (
                <Link key={parlour.id} href={`/parlours/${parlour.id}`}>
                  <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-brand-gray-100 h-full">
                    {/* Image */}
                    <div className={`relative aspect-square bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10" />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {parlour.featured && (
                          <Badge className="bg-primary text-white border-0 text-[8px] px-1.5 py-0">Featured</Badge>
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
                          "absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-10",
                          favorites.includes(parlour.id) 
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                            : "bg-white/50 text-white hover:bg-white hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-3 h-3", favorites.includes(parlour.id) && "fill-current")} />
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
                        <span className="text-xs font-bold text-primary">Book</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
