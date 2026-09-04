"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, User, ShoppingBag, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "./NotificationBell"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { CartDrawer } from "./CartDrawer"
import { UserNav } from "./UserNav"
import { useCart } from "@/lib/store/useCart"
import { useI18n } from "@/lib/store/useI18n"

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const { totalItems } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const { t } = useI18n()

  const navLinks = [
    { name: t("Home"), href: "/" },
    { name: t("Parlours"), href: "/parlours" },
    { name: t("Shop"), href: "/shop" },
    { name: t("Wishlist"), href: "/wishlist" },
    { name: t("My Bookings"), href: "/bookings" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-2xl py-2 md:py-3"
          : "bg-transparent py-4 md:py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Parloora Logo" width={40} height={40} className="rounded-xl object-contain" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Parloora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform hover:after:origin-bottom-left hover:after:scale-x-100",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <NotificationBell />
              
              <Button 
                variant="ghost" 
                onClick={() => setIsCartOpen(true)}
                className="rounded-full relative p-2 h-10 w-10 hover:bg-primary/5"
              >
                <ShoppingBag className="w-5 h-5 text-brand-gray-700" />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems()}
                  </span>
                )}
              </Button>

              <UserNav user={user} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              <Button 
                variant="ghost" 
                onClick={() => setIsCartOpen(true)}
                className="rounded-full relative p-2 h-10 w-10 hover:bg-primary/5"
              >
                <ShoppingBag className="w-5 h-5 text-brand-gray-700" />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems()}
                  </span>
                )}
              </Button>

              <Link href="/login">
                <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
                  {t("Log in")}
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25">
                  {t("Sign up")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Button 
            variant="ghost" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="rounded-full p-2 h-9 w-9"
          >
            {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>
          <NotificationBell />
          <Button 
            variant="ghost" 
            onClick={() => setIsCartOpen(true)}
            className="rounded-full relative p-2 h-9 w-9"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-black h-3.5 min-w-3.5 px-0.5 rounded-full flex items-center justify-center border border-white">
                {totalItems()}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (searchQuery.trim()) {
                router.push(`/parlours?search=${encodeURIComponent(searchQuery)}`)
                setIsSearchOpen(false)
              }
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder={t("Search parlours or services...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-brand-gray-50 border border-brand-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
