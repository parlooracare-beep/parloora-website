"use client"

import * as React from "react"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Calendar, Clock, MapPin, Tag, ArrowRight, CheckCircle2, Clock3, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getCustomerBookings, cancelBooking } from "@/lib/actions/bookings"
import { Database } from "@/types/supabase"

type Booking = Database["public"]["Tables"]["bookings"]["Row"]

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending Approval", icon: Clock3, class: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "Completed", icon: CheckCircle2, class: "bg-brand-gray-50 text-brand-gray-700 border-brand-gray-200" },
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)
  const [cancelModalId, setCancelModalId] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getCustomerBookings()
      setBookings(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleCancelBooking = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await cancelBooking(id)
      if (res.success) {
        setBookings(prev => 
          prev.map(b => 
            b.id === id 
              ? { 
                  ...b, 
                  status: 'cancelled', 
                  payment_status: b.payment_status === 'paid' ? 'refund_pending' : b.payment_status 
                } 
              : b
          )
        )
        setCancelModalId(null)
      } else {
        alert(res.error || "Failed to cancel booking")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("An unexpected error occurred.")
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <div className="bg-white border-b pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">My Bookings</h1>
          <p className="text-brand-gray-500">Track your upcoming appointments and booking history.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-brand-gray-500">Fetching your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 md:p-24 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-brand-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-brand-gray-900 mb-4">No bookings yet</h2>
            <p className="text-brand-gray-500 mb-8 max-w-sm mx-auto">
              Your scheduled appointments will appear here. Ready to pamper yourself?
            </p>
            <Link href="/parlours">
              <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl px-8 h-14 font-semibold">
                Find a Parlour <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
              const StatusIcon = status.icon

              return (
                <Card key={booking.id} className="border-0 shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Status & Main Info */}
                      <div className="p-6 flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <Badge className={cn("border-0 gap-1.5 px-3 py-1 text-xs", status.class)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </Badge>
                          {booking.payment_method === "cash" ? (
                            <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 font-bold">
                              💵 Cash on Service
                            </Badge>
                          ) : booking.payment_method ? (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2.5 py-0.5 font-bold uppercase">
                              💳 {booking.payment_method}
                            </Badge>
                          ) : null}
                          {booking.payment_status === 'refund_pending' && (
                            <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] px-2 py-0.5 font-semibold">
                              Refund Pending
                            </Badge>
                          )}
                          <span className="text-[10px] text-brand-gray-400 font-mono tracking-tighter">REF: {booking.id.substring(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div>
                            <h3 className="text-xl font-bold text-brand-gray-900 group-hover:text-primary transition-colors mb-1">{booking.parlour_name}</h3>
                            <p className="text-brand-gray-600 font-medium">{booking.service_name}</p>
                          </div>

                          <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">Date</p>
                              <div className="flex items-center gap-2 text-brand-gray-700">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{booking.date}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">Time</p>
                              <div className="flex items-center gap-2 text-brand-gray-700">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{booking.time}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">
                                {booking.payment_method === "cash" ? "Pay at Parlour" : "Amount"}
                              </p>
                              <p className="text-lg font-black text-primary">৳{booking.amount?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="bg-brand-gray-50 p-6 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-brand-gray-100 min-w-[180px]">
                        <Link href={`/parlours/${booking.parlour_id}`} className="w-full">
                          <Button variant="outline" className="w-full rounded-xl bg-white border-brand-gray-200">
                            View Parlour
                          </Button>
                        </Link>
                        <Button className="w-full rounded-xl bg-brand-gray-900 hover:bg-brand-gray-800 text-white font-semibold">
                          Get Support
                        </Button>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button 
                            variant="destructive" 
                            onClick={() => setCancelModalId(booking.id)}
                            className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all mt-1"
                          >
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-brand-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-brand-gray-500 mb-6 text-sm">
              Are you sure you want to cancel this booking? This action cannot be undone. 
              Please note bookings can only be cancelled at least 24 hours in advance.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalId(null)} 
                disabled={cancellingId !== null}
                className="rounded-xl border-brand-gray-200"
              >
                No, Keep It
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleCancelBooking(cancelModalId)} 
                disabled={cancellingId !== null}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-1.5 min-w-[110px]"
              >
                {cancellingId === cancelModalId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
