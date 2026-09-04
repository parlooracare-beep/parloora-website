"use client"

import * as React from "react"
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp, TrendingDown, DollarSign, Calendar, Star, Users,
  BarChart3, Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getSellerBookings, getBookingStats } from "@/lib/actions/bookings"
import { createClient } from "@/lib/supabase/client"

type BookingStat = { day: string; revenue: number; bookings: number }

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<BookingStat[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [b, s] = await Promise.all([
          getSellerBookings(user.id),
          getBookingStats(user.id),
        ])
        setBookings(b)
        setStats(s)
      }
      setLoading(false)
    }
    load()
  }, [])

  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "completed")
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalBookings = bookings.length
  const conversionRate = totalBookings > 0 ? Math.round((confirmedBookings.length / totalBookings) * 100) : 0
  const avgOrderValue = confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length) : 0

  const weeklyRevenue = stats.reduce((s, d) => s + d.revenue, 0)
  const weeklyBookings = stats.reduce((s, d) => s + d.bookings, 0)
  const maxBookings = Math.max(...stats.map(s => s.bookings), 1)
  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1)

  const KPIs = [
    {
      title: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      sub: "All-time confirmed",
      icon: DollarSign,
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      sub: "All-time requests",
      icon: Calendar,
      bg: "bg-secondary/10",
      text: "text-secondary",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      sub: "Confirmed / Total",
      icon: TrendingUp,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Avg Order Value",
      value: `৳${avgOrderValue.toLocaleString()}`,
      sub: "Per confirmed booking",
      icon: Star,
      bg: "bg-amber-50",
      text: "text-amber-600",
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Hub
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Track your business performance in real-time</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20">Live Data</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="border-brand-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", kpi.bg)}>
                  <Icon className={cn("w-5 h-5", kpi.text)} />
                </div>
                <p className="text-2xl font-black text-brand-gray-900">{kpi.value}</p>
                <p className="text-xs font-semibold text-brand-gray-700 mt-1">{kpi.title}</p>
                <p className="text-[10px] text-brand-gray-400 mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings Bar Chart */}
        <Card className="border-brand-gray-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-gray-900">Weekly Bookings</CardTitle>
              <span className="text-xs text-brand-gray-500 bg-brand-gray-50 px-2 py-1 rounded-lg font-semibold">
                {weeklyBookings} this week
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-44 pt-4">
              {stats.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-brand-gray-500 font-bold">{item.bookings}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary/60 transition-all hover:opacity-80 min-h-[4px]"
                    style={{ height: `${Math.max((item.bookings / maxBookings) * 140, 4)}px` }}
                  />
                  <span className="text-[10px] text-brand-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Bar Chart */}
        <Card className="border-brand-gray-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-gray-900">Weekly Revenue</CardTitle>
              <span className="text-xs text-brand-gray-500 bg-brand-gray-50 px-2 py-1 rounded-lg font-semibold">
                ৳{weeklyRevenue.toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-44 pt-4">
              {stats.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-brand-gray-500 font-bold">
                    {item.revenue > 0 ? `৳${item.revenue}` : "0"}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-secondary to-primary/60 transition-all hover:opacity-80 min-h-[4px]"
                    style={{ height: `${Math.max((item.revenue / maxRevenue) * 140, 4)}px` }}
                  />
                  <span className="text-[10px] text-brand-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Breakdown */}
      <Card className="border-brand-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-brand-gray-900">Booking Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-10 text-center text-brand-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-brand-gray-200" />
              <p>No booking data yet. Your analytics will appear here once you receive bookings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(["confirmed", "pending", "cancelled", "completed"] as const).map((status) => {
                const count = bookings.filter(b => b.status === status).length
                const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
                const colors: Record<string, string> = {
                  confirmed: "bg-emerald-500",
                  completed: "bg-blue-500",
                  pending: "bg-amber-400",
                  cancelled: "bg-red-400",
                }
                return (
                  <div key={status} className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-brand-gray-700 w-24 capitalize">{status}</span>
                    <div className="flex-1 bg-brand-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors[status])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-brand-gray-600 w-10 text-right">{count}</span>
                    <span className="text-[10px] text-brand-gray-400 w-10">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
