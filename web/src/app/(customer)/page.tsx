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

const defaultContent = {
  hero_title: "Book Your Self-Care Services in Seconds",
  hero_subtitle: "Discover top-rated beauty parlours, salons, and spas near you. Real-time booking, verified professionals, guaranteed satisfaction.",
  hero_pill_text: "The World's #1 Beauty Booking Marketplace",
  shop_title: "Shop Premium Beauty Products",
  shop_subtitle: "We've partnered with top brands to bring you the best skincare, haircare, and makeup. Order now and get it delivered to your doorstep.",
  cta_title: "Ready to Glow Up?",
  cta_subtitle: "Join over 50,000 customers who trust Parloora for their beauty needs. Sign up free and book your first appointment today."
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
  { name: "Hair & Styling", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Makeup & Beauty", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Skincare & Facials", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Nail Art", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Waxing & Threading", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Massage & Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "Bridal Package", image: "https://images.unsplash.com/photo-1595085816353-d1f5e2239fc4?auto=format&fit=crop&w=400&q=80", count: "Browse" },
  { name: "All Services", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80", count: "Browse" },
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

// Force dynamic rendering (uses cookies via Supabase auth)
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch all homepage data in parallel with a 10s safety timeout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [featuredParlours, dynamicContent, dbCategories, recommendedParloursData]: any =
    await Promise.race([
      Promise.all([
        getFeaturedParlours(),
        getHomepageContent() as Promise<HomepageContent | null>,
        getServiceCategories(),
        getParlours({ sortBy: "Highest Rated" })
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Promise<any[]>((resolve) =>
        setTimeout(() => resolve([[], null, [], []]), 10000)
      )
    ])

  const pageSections = await getHomepageSections()

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
              <section key="hero" className="relative min-h-[60vh] flex items-center overflow-hidden">
                {/* Deep Purple & Rose Gold Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D0072] via-[#4A148C] to-[#E6B7A9]/40" />
                
                {/* Animated Decorative Blobs */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-400/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-400/20 blur-[80px]" />
                
                {/* Dot pattern overlay */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                />

                <div className="container mx-auto px-4 md:px-6 relative z-10 py-10 md:py-24">
                  <div className="max-w-4xl mx-auto text-center">
                    {/* Pill Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8 backdrop-blur-md shadow-2xl">
                      <Sparkles className="w-4 h-4 text-[#E6B7A9]" />
                      <span className="text-white/90 text-xs font-bold uppercase tracking-widest">{content.hero_pill_text || defaultContent.hero_pill_text}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                      {(content.hero_title || defaultContent.hero_title).split(' ').map((word, i) => (
                        <span key={i} className={i > 3 ? "text-[#E6B7A9]" : ""}>{word} </span>
                      ))}
                    </h1>

                    <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium">
                      {content.hero_subtitle || defaultContent.hero_subtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
                      <HeroSearch />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-10 text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10"><Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> 500+ Verified</span>
                      <span className="flex items-center gap-2 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10"><Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-current" /> 4.9 Rating</span>
                      <span className="flex items-center gap-2 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" /> Instant Book</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Wave - Tinted Rose */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 80L60 74.7C120 69.3 240 58.7 360 53.3C480 48 600 48 720 53.3C840 58.7 960 69.3 1080 74.7C1200 80 1320 80 1380 80H1440V80H0V80Z" fill="#fdf4ff" />
                  </svg>
                </div>
              </section>
            )
          case "recommended":
            return (
              <Fragment key="recommended">
                <section className="py-8 bg-gradient-to-br from-[#fdf4ff] to-[#fce7f3] relative overflow-hidden">
                  <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl md:text-2xl font-bold text-brand-gray-900 tracking-tight">Recommended</h2>
                      <div className="hidden md:flex items-center gap-1.5">
                        <button className="w-8 h-8 rounded-full bg-white shadow-sm border flex items-center justify-center hover:bg-brand-gray-50 transition-colors">
                          <ChevronLeft className="w-4 h-4 text-brand-gray-660" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-white shadow-sm border flex items-center justify-center hover:bg-brand-gray-50 transition-colors">
                          <ChevronRight className="w-4 h-4 text-brand-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {recommendedParlours.map((parlour: any, idx: number) => (
                        <Link key={parlour.id} href={`/parlours/${parlour.id}`} className="w-[168px] md:w-[192px] shrink-0 snap-start group">
                          <div className="flex flex-col gap-2 h-full">
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-brand-gray-200 relative shadow-sm">
                              <Image 
                                src={`https://images.unsplash.com/photo-${RECOMMENDED_IMAGES[idx % RECOMMENDED_IMAGES.length]}?auto=format&fit=crop&w=400&q=80`} 
                                alt={parlour.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="px-0.5">
                              <div className="flex items-start justify-between gap-1 mb-0.5">
                                <h3 className="font-bold text-brand-gray-900 leading-tight text-xs md:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {formatParlourName(parlour.name)}
                                </h3>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="font-bold text-xs text-brand-gray-900">{parlour.rating || 5.0}</span>
                                  <span className="text-[10px] text-brand-gray-500">({parlour.total_bookings || 0})</span>
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

                <section className="py-20 bg-brand-gray-50">
                  <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-end justify-between mb-12">
                      <div>
                        <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10">Hand-picked for you</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-gray-900">
                          Featured Parlours
                        </h2>
                      </div>
                      <Link href="/parlours" className="hidden md:flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm transition-colors">
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {featuredParlours.length > 0 ? featuredParlours.map((parlour: any) => (
                        <Link key={parlour.id} href={`/parlours/${parlour.id}`}>
                          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-brand-gray-100 h-full">
                            {/* Image Placeholder with gradient */}
                            <div className="relative aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Scissors className="w-12 h-12 md:w-16 md:h-16 text-white/20" />
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-[8px] md:text-xs px-1.5 py-0 md:px-2.5 md:py-0.5">Featured</Badge>
                              </div>
                            </div>
                            <CardContent className="p-2.5 md:p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-brand-gray-900 group-hover:text-primary transition-colors text-sm md:text-base line-clamp-1">
                                {formatParlourName(parlour.name)}
                              </h3>
                              <p className="text-[10px] md:text-xs text-brand-gray-500 mt-0.5 line-clamp-1">{parlour.type || "Parlour"} · {parlour.city}</p>
                              <div className="mt-auto flex items-center justify-between pt-2 md:pt-3 border-t border-brand-gray-100">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="text-xs md:text-sm font-semibold text-brand-gray-800">{parlour.rating || 5.0}</span>
                                  <span className="hidden xs:inline text-[9px] text-brand-gray-400 font-medium">({parlour.total_bookings || 0})</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )) : (
                        <p className="text-brand-gray-500">No featured parlours found.</p>
                      )}
                    </div>

                    <div className="text-center mt-10 md:hidden">
                      <Link href="/parlours">
                        <Button variant="outline" className="border-primary text-primary">
                          View All Parlours <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>
              </Fragment>
            )
          case "near-you":
            return <NearYouSection key="near-you" />
          case "categories":
            return (
              <section key="categories" className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="text-center mb-12">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Our Services</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-gray-900 mb-4">
                      What Are You Looking For?
                    </h2>
                    <p className="text-brand-gray-500 max-w-lg mx-auto">
                      From everyday grooming to special occasion glam, we have every beauty service you need.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {displayCategories.map((cat: any) => {
                      return (
                        <Link
                          key={cat.name}
                          href={`/parlours?category=${encodeURIComponent(cat.name)}`}
                          className="group"
                        >
                          <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-brand-gray-100 h-full">
                            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300 border-2 border-white group-hover:shadow-md bg-brand-gray-100 relative">
                                <Image 
                                  src={cat.image} 
                                  alt={cat.name} 
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-brand-gray-800 text-sm">{cat.name}</p>
                                <p className="text-xs text-brand-gray-400 mt-0.5">{cat.count}</p>
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
              <section key="steps" className="py-10 md:py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="text-center mb-16">
                    <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">Simple & Fast</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-gray-900 mb-4">
                      Book in 3 Easy Steps
                    </h2>
                    <p className="text-brand-gray-500 max-w-md mx-auto">
                      Getting your beauty appointment has never been easier. No calls, no waiting.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-14 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-300 via-rose-300 to-amber-300" />

                    {steps.map((s) => (
                      <div key={s.step} className="flex flex-col items-center text-center">
                        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-xl relative z-10`}>
                          <span className="text-4xl font-black text-white/30">{s.step}</span>
                        </div>
                        <h3 className="text-xl font-bold text-brand-gray-900 mb-3">{s.title}</h3>
                        <p className="text-brand-gray-500 leading-relaxed text-sm">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case "shop":
            return (
              <section key="shop" className="py-10 md:py-12 bg-brand-gray-900 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -ml-32 -mb-32" />
                
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">New Feature</span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                        {content.shop_title || defaultContent.shop_title}
                      </h2>
                      
                      <p className="text-brand-gray-400 text-sm max-w-md mx-auto lg:mx-0 leading-relaxed">
                        {content.shop_subtitle || defaultContent.shop_subtitle}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        <Link href="/shop" className="w-full sm:w-auto">
                          <Button size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-6 text-sm font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            Visit Shop <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-gray-900 bg-brand-gray-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden relative">
                              <Image src={`https://i.pravatar.cc/40?u=${i}`} alt="user" fill className="object-cover opacity-50" />
                            </div>
                          ))}
                          <div className="w-10 h-10 rounded-full border-2 border-brand-gray-900 bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                            +5k
                          </div>
                        </div>
                        <p className="text-xs text-brand-gray-500 font-medium italic">Join 5,000+ shoppers this week</p>
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
              <section key="cta" className="py-12 md:py-16 bg-gradient-to-br from-[#2D0072] via-[#4A148C] to-[#880E4F] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                    {content.cta_title || defaultContent.cta_title}
                  </h2>
                  <p className="text-white/70 text-sm md:text-base mb-8 max-w-lg mx-auto">
                    {content.cta_subtitle || defaultContent.cta_subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <Link href="/signup" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full bg-white text-primary hover:bg-white/90 shadow-xl shadow-purple-900/30 rounded-full px-8 font-bold text-sm h-12"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/parlours" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-white/30 bg-white/5 text-white hover:bg-white/10 rounded-full px-8 text-sm h-12 font-bold backdrop-blur-sm"
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
