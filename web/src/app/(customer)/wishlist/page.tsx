"use client"

import * as React from "react"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Heart, MapPin, Star, Search, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCustomerWishlist, toggleFavorite } from "@/lib/actions/favorites"
import { Database } from "@/types/supabase"

type Parlour = Database["public"]["Tables"]["parlours"]["Row"]

const CARD_GRADIENTS = [
  "from-violet-400/30 to-purple-600/30",
  "from-rose-300/30 to-pink-500/30",
  "from-amber-300/30 to-orange-500/30",
  "from-sky-300/30 to-blue-500/30",
]

export default function WishlistPage() {
  const [wishlist, setWishlist] = React.useState<Parlour[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getCustomerWishlist()
      setWishlist(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleRemove = async (parlourId: string) => {
    const res = await toggleFavorite(parlourId)
    if (res.success) {
      setWishlist(prev => prev.filter(p => p.id !== parlourId))
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">Your Favorites</h1>
              <p className="text-brand-gray-500">Manage the parlours and salons you love the most.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/20">
                {wishlist.length} saved spots
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-24 text-center border-0">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-brand-gray-500">Fetching your favorites...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 md:p-24 text-center border-0 max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-brand-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-brand-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Start exploring top-rated parlours and click the heart icon to save them for later!
            </p>
            <Link href="/parlours">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl px-8 h-14 font-semibold text-lg shadow-lg shadow-primary/30">
                Explore Parlours <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((parlour, i) => (
              <Card key={parlour.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg h-full">
                {/* Image Placeholder */}
                <div className={`h-40 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} relative`}>
                  <button 
                    onClick={() => handleRemove(parlour.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white shadow-lg z-10 hover:scale-110 transition-transform"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <CardContent className="p-5">
                  <Badge className="bg-brand-gray-100 text-brand-gray-600 border-0 mb-3 text-[10px] uppercase tracking-wider font-bold">
                    {parlour.type}
                  </Badge>
                  <h3 className="font-bold text-brand-gray-900 mb-1 group-hover:text-primary transition-colors truncate">
                    {parlour.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-brand-gray-500 mb-4">
                    <MapPin className="w-3 h-3" /> {parlour.city}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-gray-50">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-brand-gray-800">{parlour.rating || 5.0}</span>
                    </div>
                    <Link href={`/parlours/${parlour.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary font-bold hover:text-primary hover:bg-primary/5 p-0 h-auto">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
