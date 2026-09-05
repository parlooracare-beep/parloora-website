"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, ChevronRight, Star, ShoppingBag, Truck, ShieldCheck, 
  RotateCcw, Share2, Heart, Plus, Minus, CheckCircle2, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { getProductById } from "@/lib/actions/products"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"
import { useCart } from "@/lib/store/useCart"

type Product = Database["public"]["Tables"]["products"]["Row"]

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { addItem, openCart } = useCart()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [quantity, setQuantity] = React.useState(1)
  const [isOrdering, setIsOrdering] = React.useState(false)
  const [addedToCart, setAddedToCart] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getProductById(id)
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    openCart()
  }

  const handleBuyNow = () => {
    if (!product) return
    setIsOrdering(true)
    addItem(product, quantity)
    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-brand-gray-900">Product not found</h2>
        <Button asChild variant="outline">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 text-brand-gray-600 hover:text-primary transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-brand-gray-500 mb-8">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-gray-400">{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-gray-900 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-brand-gray-100 shadow-sm relative group">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-gray-200 bg-brand-gray-50">
                  <ShoppingBag className="w-24 h-24" />
                </div>
              )}
              <button className="absolute top-4 right-4 p-3 rounded-full bg-white/80 backdrop-blur-md text-brand-gray-400 hover:text-red-500 transition-all shadow-sm">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            {/* Thumbnails (Mock) */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-xl border border-brand-gray-100 cursor-pointer hover:border-primary transition-colors overflow-hidden">
                  <div className="w-full h-full bg-brand-gray-50 flex items-center justify-center opacity-50">
                    <ShoppingBag className="w-6 h-6 text-brand-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase text-[10px] tracking-widest font-black">
                  {product.category}
                </Badge>
                {product.stock && product.stock > 0 ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <p className="text-sm font-black text-primary uppercase tracking-widest mb-1">{product.brand || "Parloora Exclusive"}</p>
              <h1 className="text-3xl md:text-4xl font-black text-brand-gray-900 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("w-4 h-4", s <= (product.rating || 5) ? "text-amber-400 fill-amber-400" : "text-brand-gray-200")} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-brand-gray-900 ml-1">{product.rating || 5.0}</span>
                </div>
                <span className="text-brand-gray-400 text-sm border-l pl-4">124 Orders</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-brand-gray-100 shadow-sm space-y-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-brand-gray-900">{formatCurrency(Number(product.price))}</span>
                <span className="text-brand-gray-400 text-sm mb-1 line-through">{formatCurrency(Number(product.price) * 1.2)}</span>
                <Badge className="mb-1.5 bg-rose-50 text-rose-600 border-rose-100">-20% OFF</Badge>
              </div>

              <div className="space-y-4 pt-4 border-t border-brand-gray-50">
                <p className="text-sm font-bold text-brand-gray-700 uppercase tracking-wide">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-brand-gray-200 rounded-xl overflow-hidden h-12">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 hover:bg-brand-gray-50 text-brand-gray-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-brand-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 hover:bg-brand-gray-50 text-brand-gray-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-brand-gray-400">Limit 10 per customer</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  className={cn(
                    "h-14 flex-1 rounded-2xl border-brand-gray-200 hover:bg-brand-gray-50 font-bold transition-all",
                    addedToCart && "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:text-white"
                  )}
                >
                  {addedToCart ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 animate-bounce" /> Added!
                    </span>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  disabled={isOrdering || !product.stock}
                  className="h-14 flex-1 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all rounded-2xl font-black text-base"
                >
                  {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy Now"}
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Truck, text: "Free Delivery", sub: `Orders over ${formatCurrency(500)}` },
                { icon: ShieldCheck, text: "Authentic", sub: "100% Guaranteed" },
                { icon: RotateCcw, text: "7 Days Return", sub: "Easy returns" },
                { icon: Share2, text: "Share Product", sub: "With friends" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-brand-gray-50 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-gray-900">{f.text}</p>
                    <p className="text-[10px] text-brand-gray-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-gray-900 flex items-center gap-2">
                Description
              </h3>
              <p className="text-sm text-brand-gray-600 leading-relaxed bg-white p-6 rounded-3xl border border-brand-gray-50 shadow-sm">
                {product.description || "No description available for this product."}
                {"\n\n"}
                This premium selection has been curated for the Parloora community. Each item is verified for quality and authenticity. Perfect for professional use or at-home beauty routines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
