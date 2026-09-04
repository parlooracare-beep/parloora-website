"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp, TrendingDown, Users, Store, Receipt, AlertTriangle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Activity, ArrowUpRight, CheckCircle2, XCircle, ShieldAlert
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getAdminMetrics } from "@/lib/actions/admin"
import { Loader2 } from "lucide-react"



const PLATFORM_ACTIVITY = [45, 52, 38, 65, 88, 72, 95, 110, 85, 120, 105, 140]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MAX_VAL = Math.max(...PLATFORM_ACTIVITY)

export default function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getAdminMetrics()
        setMetrics(data)
      } catch (err) {
        console.error("Error loading admin metrics:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const [isExporting, setIsExporting] = React.useState(false)

  const handleDownloadReport = () => {
    if (!metrics) return
    setIsExporting(true)
    
    try {
      const headers = ["Transaction ID", "Parlour Name", "Date", "Amount", "Status"]
      const csvContent = [
        headers.join(","),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(metrics.recentTransactions || []).map((t: any) => 
          `${t.id},"${t.parlour_name || 'N/A'}",${new Date(t.created_at).toLocaleDateString()},${t.amount || 0},${t.status || 'N/A'}`
        )
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `platform_report_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error("Export failed:", e)
    } finally {
      setTimeout(() => setIsExporting(false), 500)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const ALERTS = (() => {
    const alerts = []

    if (metrics.pendingParloursCount > 0) {
      alerts.push({
        id: "pending-kyc",
        type: "warning",
        message: `${metrics.pendingParloursCount} new parlour${metrics.pendingParloursCount > 1 ? 's are' : ' is'} awaiting KYC verification`,
        time: "Action Required"
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const failedTx = metrics.recentTransactions?.filter((t: any) => t.status === 'canceled' || t.status === 'failed')
    if (failedTx?.length > 0) {
      alerts.push({
        id: "failed-tx",
        type: "critical",
        message: `${failedTx.length} recent transaction${failedTx.length > 1 ? 's were' : ' was'} canceled or failed`,
        time: "Needs Attention"
      })
    } else {
      alerts.push({
        id: "sys-healthy",
        type: "info",
        message: "Payment gateway and booking systems are operating normally",
        time: "System Live"
      })
    }

    if (metrics.registeredUsersCount > 0) {
       alerts.push({
         id: "milestone",
         type: "info",
         message: `Platform has active engagement from ${metrics.registeredUsersCount} registered users`,
         time: "Milestone"
       })
    }

    return alerts
  })()

  const STATS = [
    {
      title: "Total Revenue (Platform)",
      value: `৳${(metrics.totalRevenue || 0).toLocaleString()}`,
      change: "+18.2%",
      up: true,
      icon: Receipt,
      bg: "bg-brand-gray-100",
      text: "text-brand-gray-800",
    },
    {
      title: "Active Parlours",
      value: metrics.activeParloursCount.toString(),
      change: "+12",
      up: true,
      icon: Store,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Registered Users",
      value: metrics.registeredUsersCount.toString(),
      change: "+890",
      up: true,
      icon: Users,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Pending Approvals",
      value: metrics.pendingParloursCount.toString(),
      change: "-2",
      up: false,
      icon: AlertTriangle,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 tracking-tight">Platform Overview</h2>
          <p className="text-brand-gray-500 text-sm">System status and key performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Healthy
          </Badge>
          <Button 
            className="bg-brand-gray-900 text-white hover:bg-brand-gray-800 rounded-lg h-9 text-xs shadow-md"
            onClick={handleDownloadReport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-brand-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-lg border", stat.bg, stat.bg.replace("50", "200"))}>
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
                <p className="text-xs text-brand-gray-500 mt-1 font-medium">{stat.title}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-brand-gray-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-brand-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Platform Growth
                </CardTitle>
                <p className="text-xs text-brand-gray-500 mt-1">Monthly active bookings volume</p>
              </div>
              <select className="text-xs border-brand-gray-200 rounded-md bg-brand-gray-50 text-brand-gray-600 p-1.5 outline-none focus:border-brand-gray-400">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2 h-52">
              {MONTHS.map((m, i) => {
                const val = PLATFORM_ACTIVITY[i] || 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 origin-bottom bg-brand-gray-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none z-10 font-bold whitespace-nowrap shadow-xl">
                        ৳{val}k
                      </div>
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500 relative",
                          i === MONTHS.length - 1 ? "bg-primary" : "bg-brand-gray-200 group-hover:bg-primary/40"
                        )}
                        style={{ height: `${(val / MAX_VAL) * 160}px` }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-lg" />
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-gray-500 font-black uppercase tracking-tighter">{m}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-brand-gray-200 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-brand-gray-100">
            <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-amber-500" /> System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 overflow-y-auto space-y-4">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex gap-3 items-start border-b border-brand-gray-50 pb-4 last:border-0 last:pb-0">
                <div className={cn(
                  "p-1.5 rounded-md mt-0.5 shrink-0",
                  alert.type === "critical" ? "bg-red-100 text-red-600" :
                  alert.type === "warning" ? "bg-amber-100 text-amber-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  {alert.type === "critical" ? <XCircle className="w-4 h-4" /> :
                   alert.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm text-brand-gray-700 leading-snug">{alert.message}</p>
                  <span className="text-xs text-brand-gray-400 mt-1 block">{alert.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-brand-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-brand-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-gray-900">Recent Transactions</CardTitle>
            <Link href="/admin/transactions" className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Parlour</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {metrics.recentTransactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-brand-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-brand-gray-500">{txn.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-brand-gray-800">{txn.parlour_name}</td>
                    <td className="px-6 py-4 text-brand-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-brand-gray-900">৳{txn.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase font-bold border-0",
                        txn.status?.toLowerCase() === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                        txn.status?.toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
