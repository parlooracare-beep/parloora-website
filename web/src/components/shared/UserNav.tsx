"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  User, Settings, ShoppingBag, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar, Heart, LogOut, 
  Sparkles, ShieldCheck, ChevronRight, Globe
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { LanguageItems } from "./LanguageSwitcher"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useI18n, LANGUAGES } from "@/lib/store/useI18n"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserNav({ user }: { user: any }) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [counts, setCounts] = React.useState({ bookings: 0, orders: 0 })
  const { currentLang, setLanguage: setCurrentLang } = useI18n()

  React.useEffect(() => {
    // In a real app, you might fetch these or pass them as props
    // For now, we'll keep it simple or leave at 0 if not provided
  }, [user])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
  }

  const userRole = (user.user_metadata?.role || "customer").toLowerCase()
  const isSeller = userRole === "seller"
  const isAdmin = userRole === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 rounded-full pl-2 pr-4 flex items-center gap-3 bg-brand-gray-50/50 hover:bg-brand-gray-100 group transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 group-hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="User Avatar" fill className="object-cover" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
             </div>
          </div>
          <div className="flex flex-col items-start text-left hidden sm:flex">
            <span className="text-sm font-bold text-brand-gray-900 leading-tight">
              {user.user_metadata?.display_name || user.user_metadata?.full_name || "Account"}
            </span>
            <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-widest">
              {user.user_metadata?.role || "Member"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 rounded-[1.5rem] p-0 overflow-hidden shadow-2xl shadow-brand-gray-200 border-brand-gray-100 bg-white" align="end">
        <DropdownMenuLabel className="p-5 bg-gradient-to-br from-[#2D0072] via-[#4A148C] to-[#880E4F] text-white">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-black flex items-center gap-2">
              Hello, {user.user_metadata?.display_name?.split(" ")[0] || "Beauty Lover"}! ✨
            </p>
            <p className="text-xs font-medium text-white/60 truncate">{user.email}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
             <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center backdrop-blur-sm">
               <p className="text-lg font-black text-white">0</p>
               <p className="text-[10px] text-white/70 font-bold uppercase">Bookings</p>
             </div>
             <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center backdrop-blur-sm">
               <p className="text-lg font-black text-white">0</p>
               <p className="text-[10px] text-white/70 font-bold uppercase">Orders</p>
             </div>
          </div>
          
          <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/10 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-bold text-white">Gold Member</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-brand-gray-100" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors">
            <Link href="/dashboard" className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-gray-900">Dashboard</p>
                <p className="text-[10px] text-brand-gray-400">View history & activity</p>
              </div>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors">
            <Link href="/profile" className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-gray-900">Edit Profile</p>
                <p className="text-[10px] text-brand-gray-400">Personal information</p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors">
            <Link href="/bookings" className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-gray-900">My Bookings</p>
                <p className="text-[10px] text-brand-gray-400">Manage appointments</p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors">
            <Link href="/orders" className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-gray-900">My Orders</p>
                <p className="text-[10px] text-brand-gray-400">Purchased products</p>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors flex items-center gap-3 w-full outline-none data-[state=open]:bg-brand-gray-50">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-gray-900">Language</p>
                <p className="text-[10px] text-brand-gray-400">{currentLang.name} ({currentLang.code.toUpperCase()})</p>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-gray-300 ml-auto" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48 rounded-2xl p-2 shadow-2xl border-brand-gray-100 ml-1 bg-white z-50">
                <LanguageItems currentLang={currentLang} onSelect={setCurrentLang} />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-brand-gray-100" />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors m-1">
              <Link href="/admin/dashboard" className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-brand-gray-900 uppercase tracking-tight">Admin Panel</p>
                  <p className="text-[10px] text-brand-gray-400 italic">System administration</p>
                </div>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {isSeller && (
          <>
            <DropdownMenuSeparator className="bg-brand-gray-100" />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-brand-gray-50 transition-colors m-1">
              <Link href="/seller/dashboard" className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-brand-gray-900 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-brand-gray-900 uppercase tracking-tight">Seller Panel</p>
                  <p className="text-[10px] text-brand-gray-400 italic">Manage your parlour</p>
                </div>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-brand-gray-100" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="rounded-xl cursor-pointer p-3 hover:bg-red-50 text-red-500 transition-colors m-1 flex items-center gap-3 font-bold text-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          Logout Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
