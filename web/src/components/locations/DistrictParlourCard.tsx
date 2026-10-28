import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Sparkles, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Parlour } from "@/lib/actions/locations"

interface DistrictParlourCardProps {
  parlour: Parlour & { servicesCount?: number; sampleServices?: any[] }
  districtName: string
}

export function DistrictParlourCard({ parlour, districtName }: DistrictParlourCardProps) {
  const targetUrl = `/parlours/${parlour.username || parlour.id}`
  const imageSrc =
    parlour.image ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"

  return (
    <div className="bg-white rounded-3xl border border-brand-gray-100 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-gray-100">
        <Image
          src={imageSrc}
          alt={parlour.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {parlour.featured ? (
            <Badge className="bg-primary/95 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md border-0">
              <Sparkles className="w-3 h-3 mr-1" /> Featured
            </Badge>
          ) : (
            <Badge className="bg-white/90 text-brand-gray-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm border-0">
              {parlour.type || "Beauty Parlour"}
            </Badge>
          )}

          {parlour.rating && parlour.rating > 0 ? (
            <div className="flex items-center gap-1 bg-white/95 text-brand-gray-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(parlour.rating).toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        {/* Location badge on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center text-white text-xs font-medium drop-shadow-md">
          <MapPin className="w-3.5 h-3.5 text-[#E2A9A9] mr-1 shrink-0" />
          <span className="truncate">{parlour.address || districtName}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={targetUrl} className="block group-hover:text-primary transition-colors">
            <h3 className="text-lg font-bold text-brand-gray-900 leading-snug line-clamp-1 mb-1.5">
              {parlour.name}
            </h3>
          </Link>

          <p className="text-xs text-brand-gray-500 line-clamp-2 leading-relaxed mb-4">
            {parlour.description ||
              `Verified parlour in ${districtName} offering personalized self-care and professional styling.`}
          </p>

          {/* Sample services pill tags */}
          {parlour.sampleServices && parlour.sampleServices.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {parlour.sampleServices.map((srv: any) => (
                <span
                  key={srv.id}
                  className="inline-flex items-center text-[10px] bg-brand-gray-50 text-brand-gray-700 px-2 py-0.5 rounded-md border border-brand-gray-100 font-medium"
                >
                  {srv.name}
                  {srv.price ? ` • ৳${srv.price}` : ""}
                </span>
              ))}
              {parlour.servicesCount && parlour.servicesCount > 3 && (
                <span className="text-[10px] text-primary font-bold self-center">
                  +{parlour.servicesCount - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer with CTA */}
        <div className="pt-3 border-t border-brand-gray-100 flex items-center justify-between gap-3">
          <div className="text-xs text-brand-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-brand-gray-400" />
            <span>Instant Booking</span>
          </div>

          <Link href={targetUrl}>
            <Button
              size="sm"
              variant="default"
              className="rounded-xl px-4 py-1.5 text-xs font-black h-9 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Book Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
