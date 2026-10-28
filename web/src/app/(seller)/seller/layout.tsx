"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Store, 
  Calendar, 
  Users, 
  Settings, 
  PlusCircle, 
  Sparkles,
  Clock,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Building2,
  Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/shared/NotificationBell"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { useI18n } from "@/lib/store/useI18n"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/seller/dashboard", icon: Store, key: "dashboard" },
  { label: "Appointments", href: "/seller/appointments", icon: Calendar, key: "appointments" },
  { label: "Parlours", href: "/seller/parlours", icon: Building2, key: "parlours" },
  { label: "Products", href: "/seller/products", icon: Package, key: "products" },
  { label: "Services", href: "/seller/services", icon: Sparkles, key: "services" },
  { label: "Opening Hours", href: "/seller/hours", icon: Clock, key: "hours" },
  { label: "Staff", href: "/seller/staff", icon: Users, key: "staff" },
  { label: "Earnings", href: "/seller/earnings", icon: CreditCard, key: "earnings" },
  { label: "Settings", href: "/seller/settings", icon: Settings, key: "settings" },
]

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-brand-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-brand-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-gray-100">
          <Link href="/seller/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black shadow-md shadow-primary/20">
              P
            </span>
            <span className="text-brand-gray-900 font-extrabold tracking-tight">Partner Portal</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-brand-gray-400 hover:text-brand-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <Link
            href="/seller/services/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-white rounded-xl font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Service
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-brand-gray-600 hover:text-primary hover:bg-primary/5"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-brand-gray-400 group-hover:text-primary"
                )} />
                <span>{t(`seller.${item.key}`, item.label)}</span>
              </Link>
            )
          })}
        </nav>

        {/* Live Site Link */}
        <div className="p-3 border-t border-brand-gray-100">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center justify-between p-2 text-xs font-medium text-brand-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-gray-400 group-hover:text-primary" />
              Customer Site
            </span>
            <span className="text-[10px] bg-brand-gray-100 group-hover:bg-primary/10 group-hover:text-primary px-1.5 py-0.5 rounded text-brand-gray-500 font-mono">
              Live
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-brand-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Page title derived from path */}
            <h1 className="text-brand-gray-900 font-semibold capitalize text-sm md:text-base">
              {(() => {
                const currentNav = NAV_ITEMS.find(n => pathname.startsWith(n.href))
                return currentNav ? t(`seller.${currentNav.key}`, currentNav.label) : t("seller.portalTitle", "Seller Portal")
              })()}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="light" className="hidden sm:inline-flex" />

            {/* Notifications */}
            <NotificationBell />

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <span className="hidden sm:block text-sm font-medium text-brand-gray-700">
                {t("customer.roleSeller", "Seller")}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-brand-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
