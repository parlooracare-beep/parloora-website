import Link from "next/link"
import { Sparkles, Compass, ShoppingBag, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest">Error 404 • Page Not Found</span>
        </div>

        {/* 404 Big Number */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-brand-gray-900 mb-2 select-none">
          4<span className="text-primary italic">0</span>4
        </h1>

        {/* Main Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-brand-gray-900 mb-4 tracking-tight">
          A Beauty Moment Lost in Transit
        </h2>

        {/* Description */}
        <p className="text-brand-gray-500 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The page or service you are searching for might have been renamed, moved, or is temporarily unavailable. Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>

          <Link
            href="/parlours"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-gray-50 text-brand-gray-900 font-bold px-8 py-4 rounded-2xl border border-brand-gray-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-primary" />
            Explore Parlours
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-gray-50 text-brand-gray-900 font-bold px-8 py-4 rounded-2xl border border-brand-gray-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4 text-secondary" />
            Browse Shop
          </Link>
        </div>

        {/* Helpful Category Links */}
        <div className="pt-8 border-t border-brand-gray-200/80">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gray-400 mb-4">
            Popular Destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Hair Salons", href: "/parlours?category=Hair" },
              { label: "Spa & Wellness", href: "/parlours?category=Spa" },
              { label: "Skin Care", href: "/parlours?category=Skincare" },
              { label: "Makeup Artists", href: "/parlours?category=Makeup" },
              { label: "Beauty Blog", href: "/blog" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-brand-gray-600 bg-white hover:text-primary hover:border-primary/30 border border-brand-gray-200 px-3.5 py-1.5 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
