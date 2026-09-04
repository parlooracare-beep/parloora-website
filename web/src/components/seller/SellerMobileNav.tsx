"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LayoutDashboard, Calendar, Scissors, Package, Settings, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SellerMobileNav() {
  const pathname = usePathname()

  const navItems = [
    { label: "Dash", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/seller/bookings", icon: Calendar },
    { label: "Orders", href: "/seller/orders", icon: Package },
    { label: "Services", href: "/seller/services", icon: Scissors },
    { label: "Settings", href: "/seller/settings", icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-brand-gray-100 px-2 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300",
                isActive ? "text-primary" : "text-brand-gray-400"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-primary/10 scale-110" : ""
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                )} />
              </div>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
