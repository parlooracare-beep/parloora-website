"use client"

import * as React from "react"
import Image from "next/image"
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [isIos, setIsIos] = React.useState(false)
  const [showIosInstructions, setShowIosInstructions] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Don't show if already in standalone app mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isCapacitor = typeof window !== "undefined" && Boolean((window as any).Capacitor?.isNativePlatform?.())
    if (isStandalone || isCapacitor) return

    // Check if dismissed recently (7 days)
    const dismissedUntil = localStorage.getItem("parloora_pwa_dismissed")
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(isIosDevice)

    // Android / Desktop Chrome PWA prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Slight delay for premium experience
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // For iOS users on mobile Safari, show banner after brief delay
    if (isIosDevice && !isStandalone) {
      const isSafari = /safari/.test(userAgent) && !/crios|fxios/.test(userAgent)
      if (isSafari) {
        setTimeout(() => setShowPrompt(true), 4000)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIosInstructions(false)
    // Dismiss for 7 days
    localStorage.setItem("parloora_pwa_dismissed", (Date.now() + 7 * 24 * 60 * 60 * 1000).toString())
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else if (isIos) {
      setShowIosInstructions(true)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-4 border border-brand-rose/40 shadow-[0_12px_40px_rgba(75,30,109,0.15)] flex flex-col gap-3 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 text-brand-coolgray hover:text-brand-charcoal hover:bg-brand-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-white rounded-[10px] overflow-hidden flex items-center justify-center">
              <Image src="/logo.png" alt="Parloora App" width={40} height={40} className="object-contain" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-brand-charcoal leading-tight">Install Parloora</h3>
              <span className="text-[10px] bg-secondary/30 text-primary font-bold px-1.5 py-0.2 rounded-full">App</span>
            </div>
            <p className="text-[11px] text-brand-coolgray mt-0.5">
              Fast bookings, instant alerts & smooth app experience
            </p>
          </div>
        </div>

        {showIosInstructions ? (
          <div className="bg-brand-gray-50 rounded-xl p-3 text-xs text-brand-charcoal space-y-2 border border-brand-gray-100">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> How to install on iPhone / iPad:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-brand-coolgray text-[11px]">
              <li>
                Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-primary" /> <strong>Share</strong> button in Safari
              </li>
              <li>
                Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-primary" /> <strong>Add to Home Screen</strong>
              </li>
              <li>Tap <strong>Add</strong> at top right to complete</li>
            </ol>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowIosInstructions(false)}
              className="w-full text-xs h-7 text-primary font-bold"
            >
              Got it
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex-1 h-9 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-98 transition-transform"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isIos ? "Add to Home Screen" : "Install App"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-9 px-3 rounded-xl text-xs text-brand-coolgray hover:text-brand-charcoal"
            >
              Later
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
