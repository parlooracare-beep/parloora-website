"use client"

import * as React from "react"
import Link from "next/link"
import { WifiOff, RefreshCw, Home, Sparkles } from "lucide-react"
import { ParlooraLogo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(false)

  React.useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/"
      } else {
        setIsRetrying(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-gray-50 via-white to-brand-gray-50 flex flex-col items-center justify-between p-6 pt-12 pb-safe-offset-4 text-center">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2">
        <ParlooraLogo size="lg" href="/" priority />
        <span className="text-xs text-brand-coolgray tracking-wide font-medium">
          Book Your Self Care Services In Seconds
        </span>
      </div>

      {/* Main Offline Card */}
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-gray-100 shadow-[0_20px_50px_rgba(75,30,109,0.06)] flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
          <WifiOff className="w-10 h-10 stroke-[2.2]" />
        </div>

        <h1 className="text-2xl font-black text-brand-charcoal mb-2">
          {isOnline ? "Connection Restored!" : "You're Currently Offline"}
        </h1>

        <p className="text-sm text-brand-coolgray mb-8 leading-relaxed">
          {isOnline
            ? "Your internet connection is back. Tap below to continue booking your favorite parlour services."
            : "Please check your Wi-Fi or mobile data connection. Parloora requires an active connection for real-time bookings and slot verification."}
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base shadow-lg shadow-primary/25 active:scale-98 transition-all"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Rechecking Connection..." : isOnline ? "Go to Home" : "Retry Connection"}
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-2xl border-brand-gray-200 text-brand-charcoal font-semibold text-sm hover:bg-brand-gray-50"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="max-w-xs text-[11px] text-brand-coolgray flex items-center justify-center gap-1.5 opacity-80">
        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>Appointments and payments are secured via live server validation</span>
      </div>
    </div>
  )
}
