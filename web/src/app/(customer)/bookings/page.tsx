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
import { useI18n } from "@/lib/store/useI18n"
import { Database } from "@/types/supabase"

type Booking = Database["public"]["Tables"]["bookings"]["Row"]

export default function MyBookingsPage() {
  const { t, formatCurrency, formatDate, formatTime } = useI18n()
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)
  const [cancelModalId, setCancelModalId] = React.useState<string | null>(null)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: t("booking.statusConfirmed"), icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      case "cancelled":
        return { label: t("booking.statusCancelled"), icon: XCircle, class: "bg-red-50 text-red-700 border-red-200" }
      case "completed":
        return { label: t("booking.statusCompleted"), icon: CheckCircle2, class: "bg-brand-gray-50 text-brand-gray-700 border-brand-gray-200" }
      default:
        return { label: t("booking.statusPending"), icon: Clock3, class: "bg-amber-50 text-amber-700 border-amber-200" }
    }
  }

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
        alert(res.error || t("somethingWentWrong"))
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(t("somethingWentWrong"))
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-20">
      <div className="bg-white border-b pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">{t("common.bookings")}</h1>
          <p className="text-brand-gray-500">{t("nav.manageAppointments")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-brand-gray-500">{t("booking.fetchingBookings")}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 md:p-24 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-brand-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-brand-gray-900 mb-4">{t("booking.noBookingsYet")}</h2>
            <p className="text-brand-gray-500 mb-8 max-w-sm mx-auto">
              {t("booking.noBookingsSub")}
            </p>
            <Link href="/parlours">
              <Button size="lg" variant="rosegold" className="rounded-2xl px-8 h-13 font-black shadow-lg shadow-[#E2A9A9]/30">
                {t("booking.findParlour")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = getStatusConfig(booking.status || "pending")
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
                              💵 {t("home.cashOnService")}
                            </Badge>
                          ) : booking.payment_method ? (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2.5 py-0.5 font-bold uppercase">
                              💳 {booking.payment_method}
                            </Badge>
                          ) : null}
                          {booking.payment_status === 'refund_pending' && (
                            <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] px-2 py-0.5 font-semibold">
                              {t("booking.refundPending")}
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
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">{t("common.date")}</p>
                              <div className="flex items-center gap-2 text-brand-gray-700">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{booking.date ? formatDate(booking.date) : "—"}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">{t("common.time")}</p>
                              <div className="flex items-center gap-2 text-brand-gray-700">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">{booking.time ? formatTime(booking.time) : "—"}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-gray-400 uppercase font-bold tracking-widest">
                                {booking.payment_method === "cash" ? t("booking.payAtParlour") : t("common.total")}
                              </p>
                              <p className="text-lg font-black text-primary">{formatCurrency(booking.amount || 0)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="bg-brand-gray-50 p-6 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-brand-gray-100 min-w-[180px]">
                        <Link href={`/parlours/${booking.parlour_id}`} className="w-full">
                          <Button variant="outline" className="w-full rounded-xl bg-white border-[#4B1D5F]/20 text-[#4B1D5F] hover:bg-[#4B1D5F]/5 font-semibold">
                            {t("parlours.viewDetails")}
                          </Button>
                        </Link>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button 
                            variant="destructive" 
                            onClick={() => setCancelModalId(booking.id)}
                            className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all mt-1"
                          >
                            {t("booking.cancelBooking")}
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
            <h3 className="text-xl font-bold text-brand-gray-900 mb-2">{t("booking.cancelBookingConfirm")}</h3>
            <p className="text-brand-gray-500 mb-6 text-sm">
              {t("booking.cancelBookingWarning")}
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalId(null)} 
                disabled={cancellingId !== null}
                className="rounded-xl border-brand-gray-200"
              >
                {t("booking.keepBooking")}
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
                    {t("booking.cancelling")}
                  </>
                ) : (
                  t("booking.yesCancel")
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
