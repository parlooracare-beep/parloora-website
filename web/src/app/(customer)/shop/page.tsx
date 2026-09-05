"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Search, ShoppingBag, Star, Filter, ChevronRight, Loader2, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import { getProducts } from "@/lib/actions/products"
import { Database } from "@/types/supabase"
import { useCart } from "@/lib/store/useCart"
import { motion, AnimatePresence } from "framer-motion"

type Product = Database["public"]["Tables"]["products"]["Row"]

const CATEGORIES = ["All", "Skincare", "Haircare", "Makeup", "Fragrance", "Tools"]

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState(searchParams.get("search") || "")
  const [category, setCategory] = React.useState("All")
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const { addItem, totalItems, openCart } = useCart()

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getProducts({ category, search })
      setProducts(data)
      setLoading(false)
    }
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [category, search])

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-brand-gray-900 tracking-tight">Parloora Shop</h1>
              <p className="text-brand-gray-500 max-w-md">Premium beauty products from verified sellers and parlours.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex gap-2 w-full sm:w-80">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..." 
                    className="pl-9 h-11 bg-brand-gray-50 border-brand-gray-200 rounded-xl focus:ring-primary w-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-11 w-11 lg:hidden rounded-xl bg-brand-gray-50 border-brand-gray-200 shrink-0"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                className="h-11 bg-primary hover:bg-primary/90 rounded-xl px-6 gap-2 w-full sm:w-auto animate-fade-in"
                onClick={openCart}
              >
                <ShoppingBag className="w-4 h-4" />
                Cart ({totalItems()})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <aside className="hidden lg:block w-64 space-y-6">
            <FilterContent 
              category={category} 
              setCategory={setCategory} 
              categories={CATEGORIES} 
            />
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-[360px] animate-pulse border border-brand-gray-100 p-3" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-brand-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-brand-gray-200" />
                </div>
                <h2 className="text-xl font-bold text-brand-gray-900 mb-2">No products found</h2>
                <p className="text-brand-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                <Button onClick={() => { setSearch(""); setCategory("All") }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group block h-full">
                    <Card className="overflow-hidden border border-brand-gray-100/80 bg-white rounded-3xl p-3 md:p-3.5 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                      {/* Square Image Box */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-gray-50 border border-brand-gray-100/60 mb-3">
                        {product.image_url ? (
                          <Image 
                            src={product.image_url} 
                            alt={product.name} 
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-brand-gray-300 bg-gradient-to-b from-brand-gray-50 to-brand-gray-100/50">
                            <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-primary/50 group-hover:scale-110 transition-transform">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <Badge className="bg-white/95 text-brand-gray-900 border-0 backdrop-blur-md shadow-sm text-[10px] uppercase font-black px-2.5 py-0.5 rounded-lg">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Card Info */}
                      <div className="flex-1 flex flex-col px-1">
                        <div className="mb-1.5">
                          <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-0.5">
                            {product.brand || "Parloora Selection"}
                          </p>
                          <h3 className="font-bold text-brand-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn("w-3 h-3", s <= (Number(product.rating) || 5) ? "text-amber-400 fill-amber-400" : "text-brand-gray-200")} />
                            ))}
                          </div>
                          <span className="text-[10px] text-brand-gray-400 font-semibold">(42)</span>
                        </div>
                        
                        {/* Price & Action Row */}
                        <div className="mt-auto pt-2.5 border-t border-brand-gray-100 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-base md:text-lg font-black text-brand-gray-900 tracking-tight block truncate">
                              {formatCurrency(Number(product.price))}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem(product);
                              openCart();
                            }}
                            className="bg-brand-gray-900 hover:bg-primary text-white rounded-xl px-3.5 h-8 md:h-9 text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 shrink-0 active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-brand-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-brand-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <FilterContent 
                  category={category} 
                  setCategory={(cat: string) => {
                    setCategory(cat);
                    setIsFilterOpen(false);
                  }} 
                  categories={CATEGORIES} 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterContent({ category, setCategory, categories }: { category: string, setCategory: (cat: string) => void, categories: string[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-brand-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Categories
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                category === cat 
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20" 
                  : "text-brand-gray-600 hover:bg-white hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
        <h4 className="font-bold text-primary text-sm mb-2">Member Rewards</h4>
        <p className="text-xs text-brand-gray-600 leading-relaxed">
          Earn 5 points for every {formatCurrency(100)} spent in the shop. Redeem points for free services!
        </p>
      </div>
    </div>
  )
}
