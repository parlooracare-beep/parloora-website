"use client"

import * as React from "react"
import Link from "next/link"
import NextImage from "next/image"
import { ParlooraLogo } from "@/components/shared/Logo"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Store, Receipt, AlertTriangle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Settings, LogOut, Menu, ShieldCheck, Bell, ChevronDown,
  Scissors, Package, Calendar, ShoppingBag, Loader2,
  BookOpen, Image as ImageIcon, LayoutTemplate, Terminal, Wallet, Ticket, MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAdminMetrics } from "@/lib/actions/admin"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User as UserIcon, Settings as SettingsIcon, LogOut as LogOutIcon } from "lucide-react"
import { NotificationBell } from "@/components/shared/NotificationBell"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { useI18n } from "@/lib/store/useI18n"

const NAV_ITEMS = [
  { key: "overview", label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "users", label: "Users", href: "/admin/users", icon: Users },
  { key: "sellers", label: "Sellers", href: "/admin/sellers", icon: ShieldCheck },
  { key: "parlours", label: "Parlours", href: "/admin/parlours", icon: Store },
  { key: "services", label: "Services", href: "/admin/services", icon: Scissors },
  { key: "products", label: "Products", href: "/admin/products", icon: Package },
  { key: "bookings", label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { key: "transactions", label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { key: "payoutRequests", label: "Payout Requests", href: "/admin/payouts", icon: Wallet },
  { key: "promoCodes", label: "Promo Codes", href: "/admin/promo-codes", icon: Ticket },
  { key: "blogCms", label: "Blog CMS", href: "/admin/blog", icon: BookOpen },
  { key: "mediaLibrary", label: "Media Library", href: "/admin/media", icon: ImageIcon },
  { key: "pageBuilder", label: "Page Builder", href: "/admin/page-builder", icon: LayoutTemplate },
  { key: "districtSeo", label: "District SEO (64)", href: "/admin/locations", icon: MapPin },
  { key: "auditLogs", label: "Audit Logs", href: "/admin/activity-logs", icon: Terminal },
  { key: "reports", label: "Reports", href: "/admin/reports", icon: AlertTriangle },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
]

interface AdminSidebarContentProps {
  pathname: string
  onClose: () => void
  onLogout: () => void
}

function AdminSidebarContent({ pathname, onClose, onLogout }: AdminSidebarContentProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-gray-100">
        <ParlooraLogo
          size="md"
          variant="dark"
          href="/admin/dashboard"
          subtext={t("admin.adminControl", "Super Admin")}
          subtextClassName="text-red-500 font-bold tracking-wider uppercase"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          const translatedLabel = t(`admin.${key}`, label)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-brand-gray-500 hover:bg-brand-gray-50 hover:text-brand-gray-900"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {translatedLabel}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(75,30,109,0.5)]" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-brand-gray-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t("common.logout", "System Logout")}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [authChecked, setAuthChecked] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    // Hard timeout — if auth check takes >5s, redirect to dashboard to avoid infinite spinner
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("Admin auth check timed out — redirecting to dashboard")
        router.push("/dashboard")
      }
    }, 5000)

    const supabase = createClient()
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (cancelled) return
        clearTimeout(timeoutId)

        if (!user) {
          router.push("/login")
          return
        }

        // 1. First check JWT claims (cached role, zero latency)
        const jwtRole = user.app_metadata?.role || user.user_metadata?.role
        if (jwtRole?.toLowerCase() === "admin") {
          if (!cancelled) {
            setUser(user)
            setAuthChecked(true)
          }
          return
        }
        
        // 2. Fallback: database role check
        supabase.from("users").select("role").eq("id", user.id).single()
          .then(
            ({ data }) => {
              if (cancelled) return
              if (data?.role?.toLowerCase() !== "admin") {
                router.push("/dashboard")
              } else {
                setUser(user)
                setAuthChecked(true)
              }
            },
            () => {
              if (!cancelled) router.push("/dashboard")
            }
          )
      },
      () => {
        if (!cancelled) {
          clearTimeout(timeoutId)
          router.push("/login")
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [router])

  // Show full-screen loader while verifying auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-brand-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-brand-gray-900 font-semibold text-sm">Verifying Access</p>
            <p className="text-brand-gray-400 text-xs mt-1">Checking your admin credentials...</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-2 text-xs text-brand-gray-400 underline hover:text-brand-gray-700"
          >
            Not loading? Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-brand-gray-100 flex">
      {/* Desktop Sidebar (Light Theme for Admin) */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-brand-gray-100 flex-col fixed inset-y-0 left-0 z-30">
        <AdminSidebarContent
          pathname={pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-brand-gray-900/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white flex flex-col shadow-2xl">
            <AdminSidebarContent
              pathname={pathname}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
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
              className="md:hidden p-2 text-brand-gray-500 hover:text-brand-gray-900 hover:bg-brand-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-brand-gray-900 font-semibold capitalize text-sm md:text-base">
              {(() => {
                const currentNav = NAV_ITEMS.find(n => pathname.startsWith(n.href))
                return currentNav ? t(`admin.${currentNav.key}`, currentNav.label) : t("admin.adminControl", "Admin Control")
              })()}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="light" />

            {/* Notifications */}
            <NotificationBell />

            {/* Avatar / Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-3 border-l hover:opacity-80 transition-opacity outline-none">
                  <div className="w-8 h-8 rounded-full bg-brand-gray-900 flex items-center justify-center text-amber-400 text-xs font-bold shadow-md">
                    {user?.email?.charAt(0).toUpperCase() || 'AD'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-sm font-bold text-brand-gray-800 leading-none">Admin</span>
                    <span className="text-[10px] text-brand-gray-400 font-medium">{user?.email || 'System'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 border-none shadow-2xl bg-white rounded-2xl">
                <DropdownMenuLabel className="px-2 py-2 text-xs font-bold text-brand-gray-400 uppercase tracking-widest">
                  {t("common.settings", "Account Management")}
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => router.push("/admin/profile")}
                  className="flex items-center gap-2 rounded-xl px-2 py-2.5 focus:bg-brand-gray-50 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-brand-gray-500" />
                  <span className="text-sm font-medium text-brand-gray-700">{t("common.profile", "My Profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push("/admin/settings")}
                  className="flex items-center gap-2 rounded-xl px-2 py-2.5 focus:bg-brand-gray-50 cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-brand-gray-500" />
                  <span className="text-sm font-medium text-brand-gray-700">{t("common.settings", "Settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-brand-gray-100" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-2 py-2.5 focus:bg-red-50 text-red-600 focus:text-red-700 cursor-pointer"
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{t("common.logout", "Logout System")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 pb-safe md:pb-8">
          {children}
        </main>

        {/* Mobile App Navigation */}
        <AdminMobileNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>
    </div>
  )
}

