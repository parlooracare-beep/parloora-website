"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  Calendar,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Tag,
  ShieldCheck,
  Activity,
  MapPin,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { NotificationBell } from "@/components/shared/NotificationBell"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/store/useI18n"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, key: "dashboard" },
  { label: "Parlours", href: "/admin/parlours", icon: Store, key: "parlours" },
  { label: "Services", href: "/admin/services", icon: Sparkles, key: "services" },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar, key: "bookings" },
  { label: "Promo Codes", href: "/admin/promo-codes", icon: Tag, key: "promoCodes" },
  { label: "Commission & Payouts", href: "/admin/payouts", icon: CreditCard, key: "payouts" },
  { label: "Locations", href: "/admin/locations", icon: MapPin, key: "locations" },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: Activity, key: "activityLogs" },
  { label: "Users & Roles", href: "/admin/users", icon: Users, key: "users" },
  { label: "Settings", href: "/admin/settings", icon: Settings, key: "settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-brand-gray-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight leading-none block">
                Parloora
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mt-0.5">
                Super Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-brand-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick status bar */}
        <div className="px-4 py-3 bg-brand-gray-950/50 border-b border-brand-gray-800/60 flex items-center justify-between text-xs">
          <span className="text-brand-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </span>
          <span className="text-[11px] text-amber-400/90 font-mono bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            v2.4-prod
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-gray-500 mb-2">
            Platform Management
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-brand-gray-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-brand-gray-300 hover:text-white hover:bg-brand-gray-800/70"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-brand-gray-950" : "text-brand-gray-400 group-hover:text-amber-400"
                  )}
                />
                <span className="flex-1">{t(`admin.${item.key}`, item.label)}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gray-950" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Live site link */}
        <div className="px-3 py-2 border-t border-brand-gray-800/60">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-brand-gray-400 hover:text-white hover:bg-brand-gray-800 rounded-lg transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-gray-400 group-hover:text-amber-400" />
              View Live Website
            </span>
            <span className="text-[10px] bg-brand-gray-800 group-hover:bg-brand-gray-700 px-1.5 py-0.5 rounded text-brand-gray-400 font-mono">
              ↗
            </span>
          </Link>
        </div>

        {/* User / Sign out footer */}
        <div className="p-3 border-t border-brand-gray-800 bg-brand-gray-950/30">
          <div className="flex items-center justify-between gap-3 px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-brand-gray-950 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-none">
                  Admin User
                </p>
                <p className="text-[10px] text-brand-gray-400 truncate mt-1">
                  {user?.email || "admin@parloora.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-brand-gray-400 hover:text-red-400 hover:bg-brand-gray-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-gray-200/80 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
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
            <LanguageSwitcher variant="light" className="hidden sm:inline-flex" />

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
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl bg-white border border-brand-gray-100">
                <DropdownMenuItem asChild className="rounded-lg text-xs font-medium cursor-pointer">
                  <Link href="/admin/settings">System Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg text-xs font-medium cursor-pointer">
                  <Link href="/admin/activity-logs">Security Logs</Link>
                </DropdownMenuItem>
                <div className="h-px bg-brand-gray-100 my-1" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="rounded-lg text-xs font-medium text-red-600 focus:text-red-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
