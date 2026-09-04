"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { MobileNav } from "@/components/shared/MobileNav"
import { createClient } from "@/lib/supabase/client"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkAccess = async () => {
      const accountPages = ["/dashboard", "/bookings", "/wishlist", "/profile"]
      const isAccountPage = accountPages.some(page => pathname === page || pathname.startsWith(page + "/"))

      if (isAccountPage) {
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
      }
      setLoading(false)
    }

    checkAccess()
  }, [pathname])

  if (loading && ["/dashboard", "/bookings", "/wishlist", "/profile"].some(p => pathname.startsWith(p))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pt-[72px] md:pt-[72px]">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
