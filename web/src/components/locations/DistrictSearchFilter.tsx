"use client"

import * as React from "react"
import Link from "next/link"
import { Search, X, Sparkles, SlidersHorizontal, MapPin } from "lucide-react"
import { District, ServiceCategorySEO } from "@/lib/locations/data"
import { cn } from "@/lib/utils"

interface DistrictSearchFilterProps {
  district: District
  categories: ServiceCategorySEO[]
  activeCategorySlug?: string
  popularAreas: string[]
  onFilterChange?: (keyword: string, area: string) => void
}

export function DistrictSearchFilter({
  district,
  categories,
  activeCategorySlug,
  popularAreas,
  onFilterChange,
}: DistrictSearchFilterProps) {
  const [keyword, setKeyword] = React.useState("")
  const [selectedArea, setSelectedArea] = React.useState("")

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setKeyword(val)
    onFilterChange?.(val, selectedArea)
  }

  const handleAreaSelect = (area: string) => {
    const next = selectedArea === area ? "" : area
    setSelectedArea(next)
    onFilterChange?.(keyword, next)
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input */}
      <div className="relative flex items-center bg-white rounded-2xl border border-brand-gray-200/80 shadow-sm p-1.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <Search className="w-4 h-4 text-brand-gray-400 ml-3.5 shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={handleKeywordChange}
          placeholder={`Search parlours or services in ${district.name}...`}
          className="w-full bg-transparent px-3 py-2 text-sm text-brand-gray-900 placeholder:text-brand-gray-400 outline-none font-medium"
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword("")
              onFilterChange?.("", selectedArea)
            }}
            className="p-1 text-brand-gray-400 hover:text-brand-gray-600 mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Service Category Pills */}
      <div>
        <div className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Browse by Service Type</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/locations/${district.slug}`}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
              !activeCategorySlug
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-brand-gray-700 border-brand-gray-200 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            All Services
          </Link>
          {categories.map((cat) => {
            const isActive = activeCategorySlug === cat.slug
            return (
              <Link
                key={cat.id}
                href={`/locations/${district.slug}/${cat.slug}`}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-brand-gray-700 border-brand-gray-200 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Popular Sub-areas (e.g. Sreemangal, Kulaura, Gulshan, Dhanmondi) */}
      {popularAreas.length > 0 && (
        <div className="pt-1">
          <div className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-gray-400" />
            <span>Popular Localities in {district.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularAreas.map((area) => {
              const isSelected = selectedArea === area
              return (
                <button
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                    isSelected
                      ? "bg-brand-gray-900 text-white border-brand-gray-900 shadow-xs"
                      : "bg-white text-brand-gray-600 border-brand-gray-200/80 hover:bg-brand-gray-50"
                  )}
                >
                  {area}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
