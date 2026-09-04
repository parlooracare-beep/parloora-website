"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Calendar, Scissors, Package, BarChart2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Settings, LogOut, Menu, X, Sparkles, Bell, ChevronDown, ShoppingBag, Users, Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SellerMobileNav } from "@/components/seller/SellerMobileNav"
import { NotificationBell } from "@/components/shared/NotificationBell"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/seller/bookings", icon: Calendar },
  { label: "Orders", href: "/seller/orders", icon: Package },
  { label: "Services", href: "/seller/services", icon: Scissors },
  { label: "Staff", href: "/seller/staff", icon: Users },
  { label: "Products", href: "/seller/products", icon: ShoppingBag },
  { label: "Analytics", href: "/seller/analytics", icon: BarChart2 },
  { label: "Payouts", href: "/seller/payouts", icon: Wallet },
  { label: "Settings", href: "/seller/settings", icon: Settings },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [parlourStatus, setParlourStatus] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    
    // Safety timeout: if checking takes longer than 5 seconds, let the workspace load anyway
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("Seller check parlour timed out")
        setLoading(false)
      }
    }, 5000)

    async function checkParlour() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (cancelled) return

        if (!user) {
          clearTimeout(timeoutId)
          router.push("/login")
          return
        }

        const { data: parlour, error } = await supabase
          .from("parlours")
          .select("status")
          .eq("owner_id", user.id)
          .single()

        if (cancelled) return
        clearTimeout(timeoutId)

        if (error || !parlour) {
          console.error("No parlour found for seller:", error)
          setLoading(false)
          return
        }

        setParlourStatus(parlour.status)
        setLoading(false)

        // Redirect logic
        const isAllowedPath = pathname === "/seller/pending" || 
                              pathname === "/seller/settings" || 
                              pathname === "/seller/services" || 
                              pathname.startsWith("/seller/services/")

        if (parlour.status === "pending" && !isAllowedPath) {
          router.push("/seller/pending")
        } else if (parlour.status === "active" && pathname === "/seller/pending") {
          router.push("/seller/dashboard")
        }
      } catch (err) {
        console.error("Error in checkParlour:", err)
        if (!cancelled) setLoading(false)
      }
    }

    checkParlour()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [pathname, router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-gray-500 font-medium">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  // If pending, only show the pending page content without the full sidebar/header 
  // OR show a simplified version. For now, let's just let the pending page render 
  // its own full-screen UI if the layout allows it.
  if (parlourStatus === "pending" && pathname === "/seller/pending") {
    return <div className="min-h-screen bg-brand-gray-50">{children}</div>
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/10">
        <Image src="/logo.png" alt="Parloora Logo" width={40} height={40} className="rounded-xl object-contain" />
        <div>
          <span className="text-white font-bold tracking-tight">Parloora</span>
          <p className="text-white/40 text-[10px] leading-none mt-0.5">Seller Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-rose-400 rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-gradient-to-b from-[#2D0072] to-[#4A148C] flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-[#2D0072] to-[#4A148C] flex flex-col shadow-2xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-brand-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Page title derived from path */}
            <h1 className="text-brand-gray-900 font-semibold capitalize text-sm md:text-base">
              {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label ?? "Seller Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationBell />

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <span className="hidden sm:block text-sm font-medium text-brand-gray-700">Seller</span>
              <ChevronDown className="w-3.5 h-3.5 text-brand-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>

        <SellerMobileNav />
      </div>
    </div>
  )
}
