"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="max-w-md">
        <h2 className="text-3xl font-black text-brand-gray-900 mb-4">Oops! Something went wrong</h2>
        <p className="text-brand-gray-500 mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred while loading the page."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            onClick={() => reset()}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
          >
            Try again
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/"}
            className="rounded-xl px-8"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
