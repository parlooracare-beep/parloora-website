"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { MobileNav } from "@/components/shared/MobileNav"
import { WhatsAppButton } from "@/components/shared/WhatsAppButton"
import { createClient } from "@/lib/supabase/client"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAccountRoute = React.useMemo(() => {
    const accountPages = ["/dashboard", "/bookings", "/wishlist", "/profile"]
    return accountPages.some(page => pathname === page || pathname.startsWith(page + "/"))
  }, [pathname])
  const [loading, setLoading] = React.useState(isAccountRoute)

  React.useEffect(() => {
    if (!isAccountRoute) {
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile?.role?.toLowerCase() === "seller") {
          window.location.href = "/seller/dashboard"
          return
        }
        if (profile?.role?.toLowerCase() === "admin") {
          window.location.href = "/admin/dashboard"
          return
        }
      }
      setLoading(false)
    }

    checkAccess()
  }, [pathname, isAccountRoute])

  if (loading && ["/dashboard", "/bookings", "/wishlist", "/profile"].some(p => pathname.startsWith(p))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pt-[64px] md:pt-[72px] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pb-24 pb-safe-offset-4 md:pb-0">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileNav />
    </div>
  )
}

