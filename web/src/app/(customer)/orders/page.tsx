"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Package, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { getCustomerOrders } from "@/lib/actions/orders"
import { Database } from "@/types/supabase"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = Database["public"]["Tables"]["orders"]["Row"] & { items?: any[] }

export default function MyOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getCustomerOrders()
      setOrders(data as unknown as Order[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <div className="bg-white border-b pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">My Orders</h1>
          <p className="text-brand-gray-500">Track your purchases and view order history.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-brand-gray-500">Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 md:p-24 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-brand-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-brand-gray-900 mb-4">No orders yet</h2>
            <p className="text-brand-gray-500 mb-8 max-w-sm mx-auto">
              Explore our curated collection of luxury beauty products and wellness items.
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl px-8 h-14 font-semibold">
                Go to Shop <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-all rounded-3xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                          {order.status}
                        </Badge>
                        <span className="text-[10px] text-brand-gray-400 font-mono tracking-tighter">ORDER #{order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-gray-50 flex items-center justify-center border border-brand-gray-100">
                          <Package className="w-6 h-6 text-brand-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-brand-gray-900 mb-0.5">{order.items_count} Items Purchased</p>
                          <p className="text-sm font-semibold text-brand-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar mt-4">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="relative w-12 h-12 rounded-xl bg-brand-gray-50 border border-brand-gray-100 flex-shrink-0 overflow-hidden group-hover:border-primary/20 transition-colors">
                              {item.image_url ? (
                                <Image src={item.image_url} alt="" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-brand-gray-300" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-brand-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-brand-gray-100 flex flex-col justify-between items-end min-w-[200px]">
                      <div className="text-right w-full">
                        <p className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-2xl font-black text-brand-gray-900">{formatCurrency(order.total_amount || 0)}</p>
                      </div>
                      <div className="flex flex-col gap-2 w-full mt-6">
                        <Button variant="outline" className="w-full rounded-xl bg-white border-brand-gray-200 shadow-sm">
                          View Invoice
                        </Button>
                        <Button className="w-full rounded-xl bg-brand-gray-900 hover:bg-brand-gray-800 text-white shadow-sm">
                          Track Order
                        </Button>
                      </div>
                    </div>
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
