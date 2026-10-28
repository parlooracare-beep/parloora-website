import Link from "next/link"
import Image from "next/image"
import { Fragment } from "react"
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Search, Star, ChevronRight, ChevronLeft, Sparkles, Clock, Shield,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Scissors, Palette, Heart, Flower2, Wind, Gem, Smile, ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatParlourName } from "@/lib/utils"

// --- DATA ---
import { getFeaturedParlours, getParlours } from "@/lib/actions/parlours"
import { getHomepageContent, getServiceCategories, HomepageContent } from "@/lib/actions/site"
import { HeroSearch } from "@/components/shared/HeroSearch"
import { NearYouSection } from "@/components/shared/NearYouSection"
import { getHomepageSections } from "@/lib/actions/page-builder"
import { MobileHomeHeader } from "@/components/shared/MobileHomeHeader"

const defaultContent = {
  hero_title: "Book Your Self-Care Services in Seconds",
  hero_subtitle: "Discover top-rated beauty parlours, salons, and spas near you. Real-time booking, verified professionals, guaranteed satisfaction.",
  hero_pill_text: "Bangladesh's Premier Self-Care Marketplace",
  shop_title: "Shop Premium Beauty Products",
  shop_subtitle: "We've partnered with top brands to bring you the best skincare, haircare, and makeup. Order now and get it delivered to your doorstep.",
  cta_title: "Ready to Glow Up?",
  cta_subtitle: "Join thousands of customers who trust Parloora for their beauty and self-care needs. Sign up free and book your first appointment today."
}

const RECOMMENDED_IMAGES = [
  "1544161515-4ab6ce6db874",
  "1522337660859-02fbefca4702",
  "1560066984-138dadb4c035",
  "1556228578-0d85b1a4d571",
  "1487412947147-5cebf100ffc2",
  "1570172619644-dfd03ed5d881",
  "1595085816353-d1f5e2239fc4",
  "1527799820374-dcf8d9d4a388"
]

const serviceCategories = [
  { name: "Beauty Parlours", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Men's & Women's Salons", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Hair Care & Styling", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Makeup & Beauty", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Nails & Manicure", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Spa & Wellness", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "Grooming & Shaving", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80", count: "Explore" },
  { name: "All Self-Care Services", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80", count: "Explore" },
]

const steps = [
  {
    step: "01",
    title: "Search & Discover",
    description: "Browse hundreds of verified beauty parlours in your city. Filter by service, price, rating, and location.",
    color: "from-violet-500 to-purple-600",
  },
  {
    step: "02",
    title: "Choose & Book",
    description: "Pick your favourite service, select a convenient time slot, and confirm your booking in seconds.",
    color: "from-rose-400 to-pink-600",
  },
  {
    step: "03",
    title: "Relax & Enjoy",
    description: "Arrive at the parlour, get pampered by professionals, and leave feeling gorgeous. It's that simple.",
    color: "from-amber-400 to-orange-500",
  },
]

// --- PAGE ---

// ISR: Revalidate homepage cache every 60 seconds for near-instant TTFB
export const revalidate = 60

export default async function HomePage() {
  // Fetch all homepage data in parallel with an 8s safety fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [featuredParlours, dynamicContent, dbCategories, recommendedParloursData, pageSections]: any =
    await Promise.race([
      Promise.all([
        getFeaturedParlours(),
        getHomepageContent() as Promise<HomepageContent | null>,
        getServiceCategories(),
        getParlours({ sortBy: "Highest Rated" }),
        getHomepageSections()
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Promise<any[]>((resolve) =>
        setTimeout(() => resolve([[], null, [], [], []]), 8000)
      )
    ])

  const recommendedParlours = (
    Array.isArray(recommendedParloursData) 
      ? recommendedParloursData 
      : recommendedParloursData?.data || []
  ).slice(0, 8)

  const content = { ...defaultContent, ...(dynamicContent || {}) } as HomepageContent

  // Map images for database categories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedCategories = dbCategories.map((cat: any) => {
    const nameLower = cat.name.toLowerCase()
    let image = "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80"
    
    if (nameLower.includes('hair')) image = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('nail')) image = "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('skin')) image = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('spa') || nameLower.includes('massage')) image = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('makeup') || nameLower.includes('beauty')) image = "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('wax') || nameLower.includes('thread')) image = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80"
    else if (nameLower.includes('bridal')) image = "https://images.unsplash.com/photo-1595085816353-d1f5e2239fc4?auto=format&fit=crop&w=400&q=80"

    return {
      ...cat,
      image,
      count: `${cat.parlour_count || 0}+ Parlours`
    }
  })

  // Fallback to hardcoded categories if DB is empty or merge if less than 8 for design consistency
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayCategories: any[] = [...mappedCategories]
  if (displayCategories.length > 0 && displayCategories.length < 8) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingNames = new Set(displayCategories.map((c: any) => c.name.toLowerCase()))
    for (const defCat of serviceCategories) {
      if (!existingNames.has(defCat.name.toLowerCase())) {
        displayCategories.push(defCat)
      }
      if (displayCategories.length >= 8) break
    }
  } else if (displayCategories.length === 0) {
    displayCategories.push(...serviceCategories)
  }

  return (
    <div className="min-h-screen">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {pageSections.map((sec: any) => {
        if (!sec.visible) return null
        switch (sec.id) {
          case "hero":
            return (
              <Fragment key="hero">
                {/* Mobile App Header (Search + Categories + City Selector + Promos) */}
                <MobileHomeHeader categories={displayCategories} pillText={content.hero_pill_text} />

                {/* Desktop Website Hero */}
                <section className="hidden md:flex relative min-h-[68vh] items-center overflow-hidden">
                  {/* Signature Deep Purple & Ambient Rose Gold Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E]" />
                  
                  {/* Ambient Rose Gold & Lavender Luxury Orbs */}
                  <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#E2A9A9]/18 blur-[120px] pointer-events-none" />
                  <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#C8A2D6]/15 blur-[100px] pointer-events-none" />
                  
                  {/* Subtle geometric dot grid overlay */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle, #E2A9A9 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                  />

                  <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 md:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                      {/* Pill Tagline Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-2 mb-6 backdrop-blur-xl shadow-lg shadow-purple-950/40">
                        <Sparkles className="w-4 h-4 text-[#E2A9A9]" />
                        <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">
                          Book Your Self Care Services In Seconds
                        </span>
                      </div>

                      {/* Headline */}
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.08] tracking-tight">
                        Experience Next-Gen <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-[#E2A9A9] via-[#F3D5D5] to-[#E2A9A9] bg-clip-text text-transparent">
                          Beauty & Luxury Self-Care
                        </span>
                      </h1>

                      <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
                        Connect with Bangladesh&apos;s premier beauty parlours, luxury salons, and certified wellness specialists. Real-time availability, verified professionals, guaranteed satisfaction.
                      </p>

                      {/* Location-Aware Search Bar */}
                      <div className="max-w-2xl mx-auto mb-8">
                        <HeroSearch />
                      </div>

                      {/* Prominent CTA Button Pair */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
                        <Link href="/parlours" className="w-full sm:w-auto">
                          <Button
                            variant="rosegold"
                            size="lg"
                            className="w-full sm:w-auto rounded-2xl px-8 h-13 font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#E2A9A9]/35 hover:scale-105 active:scale-95 transition-all"
                          >
                            <span>Book Now</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href="/parlours" className="w-full sm:w-auto">
                          <Button
                            variant="outline-white"
                            size="lg"
                            className="w-full sm:w-auto rounded-2xl px-8 h-13 font-bold text-sm md:text-base hover:bg-white/15 transition-all"
                          >
                            <span>Explore Services</span>
                          </Button>
                        </Link>
                      </div>

                      {/* Trust Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 md:gap-8 text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Partners
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> 4.9 Average Rating
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
                          <Clock className="w-3.5 h-3.5 text-sky-300" /> Instant Confirmation
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Refined Bottom Separator */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-brand-gray-50 to-transparent" />
                </section>
              </Fragment>
            )
          case "recommended":
            return (
              <Fragment key="recommended">
                <section className="py-8 bg-gradient-to-br from-[#fdf6ff] via-white to-[#fdf2f2] relative overflow-hidden">
                  <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h2 className="text-xl md:text-2xl font-black text-brand-gray-900 tracking-tight">Recommended For You</h2>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5">
                        <button aria-label="Previous recommended" className="w-8 h-8 rounded-full bg-white shadow-xs border border-[#F1EDF5] flex items-center justify-center hover:bg-brand-gray-50 transition-colors">
                          <ChevronLeft className="w-4 h-4 text-brand-gray-600" />
                        </button>
                        <button aria-label="Next recommended" className="w-8 h-8 rounded-full bg-white shadow-xs border border-[#F1EDF5] flex items-center justify-center hover:bg-brand-gray-50 transition-colors">
                          <ChevronRight className="w-4 h-4 text-brand-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex overflow-x-auto gap-3.5 md:gap-5 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {recommendedParlours.map((parlour: any, idx: number) => (
                        <Link key={parlour.id} href={`/parlours/${parlour.id}`} className="w-[172px] md:w-[204px] shrink-0 snap-start group">
                          <div className="flex flex-col gap-2.5 h-full bg-white p-2 rounded-2xl border border-[#F1EDF5] shadow-xs group-hover:shadow-md group-hover:border-[#E2A9A9]/50 group-hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-brand-gray-200 relative shadow-xs">
                              <Image 
                                src={`https://images.unsplash.com/photo-${RECOMMENDED_IMAGES[idx % RECOMMENDED_IMAGES.length]}?auto=format&fit=crop&w=400&q=80`} 
                                alt={parlour.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="px-1 pb-1">
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
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F1EDF5]">
                                <span className="text-[9px] md:text-[10px] font-medium text-brand-gray-500 truncate max-w-[100px]">{parlour.type || "Beauty Salon"}</span>
                                <span className="text-[10px] font-black bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] px-2.5 py-0.5 rounded-lg group-hover:brightness-105 transition-all shadow-xs">
                                  Book Now
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="py-12 md:py-20 bg-[#FBF9FC]">
                  <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-end justify-between mb-8 md:mb-12">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-[#4B1D5F]/8 border border-[#E2A9A9]/30 rounded-full px-3 py-1 mb-3">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span className="text-primary text-[11px] font-bold uppercase tracking-wider">Hand-picked for you</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-brand-gray-900 tracking-tight">
                          Featured Parlours & Salons
                        </h2>
                      </div>
                      <Link href="/parlours" className="hidden md:flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-sm transition-colors group">
                        <span>View All Parlours</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {featuredParlours.length > 0 ? featuredParlours.map((parlour: any, idx: number) => {
                        const coverSrc = parlour.cover_url || parlour.image || parlour.logo_url || 
                          `https://images.unsplash.com/photo-${RECOMMENDED_IMAGES[idx % RECOMMENDED_IMAGES.length]}?auto=format&fit=crop&w=600&q=80`

                        return (
                          <Link key={parlour.id} href={`/parlours/${parlour.id}`} className="group h-full">
                            <Card className="hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden border-[#F1EDF5] hover:border-[#E2A9A9]/50 h-full flex flex-col rounded-2xl bg-white">
                              <div className="relative aspect-[4/3] bg-brand-gray-100 overflow-hidden">
                                <Image
                                  src={coverSrc}
                                  alt={parlour.name}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-2.5 left-2.5">
                                  <Badge className="bg-[#4B1D5F] text-white border-0 text-[9px] md:text-xs px-2.5 py-0.5 shadow-sm font-bold">
                                    Verified
                                  </Badge>
                                </div>
                              </div>
                              <CardContent className="p-3.5 md:p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-brand-gray-900 group-hover:text-primary transition-colors text-sm md:text-base line-clamp-1">
                                  {formatParlourName(parlour.name)}
                                </h3>
                                <p className="text-[10px] md:text-xs text-brand-gray-500 mt-0.5 line-clamp-1">{parlour.type || "Parlour"} · {parlour.city}</p>
                                <div className="mt-auto flex items-center justify-between pt-2.5 md:pt-3 border-t border-[#F1EDF5]">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-xs md:text-sm font-bold text-brand-gray-800">{parlour.rating || 5.0}</span>
                                    <span className="hidden xs:inline text-[9px] text-brand-gray-400 font-medium">({parlour.total_bookings || 0})</span>
                                  </div>
                                  <span className="text-[11px] font-black bg-gradient-to-r from-[#F3D5D5] via-[#E2A9A9] to-[#D89898] text-[#341045] px-3 py-1 rounded-xl group-hover:brightness-105 transition-all shadow-xs">
                                    Book Now
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      }) : (
                        <p className="text-brand-gray-500 col-span-full">No featured parlours found.</p>
                      )}
                    </div>

                    <div className="text-center mt-10 md:hidden">
                      <Link href="/parlours">
                        <Button variant="outline" className="border-2 border-primary text-primary font-bold">
                          View All Parlours <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>
              </Fragment>
            )
          case "near-you":
            return <NearYouSection key="near-you" initialParlours={recommendedParlours} />
          case "categories":
            return (
              <section key="categories" className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 bg-[#4B1D5F]/8 border border-[#E2A9A9]/30 rounded-full px-3 py-1 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider">Top Service Categories</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-brand-gray-900 mb-3 tracking-tight">
                      What Are You Looking For?
                    </h2>
                    <p className="text-brand-gray-500 max-w-lg mx-auto text-sm md:text-base font-medium">
                      From everyday grooming to luxury bridal glam, discover verified experts for every self-care treatment.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {displayCategories.map((cat: any) => {
                      return (
                        <Link
                          key={cat.name}
                          href={`/parlours?category=${encodeURIComponent(cat.name)}`}
                          className="group"
                        >
                          <Card className="hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-[#F1EDF5] hover:border-[#E2A9A9]/60 rounded-2xl bg-white shadow-xs h-full">
                            <CardContent className="p-5 md:p-6 flex flex-col items-center text-center gap-3.5">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-300 border-2 border-white group-hover:border-[#E2A9A9]/40 bg-brand-gray-100 relative">
                                <Image 
                                  src={cat.image} 
                                  alt={cat.name} 
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-brand-gray-900 group-hover:text-primary transition-colors text-sm md:text-base">{cat.name}</p>
                                <p className="text-xs text-brand-gray-500 mt-0.5 font-medium">{cat.count}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </section>
            )
          case "steps":
            return (
              <section key="steps" className="py-14 md:py-24 bg-[#FBF9FC] overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 bg-[#4B1D5F]/8 border border-[#E2A9A9]/30 rounded-full px-3 py-1 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary text-[11px] font-bold uppercase tracking-wider">Fast & Effortless</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-brand-gray-900 mb-3 tracking-tight">
                      Book in 3 Easy Steps
                    </h2>
                    <p className="text-brand-gray-500 max-w-md mx-auto text-sm md:text-base font-medium">
                      Book your beauty and grooming appointments seamlessly in seconds.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-300 via-rose-300 to-amber-300" />

                    {steps.map((s) => (
                      <div key={s.step} className="flex flex-col items-center text-center p-4">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-xl shadow-purple-950/10 relative z-10 hover:scale-105 transition-transform`}>
                          <span className="text-3xl font-black text-white">{s.step}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-brand-gray-900 mb-2">{s.title}</h3>
                        <p className="text-brand-gray-500 leading-relaxed text-sm font-medium">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case "shop":
            return (
              <section key="shop" className="py-12 md:py-16 bg-[#180621] relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E2A9A9]/10 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4B1D5F]/30 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-md">
                        <ShoppingBag className="w-4 h-4 text-[#E2A9A9]" />
                        <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">Parloora Marketplace</span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                        {content.shop_title || defaultContent.shop_title}
                      </h2>
                      
                      <p className="text-white/70 text-sm md:text-base max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                        {content.shop_subtitle || defaultContent.shop_subtitle}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
                        <Link href="/shop" className="w-full sm:w-auto">
                          <Button size="default" variant="rosegold" className="w-full sm:w-auto rounded-xl px-7 font-black shadow-xl shadow-[#E2A9A9]/30 transition-all hover:scale-105 active:scale-95">
                            Visit Shop <ChevronRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </Link>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 text-xs font-semibold">
                          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>100% Genuine Products & Direct Delivery</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative max-w-sm mx-auto lg:ml-auto">
                      <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-[1.5rem] border border-white/10 p-2.5 relative group">
                        <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] scale-95 -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                        <div className="relative h-full w-full rounded-[1.2rem] overflow-hidden bg-brand-gray-800 flex items-center justify-center border border-white/5 shadow-2xl">
                          <ShoppingBag className="w-20 h-20 text-white/5" />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-gray-950 via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-6 left-6 right-6 text-white">
                            <p className="text-primary font-black uppercase tracking-tighter text-[10px] mb-1">Recommended for you</p>
                            <h3 className="text-xl font-black mb-1">Glow Serum Pro X</h3>
                            <div className="flex items-center gap-2">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                              </div>
                              <span className="text-xs font-bold opacity-60">{formatCurrency(2450)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Floating cards */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl animate-bounce duration-[3000ms] hidden md:block">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Shield className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-black text-brand-gray-900 uppercase">100% Authentic</p>
                          </div>
                        </div>
                        
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-2xl animate-pulse duration-[4000ms] hidden md:block">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                              <Heart className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-black text-brand-gray-900 uppercase">Best Seller</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          case "cta":
            return (
              <section key="cta" className="py-16 md:py-24 bg-gradient-to-br from-[#1C0825] via-[#4B1D5F] to-[#2E0F3E] relative overflow-hidden">
                {/* Ambient Rose Gold Luxury Orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E2A9A9]/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#C8A2D6]/12 blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-[#E2A9A9]/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-xl">
                    <Sparkles className="w-4 h-4 text-[#E2A9A9]" />
                    <span className="text-[#E2A9A9] text-xs font-bold uppercase tracking-widest">Join Parloora Today</span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                    {content.cta_title || defaultContent.cta_title}
                  </h2>
                  <p className="text-white/80 text-sm md:text-base mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                    {content.cta_subtitle || defaultContent.cta_subtitle}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/signup" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="rosegold"
                        className="w-full sm:w-auto rounded-2xl px-9 h-13 font-black text-base shadow-xl shadow-[#E2A9A9]/30 hover:scale-105 active:scale-95 transition-all"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/parlours" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline-white"
                        className="w-full sm:w-auto rounded-2xl px-9 h-13 text-base font-bold hover:bg-white/15 transition-all"
                      >
                        Browse Parlours <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
