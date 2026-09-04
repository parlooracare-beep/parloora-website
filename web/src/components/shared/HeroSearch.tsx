"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSearch() {
  const [query, setQuery] = React.useState("")
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    
    // Default search goes to parlours, as it's the primary marketplace focus
    router.push(`/parlours?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-row gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 max-w-xl mx-auto mb-6"
    >
      <div className="flex items-center gap-2 flex-1 px-3 py-1">
        <Search className="w-4 h-4 text-white/50 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services..."
          className="bg-transparent text-white placeholder:text-white/40 outline-none w-full text-xs md:text-sm"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className="bg-gradient-to-r from-rose-400 to-rose-600 hover:opacity-90 text-white rounded-xl px-5 h-9 shadow-lg shadow-rose-700/20 shrink-0 text-xs font-bold"
      >
        Search
      </Button>
    </form>
  )
}
