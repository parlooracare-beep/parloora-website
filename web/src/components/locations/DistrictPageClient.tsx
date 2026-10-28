"use client"

import * as React from "react"
import Link from "next/link"
import { DistrictSearchFilter } from "./DistrictSearchFilter"
import { DistrictParlourCard } from "./DistrictParlourCard"
import { District, ServiceCategorySEO } from "@/lib/locations/data"
import { Button } from "@/components/ui/button"
import { Store, Sparkles, MapPin, Search } from "lucide-react"

interface DistrictPageClientProps {
  district: District
  categories: ServiceCategorySEO[]
  activeCategorySlug?: string
  initialParlours: any[]
}

export function DistrictPageClient({
  district,
  categories,
  activeCategorySlug,
  initialParlours,
}: DistrictPageClientProps) {
  const [filterKeyword, setFilterKeyword] = React.useState("")
  const [filterArea, setFilterArea] = React.useState("")

  const filteredParlours = React.useMemo(() => {
    let result = initialParlours

    if (filterKeyword.trim()) {
      const q = filterKeyword.toLowerCase().trim()
      result = result.filter((p) => {
        const name = (p.name || "").toLowerCase()
        const desc = (p.description || "").toLowerCase()
        const addr = (p.address || "").toLowerCase()
        const srvMatch = (p.sampleServices || []).some((s: any) =>
          (s.name || "").toLowerCase().includes(q)
        )
        return name.includes(q) || desc.includes(q) || addr.includes(q) || srvMatch
      })
    }

    if (filterArea.trim()) {
      const area = filterArea.toLowerCase().trim()
      result = result.filter((p) => {
        const addr = (p.address || "").toLowerCase()
        const city = (p.city || "").toLowerCase()
        return addr.includes(area) || city.includes(area)
      })
    }

    return result
  }, [initialParlours, filterKeyword, filterArea])

  return (
    <div>
      {/* Search & Category Filter */}
      <DistrictSearchFilter
        district={district}
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        popularAreas={district.popularAreas}
        onFilterChange={(keyword, area) => {
          setFilterKeyword(keyword)
          setFilterArea(area)
        }}
      />

      {/* Parlours Grid or Informative Empty State */}
      {filteredParlours.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-brand-gray-500 font-semibold px-1">
            <span>
              Showing {filteredParlours.length} verified parlour{filteredParlours.length > 1 ? "s" : ""} in {district.name}
            </span>
            {(filterKeyword || filterArea) && (
              <span className="text-primary">
                Filtered by: {[filterKeyword, filterArea].filter(Boolean).join(", ")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParlours.map((parlour) => (
              <DistrictParlourCard
                key={parlour.id}
                parlour={parlour}
                districtName={district.name}
              />
            ))}
          </div>
        </div>
      ) : initialParlours.length > 0 ? (
        // Results empty due to active filter
        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-brand-gray-100 shadow-sm max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-brand-gray-900 mb-1">No parlours match your filter</h3>
          <p className="text-sm text-brand-gray-500 mb-5">
            Try clearing your search keyword or selected locality to see all available providers in {district.name}.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterKeyword("")
              setFilterArea("")
            }}
            className="rounded-xl px-5 border-primary/20 text-primary font-bold hover:bg-primary/5"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        // Honest informative empty state for district with no active parlours yet
        <div className="bg-gradient-to-br from-white to-[#FBF8FC] rounded-3xl border border-[#F1EDF5] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-brand-gray-900 mb-3 tracking-tight">
            Expanding into {district.name}
          </h3>
          <p className="text-sm md:text-base text-brand-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
            Parloora is actively onboarding verified beauty parlours, salons, and makeup artists across {district.name} ({district.bnName}).
          </p>

          <div className="bg-white rounded-2xl p-6 border border-brand-gray-100 shadow-xs mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E2A9A9]/20 flex items-center justify-center text-[#4B1D5F] shrink-0 mt-0.5 font-black text-sm">
                ✦
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-gray-900 mb-1">Do you own a parlour in {district.name}?</h4>
                <p className="text-xs text-brand-gray-500 leading-relaxed">
                  Join Parloora to accept online appointment bookings, manage staff schedules, and attract clients in {district.name}.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-gray-100 flex flex-col sm:flex-row gap-3">
              <Link href="/seller/register" className="flex-1">
                <Button variant="default" className="w-full rounded-xl font-black text-xs h-10 shadow-md shadow-primary/20">
                  List Your Business Free
                </Button>
              </Link>
              <Link href="/seller/pricing" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10 border-brand-gray-200">
                  Partner Benefits
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-xs text-brand-gray-500">
            <span>Looking for immediate service? </span>
            <Link href="/parlours" className="text-primary font-bold hover:underline">
              Explore available parlours across Bangladesh &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
