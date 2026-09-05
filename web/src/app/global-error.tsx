"use client"

import * as React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Critical Root Layout Error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans antialiased text-neutral-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            P
          </div>
          <h1 className="text-2xl font-black mb-3">Service Temporarily Unavailable</h1>
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            We encountered an unexpected issue while loading the application. Please refresh or try again shortly.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-neutral-400 bg-neutral-100 rounded-lg py-1 px-3 mb-6 inline-block">
              Ref: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl px-6 py-3 text-sm transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl px-6 py-3 text-sm transition-all"
            >
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
