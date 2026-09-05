"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ArrowRight, X } from "lucide-react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button"

interface MissingItem {
  label: string
  href: string
}

interface ProfileCompletionBannerProps {
  percentage: number
  missingItems: MissingItem[]
  dismissKey: string
}

export function ProfileCompletionBanner({
  percentage,
  missingItems,
  dismissKey
}: ProfileCompletionBannerProps) {
  const [mounted, setMounted] = React.useState(false)
  const [userDismissed, setUserDismissed] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isLocallyDismissed = React.useMemo(() => {
    if (!mounted || typeof window === "undefined") return true
    return localStorage.getItem(`dismiss_banner_${dismissKey}`) === "true"
  }, [mounted, dismissKey])

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`dismiss_banner_${dismissKey}`, "true")
      setUserDismissed(true)
    }
  }

  if (!mounted || userDismissed || isLocallyDismissed || percentage >= 80 || missingItems.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-5 mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl" />

      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-brand-gray-400 hover:text-brand-gray-700 transition-colors p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-extrabold text-brand-gray-900 text-sm mb-1">
            Complete your profile ({percentage}%)
          </h4>
          <p className="text-xs text-brand-gray-500 mb-4">
            Finish setting up your account to unlock all features, receive notifications, and verify your credentials.
          </p>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">
              Next Steps:
            </p>
            <div className="flex flex-col gap-2">
              {missingItems.slice(0, 3).map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href}
                  className="flex items-center justify-between p-2.5 bg-white border border-brand-gray-100 hover:border-amber-300 hover:bg-amber-50/20 rounded-xl transition-all group"
                >
                  <span className="text-xs font-semibold text-brand-gray-700 group-hover:text-brand-gray-900">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Complete</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
