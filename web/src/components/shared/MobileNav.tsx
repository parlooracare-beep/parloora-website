"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Home, Search, ShoppingBag, User, Heart, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export function MobileNav() {
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

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Parlours", href: "/parlours", icon: Search },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Profile", href: user ? "/profile" : "/login", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-brand-gray-100 flex items-center justify-around px-2 py-3 pb-safe-offset-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 group relative transition-all duration-300",
                isActive ? "text-primary" : "text-brand-coolgray hover:text-brand-purple"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 scale-110" : "group-hover:bg-brand-gray-50"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-wide transition-all",
                isActive ? "opacity-100 transform translate-y-0" : "opacity-70"
              )}>
                {item.name}
              </span>
              
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
