"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSellerBookings, updateBookingStatus } from "@/lib/actions/bookings"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"

type Booking = Database["public"]["Tables"]["bookings"]["Row"]

const STATUS_MAP = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", icon: Clock, class: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "Completed", icon: CheckCircle2, class: "bg-brand-gray-100 text-brand-gray-600 border-brand-gray-200" },
  no_show: { label: "No Show", icon: XCircle, class: "bg-orange-50 text-orange-700 border-orange-200" },
}

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const b = await getSellerBookings(user.id)
      setBookings(b)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)
    const res = await updateBookingStatus(bookingId, newStatus)
    if (res.success) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
    } else {
      alert("Failed to update status")
    }
    setUpdatingId(null)
  }

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
        <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Manage Bookings
        </h2>
        {/* Simple stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1 text-sm border-brand-gray-200">
            Total: {bookings.length}
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-sm">
            Pending: {bookings.filter(b => b.status === "pending").length}
          </Badge>
        </div>
      </div>

      <Card className="border-brand-gray-100">
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500">
              <Calendar className="w-12 h-12 text-brand-gray-300 mx-auto mb-3" />
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-brand-gray-50/50">
                    <th className="text-left text-xs font-semibold text-brand-gray-500 px-6 py-4">Booking ID</th>
                    <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-4">Customer</th>
                    <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-4">Service</th>
                    <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-4">Date & Time</th>
                    <th className="text-right text-xs font-semibold text-brand-gray-500 px-4 py-4">Amount</th>
                    <th className="text-center text-xs font-semibold text-brand-gray-500 px-6 py-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-50">
                  {bookings.map((booking) => {
                    const statusKey = booking.status as keyof typeof STATUS_MAP
                    const status = STATUS_MAP[statusKey] || STATUS_MAP.pending
                    const StatusIcon = status.icon

                    return (
                      <tr key={booking.id} className="hover:bg-brand-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs text-brand-gray-400 font-mono">
                          {booking.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                              {booking.customer_name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-brand-gray-800">{booking.customer_name || "Unknown Customer"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-brand-gray-700 font-medium">{booking.service_name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs text-brand-gray-600">
                            <p className="font-semibold text-brand-gray-800">{booking.date}</p>
                            <p className="flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-brand-gray-400" /> {booking.time}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-brand-gray-900">
                          ৳{(booking.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={cn("text-xs gap-1", status.class)}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            
                            {/* Approve / Decline for pending */}
                            {booking.status === "pending" && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                  className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded font-semibold transition-colors disabled:opacity-50"
                                >
                                  {updatingId === booking.id ? "..." : "Approve"}
                                </button>
                                <button
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="text-[10px] bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-semibold transition-colors disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {/* Mark as Completed for confirmed bookings */}
                            {booking.status === "confirmed" && (
                              <button
                                disabled={updatingId === booking.id}
                                onClick={() => handleUpdateStatus(booking.id, "completed")}
                                className="text-[10px] bg-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-200 px-2 py-1 rounded font-semibold transition-colors mt-1 disabled:opacity-50"
                              >
                                {updatingId === booking.id ? "..." : "Mark Done"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
