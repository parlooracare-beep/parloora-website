"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ShoppingBag, Search, Filter, Loader2, User, Truck, Clock, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminOrders, updateAdminOrder } from "@/lib/actions/admin"
import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function AdminOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setEditData({ ...order })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedOrder?.id) return
    setIsSaving(true)
    const res = await updateAdminOrder(selectedOrder.id, {
      status: editData.status
    })
    if (res.success) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, ...editData } : o))
      setSelectedOrder({ ...selectedOrder, ...editData })
      setIsEditing(false)
    } else {
      alert("Failed to save changes")
    }
    setIsSaving(false)
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminOrders()
      setOrders(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.users?.display_name && o.users.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            Order Management
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Full visibility into retail orders and fulfillment status.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search order ID, user..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white border-brand-gray-200 hover:bg-brand-gray-50 h-10 px-3">
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filter</span>
          </Button>
        </div>
      </div>

      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-base font-bold text-brand-gray-900">Retail Orders</CardTitle>
          <div className="flex gap-2">
             <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Total Volume: {formatCurrency(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              Unfulfilled: {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <ShoppingBag className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                   {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                      onClick={() => handleViewDetails(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Package className="w-4 h-4 text-brand-gray-400" />
                           <span className="font-mono text-xs font-bold text-brand-gray-700 tracking-wider">ORD-{order.id.substring(0,6).toUpperCase()}</span>
                        </div>
                        <p className="text-[10px] text-brand-gray-400 mt-1 ml-6">{new Date(order.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="font-medium text-brand-gray-800">{order.users?.display_name || 'Anonymous'}</span>
                        </div>
                        <p className="text-[10px] text-brand-gray-400 ml-5">{order.users?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-indigo-50/50 text-indigo-600 font-bold">
                          {order.items_count || 1} {order.items_count === 1 ? 'Item' : 'Items'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-gray-900">{formatCurrency(order.total_amount)}</p>
                        <p className="text-[10px] text-emerald-600 font-medium capitalize">{order.payment_status || 'Paid'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold border-0",
                          order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-brand-gray-100 text-brand-gray-700'
                        )}>
                          {order.status || 'Processing'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-24 bg-brand-gray-900 w-full flex items-center justify-center">
             <Package className="w-10 h-10 text-white/20" />
          </div>
          <div className="px-6 pb-8 -mt-12 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Fulfillment Status</Label>
                    <select 
                      value={editData?.status}
                      onChange={e => setEditData({...editData, status: e.target.value})}
                      className="w-full rounded-lg border border-brand-gray-200 h-10 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-brand-gray-400 uppercase tracking-widest mb-1">Order ORD-{selectedOrder?.id.substring(0,6).toUpperCase()}</p>
                      <DialogTitle className="text-xl font-bold text-brand-gray-900">Retail Purchase</DialogTitle>
                    </div>
                    <Badge variant="outline" className={cn(
                      "uppercase text-[10px] font-bold border-0",
                      selectedOrder?.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      selectedOrder?.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      selectedOrder?.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-brand-gray-100 text-brand-gray-700'
                    )}>
                      {selectedOrder?.status || 'Processing'}
                    </Badge>
                  </div>
                  
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-brand-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Customer</p>
                        <p className="text-sm font-semibold text-brand-gray-700">{selectedOrder?.users?.display_name}</p>
                      </div>
                      <div className="p-3 bg-brand-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Total Amount</p>
                        <p className="text-sm font-bold text-brand-gray-900">{formatCurrency(selectedOrder?.total_amount)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-brand-gray-400 font-medium">Order Date</p>
                          <p className="text-sm font-semibold text-brand-gray-900">
                            {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-brand-gray-100 flex gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl bg-brand-gray-900 text-white hover:bg-black"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>
                      Close
                    </Button>
                    <Button className="flex-1 rounded-xl bg-brand-gray-900 text-white hover:bg-black" onClick={() => setIsEditing(true)}>
                      Update Fulfillment
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
