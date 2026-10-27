"use client"

import * as React from "react"
import { WifiOff, Wifi, X } from "lucide-react"

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = React.useState(false)
  const [showReconnected, setShowReconnected] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    setIsOffline(!navigator.onLine)

    const handleOffline = () => {
      setIsOffline(true)
      setShowReconnected(false)
      setDismissed(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3500)
      return () => clearTimeout(timer)
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (dismissed) return null

  if (isOffline) {
    return (
      <aside aria-label="Offline notice" className="fixed top-0 left-0 right-0 z-[100] bg-brand-charcoal text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">
            You are offline. Live bookings & availability require internet.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss offline banner"
        >
          <X className="w-3.5 h-3.5 text-white/70" />
        </button>
      </aside>
    )
  }

  if (showReconnected) {
    return (
      <aside aria-label="Reconnected notice" className="fixed top-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span className="font-semibold">Back online. Real-time sync restored.</span>
      </aside>
    )
  }

  return null
}
