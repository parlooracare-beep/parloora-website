import Link from "next/link"
import { MapPin, ArrowRight, Sparkles, Building2 } from "lucide-react"
import { getAllDivisions, getDistrictsByDivision } from "@/lib/locations/data"
import { getLocationDirectoryMetrics } from "@/lib/actions/locations"

export async function LocationsExploreSection() {
  const divisions = getAllDivisions()
  const districtCounts = await getLocationDirectoryMetrics()

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-brand-gray-50/50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Nationwide Coverage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-gray-900 tracking-tight">
              Explore Self-Care in <span className="text-primary italic">All 64 Districts</span>
            </h2>
            <p className="text-sm md:text-base text-brand-gray-500 font-medium mt-2 max-w-xl">
              From Moulvibazar and Sylhet to Dhaka and Chattogram, discover verified beauty parlours, salons, and spas near you.
            </p>
          </div>

          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-primary font-black text-sm hover:underline shrink-0"
          >
            <span>View All 64 Districts Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Division Cards with Featured Districts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {divisions.map((div) => {
            const districts = getDistrictsByDivision(div.id)
            const divParlours = districts.reduce((sum, d) => sum + (districtCounts[d.id] || 0), 0)

            return (
              <div
                key={div.id}
                className="bg-white rounded-3xl p-6 border border-brand-gray-100 hover:border-primary/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                        {div.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-brand-gray-900 group-hover:text-primary transition-colors">
                          {div.name}
                        </h3>
                        <p className="text-[11px] text-brand-gray-400 font-medium">
                          {div.bnName} Division
                        </p>
                      </div>
                    </div>

                    {divParlours > 0 ? (
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        {divParlours} active
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-gray-400 font-medium">
                        {div.districtCount} districts
                      </span>
                    )}
                  </div>

                  {/* District quick link tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {districts.slice(0, 4).map((d) => {
                      const count = districtCounts[d.id] || 0
                      return (
                        <Link
                          key={d.id}
                          href={`/locations/${d.slug}`}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-gray-50 hover:bg-primary/5 hover:text-primary text-brand-gray-700 font-semibold border border-brand-gray-100 transition-colors"
                        >
                          {d.name}
                          {count > 0 && <span className="text-[9px] text-emerald-600 ml-1">●</span>}
                        </Link>
                      )
                    })}
                    {districts.length > 4 && (
                      <Link
                        href={`/locations/${div.slug}`}
                        className="text-[11px] px-2 py-1 rounded-lg text-primary font-bold hover:underline"
                      >
                        +{districts.length - 4} more
                      </Link>
                    )}
                  </div>
                </div>

                <Link
                  href={`/locations/${div.slug}`}
                  className="pt-3 border-t border-brand-gray-100 flex items-center justify-between text-xs font-bold text-brand-gray-500 group-hover:text-primary transition-colors"
                >
                  <span>Explore {div.name} Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
