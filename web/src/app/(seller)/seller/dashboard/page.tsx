"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp, TrendingDown, Calendar, DollarSign, Users, Star,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Scissors
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getSellerBookings, getBookingStats, getSellerMetrics } from "@/lib/actions/bookings"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/supabase"
import { Loader2 } from "lucide-react"
import { getSellerProfile } from "@/lib/actions/seller-profile"
import { ProfileCompletionRing } from "@/components/shared/ProfileCompletionRing"
import { ProfileCompletionBanner } from "@/components/shared/ProfileCompletionBanner"

type Booking = Database["public"]["Tables"]["bookings"]["Row"]
type BookingStat = { day: string, revenue: number, bookings: number }

const STATUS_MAP = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", icon: Clock, class: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "bg-red-50 text-red-700 border-red-200" },
}


export default function SellerDashboardPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [stats, setStats] = React.useState<BookingStat[]>([])
  const [metrics, setMetrics] = React.useState<{uniqueCustomers: number, avgRating: number}>({ uniqueCustomers: 0, avgRating: 0 })
  const [loading, setLoading] = React.useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)

  // Seller specific profile states
  const [profileCompletion, setProfileCompletion] = React.useState(0)
  const [isBookingReady, setIsBookingReady] = React.useState(false)
  const [missingItems, setMissingItems] = React.useState<{ label: string; href: string }[]>([])

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const [bookingsData, statsData, metricsData, sellerProfile] = await Promise.all([
            getSellerBookings(user.id).catch(err => {
              console.error("Error loading seller bookings:", err)
              return []
            }),
            getBookingStats(user.id).catch(err => {
              console.error("Error loading booking stats:", err)
              return []
            }),
            getSellerMetrics(user.id).catch(err => {
              console.error("Error loading seller metrics:", err)
              return { uniqueCustomers: 0, avgRating: 0 }
            }),
            getSellerProfile().catch(err => {
              console.error("Error loading seller profile:", err)
              return null
            })
          ])
          setBookings(bookingsData || [])
          setStats(statsData || [])
          setMetrics(metricsData || { uniqueCustomers: 0, avgRating: 0 })

          if (sellerProfile) {
            setProfileCompletion(sellerProfile.profileCompletion)
            setIsBookingReady(sellerProfile.isBookingReady)
            
            const missing: { label: string; href: string }[] = []
            if (!sellerProfile.logoUrl) {
              missing.push({ label: "Upload business logo", href: "/seller/settings" })
            }
            if (!sellerProfile.coverUrl) {
              missing.push({ label: "Upload cover banner", href: "/seller/settings" })
            }
            if (!sellerProfile.description) {
              missing.push({ label: "Add business description", href: "/seller/settings" })
            }
            if (!sellerProfile.address && !sellerProfile.fullAddress) {
              missing.push({ label: "Add street address", href: "/seller/settings" })
            }
            if (!sellerProfile.nidNumber) {
              missing.push({ label: "Add owner's NID number", href: "/seller/settings" })
            }
            if (!sellerProfile.tradeLicense) {
              missing.push({ label: "Add trade license number", href: "/seller/settings" })
            }
            if (!sellerProfile.tradeLicenseUrl) {
              missing.push({ label: "Upload trade license copy", href: "/seller/settings" })
            }
            if (!sellerProfile.hasOpeningHours) {
              missing.push({ label: "Configure operating hours", href: "/seller/settings" })
            }
            if (!sellerProfile.hasPaymentInfo) {
              missing.push({ label: "Setup payout method", href: "/seller/settings" })
            }
            setMissingItems(missing)
          }
        }
      } catch (err) {
        console.error("Error in seller dashboard load:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // KPI Calculations
  const totalRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status === "pending").length
  
  // A crude "today" check based on created_at matching today's ISO date string
  const todayStr = new Date().toISOString().split("T")[0]
  const todayBookings = bookings.filter(b => b.created_at && typeof b.created_at === 'string' && b.created_at.startsWith(todayStr)).length
  const todayRevenue = bookings.filter(b => (b.status === "confirmed" || b.status === "completed") && b.created_at && typeof b.created_at === 'string' && b.created_at.startsWith(todayStr)).reduce((sum, b) => sum + (b.amount || 0), 0)

  const STATS = [
    {
      title: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      change: "Lifetime",
      up: true,
      icon: DollarSign,
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      change: "Lifetime",
      up: true,
      icon: Calendar,
      bg: "bg-secondary/10",
      text: "text-secondary",
    },
    {
      title: "Unique Customers",
      value: metrics.uniqueCustomers.toString(),
      change: "Lifetime",
      up: true,
      icon: Users,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      title: "Avg. Rating",
      value: metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : "New",
      change: "Overall",
      up: true,
      icon: Star,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion Nudge Banner */}
      {user && (
        <ProfileCompletionBanner 
          percentage={profileCompletion} 
          missingItems={missingItems} 
          dismissKey={`seller_${user.id}`} 
        />
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2D0072] to-[#880E4F] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10">
          <Scissors className="w-full h-full" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <p className="text-white/70 text-sm mb-1 font-medium">Welcome back 👋</p>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Seller Dashboard</h2>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                <span className="text-white/60 text-xs">Today&apos;s Bookings</span>
                <p className="font-bold text-lg">{todayBookings}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                <span className="text-white/60 text-xs">Pending Approval</span>
                <p className="font-bold text-lg">{pendingBookings}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                <span className="text-white/60 text-xs">Today&apos;s Revenue</span>
                <p className="font-bold text-lg">৳{todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Booking Readiness Card */}
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm shrink-0 w-full md:w-auto">
            <ProfileCompletionRing percentage={profileCompletion} size={64} strokeWidth={5} />
            <div className="space-y-1">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-current",
                isBookingReady ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20" : "text-amber-300 bg-amber-500/10 border-amber-400/20"
              )}>
                {isBookingReady ? "Ready for bookings" : "Setup Incomplete"}
              </span>
              <p className="text-xs font-extrabold mt-1 text-white">Booking Readiness: {profileCompletion}%</p>
              <p className="text-[10px] text-white/60">
                {isBookingReady ? "Your parlour is live on search!" : "Complete setup to accept bookings"}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-brand-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.text)} />
                  </div>
                  <span className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold",
                    stat.up ? "text-emerald-600" : "text-red-500"
                  )}>
                    {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-brand-gray-900">{stat.value}</p>
                <p className="text-xs text-brand-gray-500 mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Chart */}
        <Card className="lg:col-span-2 border-brand-gray-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-gray-900">Weekly Bookings</CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Last 7 Days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.map((item, i) => {
                const maxVal = Math.max(...stats.map(s => s.bookings), 1)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-brand-gray-500 font-medium">{item.bookings}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary/60 transition-all hover:opacity-80"
                      style={{ height: `${(item.bookings / maxVal) * 120}px` }}
                    />
                    <span className="text-[10px] text-brand-gray-400">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-brand-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-brand-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Add New Service", href: "/seller/services/new", color: "text-primary bg-primary/10" },
              { label: "View All Bookings", href: "/seller/bookings", color: "text-secondary bg-secondary/10" },
              { label: "Upload Gallery", href: "/seller/settings#gallery", color: "text-amber-600 bg-amber-50" },
              { label: "Edit Business Info", href: "/seller/settings", color: "text-emerald-600 bg-emerald-50" },
              { label: "View Analytics", href: "/seller/analytics", color: "text-primary bg-primary/5" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-gray-50 border border-brand-gray-100 transition-colors group"
              >
                <span className="text-sm font-medium text-brand-gray-700">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-brand-gray-400 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-brand-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-gray-900">Recent Bookings</CardTitle>
            <Link href="/seller/bookings">
              <Button variant="outline" size="sm" className="text-xs border-brand-gray-200 h-8 rounded-lg">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-6 text-center text-brand-gray-500">
              No recent bookings found.
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-brand-gray-50/50">
                  <th className="text-left text-xs font-semibold text-brand-gray-500 px-6 py-3">ID</th>
                  <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-3">Service</th>
                  <th className="text-left text-xs font-semibold text-brand-gray-500 px-4 py-3">Date & Time</th>
                  <th className="text-right text-xs font-semibold text-brand-gray-500 px-4 py-3">Amount</th>
                  <th className="text-right text-xs font-semibold text-brand-gray-500 px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-50">
                {bookings.slice(0, 5).map((booking) => {
                  const statusKey = booking.status as keyof typeof STATUS_MAP
                  const status = STATUS_MAP[statusKey] || STATUS_MAP.pending
                  const StatusIcon = status.icon
                  return (
                    <tr key={booking.id} className="hover:bg-brand-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs text-brand-gray-400 font-mono">
                        {booking.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {booking.customer_name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-medium text-brand-gray-800">
                            {booking.customer_name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-brand-gray-600">{booking.service_name}</td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-brand-gray-600">
                          <p className="font-medium">{booking.time || "N/A"}</p>
                          <p className="text-brand-gray-400">{booking.date || (booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "N/A")}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-bold text-brand-gray-900">
                        ৳{(booking.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge className={cn("text-xs gap-1", status.class)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
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
