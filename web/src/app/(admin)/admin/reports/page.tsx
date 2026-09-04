"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp, Users, ShoppingBag, Store, 
  ArrowUpRight, ArrowDownRight, Calendar,
  Download, Filter, RefreshCw, DollarSign
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Tooltip, ResponsiveContainer, BarChart, Bar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PieChart, Pie, Cell, Legend
} from "recharts"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { getAdminReportsData } from "@/lib/actions/admin"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = React.useState<any>(null)

  const fetchStats = async () => {
    const data = await getAdminReportsData()
    setReportData(data)
    setLoading(false)
    setIsRefreshing(false)
  }

  React.useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  const handleExportCSV = () => {
    if (!reportData) return
    const { stats, revenueData, categoryData } = reportData
    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Stats section
    csvContent += "PLATFORM METRICS\nMetric,Value\n"
    csvContent += `Total Revenue,${stats.revenue}\n`
    csvContent += `Active Users,${stats.users}\n`
    csvContent += `Total Bookings,${stats.bookings}\n`
    csvContent += `Parlours,${stats.parlours}\n\n`
    
    // Revenue Data
    csvContent += "MONTHLY REVENUE\nMonth,Revenue,Bookings\n"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    revenueData.forEach((row: any) => {
      csvContent += `${row.name},${row.revenue},${row.bookings}\n`
    })
    
    // Category Data
    csvContent += "\nSERVICE CATEGORIES\nCategory,Value\n"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categoryData.forEach((row: any) => {
      csvContent += `${row.name},${row.value}\n`
    })
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `parloora_admin_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { stats, revenueData, categoryData, topParlours, recentActivity } = reportData

  const STATS_CARDS = [
    { 
      title: "Total Revenue", 
      value: `৳${stats.revenue.toLocaleString()}`, 
      change: "Lifetime", 
      trend: "up", 
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      title: "Active Users", 
      value: stats.users.toLocaleString(), 
      change: "Lifetime", 
      trend: "up", 
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      title: "Total Bookings", 
      value: stats.bookings.toLocaleString(), 
      change: "Lifetime", 
      trend: "up", 
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      title: "Parlour Partners", 
      value: stats.parlours.toLocaleString(), 
      change: "Lifetime", 
      trend: "up", 
      icon: Store,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-gray-900 tracking-tight">Analytics Dashboard</h2>
          <p className="text-brand-gray-500 mt-1">Real-time performance metrics and platform growth insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-brand-gray-200">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-bold">All Time</DropdownMenuItem>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl border-brand-gray-200"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>

          <Button 
            className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stat.trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  }`}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-brand-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-brand-gray-900 mt-1 tracking-tight">
                    {index === 1 ? stats.users.toLocaleString() : 
                     index === 3 ? stats.parlours.toLocaleString() : 
                     stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-lg font-bold text-brand-gray-900">Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue vs booking volume</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs text-brand-gray-500 font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5 ml-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="text-xs text-brand-gray-500 font-medium">Bookings</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B1E6D" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4B1E6D" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E6B7A9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E6B7A9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1EDF5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#7A7A7A", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#7A7A7A", fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      border: "none", 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4B1E6D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#E6B7A9" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorBookings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-brand-gray-900">Service Categories</CardTitle>
              <CardDescription>Revenue distribution by type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      border: "none", 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-brand-gray-900">100%</span>
                <span className="text-[10px] uppercase tracking-wider text-brand-gray-500 font-bold">Total Share</span>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categoryData.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-brand-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid: Top Parlours & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-brand-gray-900">Top Performing Parlours</CardTitle>
                <CardDescription>Based on booking volume this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {topParlours.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gray-100 flex items-center justify-center text-primary font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                        {item.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-brand-gray-900">{item.name}</h4>
                        <p className="text-xs text-brand-gray-500">{item.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-gray-900">{item.bookings} bookings</p>
                      <p className="text-xs text-emerald-600 font-medium">{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-brand-gray-900">Recent Platform Activity</CardTitle>
                <CardDescription>Latest system-wide transactions</CardDescription>
              </div>
              <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-none font-bold">Live</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === "Success" ? "bg-emerald-500" : 
                        item.status === "Pending" ? "bg-amber-500" : "bg-primary"
                      }`} />
                      <div>
                        <h4 className="text-sm font-bold text-brand-gray-900">{item.user}</h4>
                        <p className="text-xs text-brand-gray-500">{item.type} • {item.target}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-gray-900">{item.amount}</p>
                      <p className="text-[10px] text-brand-gray-400 font-medium uppercase tracking-wider">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
