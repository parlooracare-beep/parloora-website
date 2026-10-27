"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Store, Users, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminMobileNavProps {
  onOpenMenu?: () => void
}

export function AdminMobileNav({ onOpenMenu }: AdminMobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Parlours", href: "/admin/parlours", icon: Store },
    { label: "Users", href: "/admin/users", icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-brand-gray-200 px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[58px] py-1 transition-all touch-target",
                isActive ? "text-primary" : "text-brand-gray-500 hover:text-brand-gray-900"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-primary/10 scale-105" : ""
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "stroke-[2.5px] text-primary" : "stroke-[1.8px]"
                )} />
              </div>
              <span className={cn(
                "text-[10px] leading-none",
                isActive ? "font-bold text-primary" : "font-medium text-brand-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Menu button to open the full drawer */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center gap-1 min-w-[58px] py-1 text-brand-gray-500 hover:text-brand-gray-900 transition-all touch-target"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="w-5 h-5 stroke-[1.8px]" />
          </div>
          <span className="text-[10px] font-medium leading-none">
            More
          </span>
        </button>
      </div>
    </nav>
  )
}
