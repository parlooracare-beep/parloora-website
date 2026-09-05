"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Navigation, Loader2, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatParlourName } from "@/lib/utils"

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

export function NearYouSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parlours, setParlours] = React.useState<any[]>([])
  const [city, setCity] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [denied, setDenied] = React.useState(false)

  const fetchAllParlours = React.useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("parlours")
      .select("*")
      .order("rating", { ascending: false })
      .limit(8)
    setParlours(data || [])
    setLoading(false)
  }, [])

  const fetchParloursByCity = React.useCallback(async (cityName: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("parlours")
      .select("*")
      .ilike("city", `%${cityName}%`)
      .order("rating", { ascending: false })
      .limit(8)

    if (data && data.length > 0) {
      setParlours(data)
    } else {
      // Fallback: if no parlours in detected city, show all
      const { data: allData } = await supabase
        .from("parlours")
        .select("*")
        .order("rating", { ascending: false })
        .limit(8)
      setParlours(allData || [])
      setCity(null)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    if (!navigator.geolocation) {
      fetchAllParlours()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // Reverse geocode to get city name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          )
          const geo = await res.json()
          const detectedCity =
            geo?.address?.city ||
            geo?.address?.town ||
            geo?.address?.village ||
            geo?.address?.county ||
            null

          if (detectedCity) {
            setCity(detectedCity)
            fetchParloursByCity(detectedCity)
          } else {
            fetchAllParlours()
          }
        } catch {
          fetchAllParlours()
        }
      },
      () => {
        // Permission denied or error
        setDenied(true)
        fetchAllParlours()
      },
      { timeout: 8000 }
    )
  }, [fetchAllParlours, fetchParloursByCity])

  if (loading) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-brand-gray-900">
              Finding parlours near you...
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
              <h2 className="text-xl md:text-2xl font-bold text-brand-gray-900 leading-tight">Near You</h2>
              {city && (
                <p className="text-xs text-brand-gray-500 flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3" /> Showing results in <span className="font-semibold text-emerald-600">{city}</span>
                </p>
              )}
              {!city && !denied && (
                <p className="text-xs text-brand-gray-400 mt-0.5">Top-rated parlours near your area</p>
              )}
              {denied && (
                <p className="text-xs text-brand-gray-400 mt-0.5">Enable location for personalized results</p>
              )}
            </div>
          </div>
          <Link
            href="/parlours"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          {parlours.map((parlour, idx) => (
            <Link
              key={parlour.id}
              href={`/parlours/${parlour.id}`}
              className="w-[168px] md:w-[192px] shrink-0 snap-start group"
            >
              <div className="flex flex-col gap-2 h-full">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-brand-gray-200 relative shadow-sm">
                  <Image
                    src={parlour.image || `https://images.unsplash.com/photo-${NEAR_YOU_IMAGES[idx % NEAR_YOU_IMAGES.length]}?auto=format&fit=crop&w=400&q=80`}
                    alt={parlour.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                    <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="text-[9px] font-bold text-brand-gray-700">{parlour.city || "Nearby"}</span>
                  </div>
                </div>
                <div className="px-0.5">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-brand-gray-900 leading-tight text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {formatParlourName(parlour.name)}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-xs text-brand-gray-900">{parlour.rating || 5.0}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-gray-500 line-clamp-1">{parlour.address || parlour.city}</p>
                  <p className="text-[9px] md:text-[10px] text-brand-gray-400">{parlour.type || "Beauty Salon"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
