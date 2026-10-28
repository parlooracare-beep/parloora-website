"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Navigation, Loader2, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatParlourName } from "@/lib/utils"
import { useI18n } from "@/lib/store/useI18n"
import { useLocationStore } from "@/lib/store/useLocation"

const NEAR_YOU_IMAGES = [
  "1560066984-138dadb4c035",
  "1522337660859-02fbefca4702",
  "1544161515-4ab6ce6db874",
  "1556228578-0d85b1a4d571",
  "1487412947147-5cebf100ffc2",
  "1570172619644-dfd03ed5d881",
  "1595085816353-d1f5e2239fc4",
  "1527799820374-dcf8d9d4a388",
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NearYouSection({ initialParlours }: { initialParlours?: any[] }) {
  const { t } = useI18n()
  const { selectedDistrict, openModal } = useLocationStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parlours, setParlours] = React.useState<any[]>(initialParlours && initialParlours.length > 0 ? initialParlours : [])
  const [activeDistrictName, setActiveDistrictName] = React.useState<string>(selectedDistrict)
  const [hasDirectDistrictMatches, setHasDirectDistrictMatches] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const fetchParloursForDistrict = React.useCallback(async (districtName: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("parlours")
      .select("id, name, city, address, rating, total_bookings, cover_url, logo_url, type")
      .ilike("city", `%${districtName}%`)
      .order("rating", { ascending: false })
      .limit(8)

    if (data && data.length > 0) {
      setParlours(data)
      setActiveDistrictName(districtName)
      setHasDirectDistrictMatches(true)
    } else {
      // Fallback: if no parlours in detected district, show top-rated across Bangladesh
      const { data: allData } = await supabase
        .from("parlours")
        .select("id, name, city, address, rating, total_bookings, cover_url, logo_url, type")
        .order("rating", { ascending: false })
        .limit(8)
      setParlours(allData || [])
      setActiveDistrictName(districtName)
      setHasDirectDistrictMatches(false)
    }
    setLoading(false)
  }, [])

  // Sync with user's selected/detected district from global location store
  React.useEffect(() => {
    fetchParloursForDistrict(selectedDistrict)
  }, [selectedDistrict, fetchParloursForDistrict])

  if (loading && parlours.length === 0) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-brand-gray-900">
              {t("home.findingNearYou", "Finding parlours near you...")}
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-gray-400" />
          </div>
        </div>
      </section>
    )
  }

  if (parlours.length === 0) return null

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-brand-gray-900 leading-tight">
                {t("home.nearYou", "Near You")}
              </h2>
              <button
                type="button"
                onClick={openModal}
                className="text-xs text-brand-gray-500 hover:text-primary flex items-center gap-1 mt-0.5 group transition-colors"
              >
                <Navigation className="w-3 h-3 text-primary group-hover:rotate-45 transition-transform" />
                {hasDirectDistrictMatches ? (
                  <span>
                    {t("home.showingResultsIn", { city: activeDistrictName }) || `Showing parlours in ${activeDistrictName}, BD`}
                  </span>
                ) : (
                  <span>
                    Top-rated parlours across BD (expanding to {activeDistrictName})
                  </span>
                )}
                <span className="text-[10px] text-primary font-bold underline ml-1">Change</span>
              </button>
            </div>
          </div>
          <Link
            href={`/parlours?city=${encodeURIComponent(activeDistrictName)}`}
            className="text-sm font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
          >
            {t("common.seeAll")}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {parlours.map((parlour, index) => {
            const fallbackImage = `https://images.unsplash.com/photo-${NEAR_YOU_IMAGES[index % NEAR_YOU_IMAGES.length]}?auto=format&fit=crop&w=600&q=80`
            const imageUrl = parlour.cover_url || fallbackImage

            return (
              <Link
                key={parlour.id}
                href={`/parlours/${parlour.id}`}
                className="group bg-white rounded-2xl border border-brand-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gray-100">
                  <Image
                    src={imageUrl}
                    alt={formatParlourName(parlour.name)}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {parlour.type && (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-brand-gray-800 px-2 py-0.5 rounded-full capitalize">
                      {parlour.type}
                    </span>
                  )}
                  {parlour.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-brand-gray-800">
                        {parlour.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-brand-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                    {formatParlourName(parlour.name)}
                  </h3>
                  <p className="text-xs text-brand-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-brand-gray-400 shrink-0" />
                    {parlour.address || parlour.city || "Bangladesh"}
                  </p>
                  <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-brand-gray-400">
                    <span>{parlour.total_bookings || 0} bookings</span>
                    <span className="font-medium text-primary">Book Now</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
