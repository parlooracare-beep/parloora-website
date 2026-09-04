"use client"

import * as React from "react"
import Image from "next/image"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Package, Search, Filter, ChevronRight, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowLeft, Download, ExternalLink, MoreVertical
} from "lucide-react"

import { Button } from "@/components/ui/button"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import { getSellerOrders, updateOrderStatus } from "@/lib/actions/orders"
import { createClient } from "@/lib/supabase/client"

export default function SellerOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const data = await getSellerOrders(user.id)
        setOrders(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.includes(searchTerm)
    const matchesStatus = statusFilter === "All" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const res = await updateOrderStatus(orderId, newStatus)
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-gray-900">Product Orders</h1>
          <p className="text-brand-gray-500 text-sm">Manage and track your product sales across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-brand-gray-200">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button className="bg-primary text-white rounded-xl">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-brand-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-gray-400" />
          <Input 
            placeholder="Search by customer or order ID..." 
            className="pl-10 rounded-xl border-brand-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Processing", "Shipped", "Delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                statusFilter === status 
                  ? "bg-brand-gray-900 text-white shadow-lg" 
                  : "bg-brand-gray-50 text-brand-gray-500 hover:bg-brand-gray-100"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <Card className="border-brand-gray-100 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-brand-gray-500 font-medium">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-20 text-center">
              <Package className="w-12 h-12 text-brand-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-brand-gray-900">No orders found</h3>
              <p className="text-brand-gray-500">Adjust your filters or wait for new sales!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-gray-50/50 border-b">
                    <th className="text-left text-xs font-black text-brand-gray-400 uppercase tracking-widest px-6 py-4">Order Details</th>
                    <th className="text-left text-xs font-black text-brand-gray-400 uppercase tracking-widest px-4 py-4">Items</th>
                    <th className="text-right text-xs font-black text-brand-gray-400 uppercase tracking-widest px-4 py-4">Revenue</th>
                    <th className="text-center text-xs font-black text-brand-gray-400 uppercase tracking-widest px-4 py-4">Status</th>
                    <th className="text-right text-xs font-black text-brand-gray-400 uppercase tracking-widest px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-gray-50/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold">
                            {order.customer_name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-brand-gray-900">{order.customer_name}</p>
                            <p className="text-[10px] text-brand-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-brand-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex -space-x-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {order.items?.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="relative w-8 h-8 rounded-lg border-2 border-white bg-brand-gray-50 overflow-hidden">
                              {item.image_url && <Image src={item.image_url} alt="" fill className="object-cover" />}
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-8 h-8 rounded-lg border-2 border-white bg-brand-gray-200 flex items-center justify-center text-[10px] font-bold text-brand-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-brand-gray-500 mt-2 font-medium">{order.items_count} items</p>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <p className="text-sm font-black text-brand-gray-900">{formatCurrency(order.total_amount)}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Paid</p>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <Badge className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-0",
                          order.status === "Processing" ? "bg-amber-100 text-amber-600" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === "Processing" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, "Shipped")}
                              className="bg-primary text-white rounded-lg text-xs"
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === "Shipped" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(order.id, "Delivered")}
                              className="bg-emerald-500 text-white rounded-lg text-xs"
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="rounded-lg text-brand-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
