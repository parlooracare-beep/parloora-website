"use client"

import * as React from "react"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bell, Clock, AlertCircle, Info, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function NotificationBell() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  const unreadCount = notifications.filter(n => n.status === "unread").length

  const load = React.useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n))
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, status: "read" })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full hover:bg-brand-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-brand-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-brand-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 bg-brand-gray-50/50 flex items-center justify-between">
              <span className="font-bold text-brand-gray-900">Notifications</span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-brand-gray-400 hover:text-brand-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-xs text-brand-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-brand-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-brand-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-brand-gray-900">No notifications yet</p>
                  <p className="text-xs text-brand-gray-500 mt-1">We&apos;ll notify you when something happens.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link 
                    key={n.id} 
                    href={n.link || "#"} 
                    onClick={() => {
                      handleMarkAsRead(n.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-brand-gray-50 transition-colors border-b last:border-0",
                      n.status === "unread" && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      n.type === "booking" ? "bg-primary/10 text-primary" : 
                      n.type === "offer" ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
                    )}>
                      {n.type === "booking" ? <Clock className="w-4 h-4" /> : 
                       n.type === "offer" ? <Tag className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-sm leading-tight", n.status === "unread" ? "font-bold text-brand-gray-900" : "text-brand-gray-700")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-brand-gray-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-brand-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Tag({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 2 10 10-10 10L2 12Z" />
      <path d="m7 7 5 5-5 5" />
    </svg>
  )
}
