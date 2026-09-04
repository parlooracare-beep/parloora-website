"use client"

import * as React from "react"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bell, CheckCheck, Trash2, Clock, Tag, Info, ChevronRight, Loader2, Filter, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "@/lib/actions/notifications"
import { motion, AnimatePresence } from "framer-motion"

export default function NotificationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<string>("all")
  
  const load = React.useCallback(async () => {
    setLoading(true)
    const data = await getNotifications()
    setNotifications(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true
    if (filter === "unread") return n.status === "unread"
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => n.status === "unread").length

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id)
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n))
    }
  }

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead()
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, status: "read" })))
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteNotification(id)
    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return
    const res = await clearAllNotifications()
    if (res.success) {
      setNotifications([])
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "booking": return <Clock className="w-5 h-5" />
      case "offer": return <Tag className="w-5 h-5" />
      case "order": return <CheckCheck className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "booking": return "bg-primary/10 text-primary"
      case "offer": return "bg-secondary/10 text-secondary"
      case "order": return "bg-emerald-100 text-emerald-600"
      default: return "bg-brand-gray-100 text-brand-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-brand-gray-900 tracking-tight">Notifications</h1>
            </div>
            <p className="text-brand-gray-500">Stay updated with your bookings, orders, and exclusive offers.</p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                onClick={handleMarkAllAsRead}
                className="rounded-xl gap-2 border-brand-gray-200"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={handleClearAll}
              className="rounded-xl gap-2 text-brand-gray-400 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "booking", label: "Bookings" },
            { id: "order", label: "Orders" },
            { id: "offer", label: "Offers" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all shrink-0",
                filter === f.id 
                  ? "bg-brand-gray-900 text-white shadow-lg" 
                  : "bg-white text-brand-gray-600 border border-brand-gray-100 hover:bg-brand-gray-50"
              )}
            >
              {f.label}
              {f.id === "unread" && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-gray-100">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-brand-gray-500">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-brand-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-brand-gray-200" />
              </div>
              <h2 className="text-xl font-bold text-brand-gray-900 mb-2">
                {filter === "all" ? "All caught up!" : `No ${filter} notifications`}
              </h2>
              <p className="text-brand-gray-500 mb-6">
                {filter === "all" 
                  ? "You don't have any notifications at the moment." 
                  : `You don't have any notifications in the ${filter} category.`}
              </p>
              {filter !== "all" && (
                <Button onClick={() => setFilter("all")} variant="outline" className="rounded-xl">
                  View All Notifications
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className={cn(
                      "group border-brand-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden",
                      n.status === "unread" && "border-l-4 border-l-primary bg-primary/5"
                    )}>
                      <CardContent className="p-0">
                        <div className="flex items-start gap-4 p-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            getTypeColor(n.type)
                          )}>
                            {getIcon(n.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <h3 className={cn(
                                "font-bold text-brand-gray-900 truncate",
                                n.status === "unread" ? "text-base" : "text-sm"
                              )}>
                                {n.title}
                              </h3>
                              <span className="text-[10px] text-brand-gray-400 font-medium whitespace-nowrap">
                                {new Date(n.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-brand-gray-600 leading-relaxed mb-4">
                              {n.message}
                            </p>
                            
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {n.link && (
                                  <Link href={n.link}>
                                    <Button size="sm" className="h-8 rounded-lg px-4 gap-2">
                                      View Details <ChevronRight className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                )}
                                {n.status === "unread" && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className="h-8 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => handleDelete(n.id)}
                                className="p-2 text-brand-gray-300 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
