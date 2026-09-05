"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log exception to monitoring service
    console.error("Parloora Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand-gray-100 border border-brand-gray-100 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black text-brand-gray-900 mb-3 tracking-tight">
          Something went wrong
        </h2>

        <p className="text-brand-gray-500 text-sm mb-6 leading-relaxed">
          {error.message && !error.message.includes("digest")
            ? error.message
            : "An unexpected error occurred while rendering this page. Our technical team has been notified."}
        </p>

        {error.digest && (
          <p className="text-[11px] font-mono text-brand-gray-400 bg-brand-gray-50 rounded-lg py-1.5 px-3 mb-6 inline-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-3 text-sm shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-800 font-bold rounded-xl px-6 py-3 text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
