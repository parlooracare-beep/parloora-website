"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Calendar, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/store/useI18n"

export function MobileNav() {
  const { t } = useI18n()
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Never render customer bottom navigation on seller or admin screens
  if (pathname.startsWith("/seller") || pathname.startsWith("/admin")) {
    return null
  }

  const navItems = [
    {
      name: t("nav.home"),
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: t("nav.explore"),
      href: "/parlours",
      icon: Compass,
      isActive: pathname === "/parlours" || pathname.startsWith("/parlours/"),
    },
    {
      name: t("nav.bookings"),
      href: "/bookings",
      icon: Calendar,
      isActive: pathname === "/bookings" || pathname.startsWith("/bookings/"),
    },
    {
      name: t("nav.favorites"),
      href: "/wishlist",
      icon: Heart,
      isActive: pathname === "/wishlist",
    },
    {
      name: t("nav.profile"),
      href: user ? "/dashboard" : "/login",
      icon: User,
      isActive: pathname === "/dashboard" || pathname === "/profile" || pathname === "/login" || pathname === "/signup",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-2xl border-t border-brand-rose/20 flex items-center justify-around px-1 py-1.5 pb-safe-offset-2 shadow-[0_-6px_25px_rgba(75,30,109,0.08)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1 px-1 touch-target touch-press rounded-2xl relative transition-all duration-200 select-none",
                active ? "text-primary" : "text-brand-coolgray hover:text-brand-purple"
              )}
            >
              <div
                className={cn(
                  "relative p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center",
                  active
                    ? "bg-gradient-to-br from-primary/15 to-secondary/30 scale-105 shadow-sm shadow-primary/10"
                    : "hover:bg-brand-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    active ? "stroke-[2.4px] text-primary" : "stroke-[1.8px] text-brand-coolgray"
                  )}
                />
                {active && (
                  <span className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-0.5 transition-all duration-200",
                  active
                    ? "font-bold text-primary scale-105"
                    : "font-medium text-brand-coolgray"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
