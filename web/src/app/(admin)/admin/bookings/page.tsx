"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, Search, Filter, Loader2, User, Store, Clock, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminTransactions, updateAdminBooking } from "@/lib/actions/admin"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function AdminBookingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking)
    setEditData({ ...booking })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedBooking?.id) return
    setIsSaving(true)
    const res = await updateAdminBooking(selectedBooking.id, {
      status: editData.status,
      // Add other fields if necessary
    })
    if (res.success) {
      setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, ...editData } : b))
      setSelectedBooking({ ...selectedBooking, ...editData })
      setIsEditing(false)
    } else {
      alert("Failed to save changes")
    }
    setIsSaving(false)
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminTransactions() // Re-using transaction fetch as it contains booking data
      setBookings(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.parlour_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.customer_name && b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Calendar className="w-6 h-6 text-emerald-600" />
            Booking Ledger
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Operational view of all appointments across the platform.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search booking ID, customer..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-emerald-500"
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
          <CardTitle className="text-base font-bold text-brand-gray-900">Service Appointments</CardTitle>
          <div className="flex gap-2">
             <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Active: {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              Pending: {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Calendar className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Booking Info</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Parlour</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                   {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-gray-900">{booking.service_name}</p>
                        <p className="text-[10px] text-brand-gray-400 font-mono mt-0.5 uppercase tracking-wider">#{booking.id.substring(0,8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-gray-100 flex items-center justify-center text-[10px] font-bold text-brand-gray-600">
                            {(booking.customer_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-brand-gray-800 text-xs">{booking.customer_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-brand-gray-400">{booking.customer_email || 'No Email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                          <Store className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-xs">{booking.parlour_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-600">
                          <Clock className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-xs">{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-brand-gray-400 ml-5">Requested: {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] font-bold border-0",
                          booking.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {booking.status}
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

      {/* Booking Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-24 bg-emerald-600 w-full" />
          <div className="px-6 pb-8 -mt-12 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Booking Status</Label>
                    <select 
                      value={editData?.status}
                      onChange={e => setEditData({...editData, status: e.target.value})}
                      className="w-full rounded-lg border border-brand-gray-200 h-10 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-brand-gray-400 italic">Changing the status will notify the customer and parlour immediately.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-brand-gray-400 uppercase tracking-widest mb-1">Booking #{selectedBooking?.id.substring(0,8)}</p>
                      <DialogTitle className="text-xl font-bold text-brand-gray-900">{selectedBooking?.service_name}</DialogTitle>
                    </div>
                    <Badge variant="outline" className={cn(
                      "uppercase text-[10px] font-bold border-0",
                      selectedBooking?.status?.toLowerCase() === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      selectedBooking?.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {selectedBooking?.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-brand-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Customer</p>
                        <p className="text-sm font-semibold text-brand-gray-700">{selectedBooking?.customer_name}</p>
                        <p className="text-[10px] text-brand-gray-400 truncate">{selectedBooking?.customer_email}</p>
                      </div>
                      <div className="p-3 bg-brand-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Parlour</p>
                        <p className="text-sm font-semibold text-brand-gray-700">{selectedBooking?.parlour_name}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-brand-gray-400 font-medium">Scheduled For</p>
                          <p className="text-sm font-semibold text-brand-gray-900">
                            {selectedBooking && new Date(selectedBooking.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
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
                    <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsEditing(true)}>
                      Edit Status
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
