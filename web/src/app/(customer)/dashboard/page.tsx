"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingBag, Calendar, User, Settings, 
  ChevronRight, Clock, MapPin, Package,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Star, MessageSquare, Heart, Shield
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import { getCustomerBookings } from "@/lib/actions/bookings"
import { getCustomerOrders } from "@/lib/actions/orders"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile } from "@/lib/actions/profile"
import { ProfileCompletionRing } from "@/components/shared/ProfileCompletionRing"
import { ProfileCompletionBanner } from "@/components/shared/ProfileCompletionBanner"

export default function CustomerDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = React.useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState<"bookings" | "orders">("bookings")
  
  // Profile completion states
  const [profileCompletion, setProfileCompletion] = React.useState(0)
  const [missingItems, setMissingItems] = React.useState<{ label: string; href: string }[]>([])

  React.useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          const [bData, oData, profileData] = await Promise.all([
            getCustomerBookings().catch(err => {
              console.error("Error loading customer bookings:", err)
              return []
            }),
            getCustomerOrders().catch(err => {
              console.error("Error loading customer orders:", err)
              return []
            }),
            getUserProfile().catch(err => {
              console.error("Error loading user profile:", err)
              return null
            })
          ])
          setBookings(bData || [])
          setOrders(oData || [])

          if (profileData) {
            setProfileCompletion(profileData.profileCompletion)
            
            const missing: { label: string; href: string }[] = []
            if (!profileData.avatarUrl) {
              missing.push({ label: "Upload profile picture", href: "/profile" })
            }
            if (!profileData.phone) {
              missing.push({ label: "Add phone number", href: "/profile" })
            }
            if (!profileData.gender) {
              missing.push({ label: "Select your gender", href: "/profile" })
            }
            if (!profileData.dob) {
              missing.push({ label: "Set your date of birth", href: "/profile" })
            }
            if (!profileData.location) {
              missing.push({ label: "Add your current location", href: "/profile" })
            }
            if (!profileData.beautyPreferences || profileData.beautyPreferences.length === 0) {
              missing.push({ label: "Add your beauty preferences", href: "/profile" })
            }
            if (!profileData.emergencyContact || !profileData.emergencyContact.name || !profileData.emergencyContact.phone) {
              missing.push({ label: "Set emergency contact details", href: "/profile" })
            }
            setMissingItems(missing)
          }
        }
      } catch (err) {
        console.error("Error in dashboard loadData:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-brand-gray-500 font-bold animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-gray-50">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-gray-100">
          <Shield className="w-10 h-10 text-brand-gray-300" />
        </div>
        <h1 className="text-2xl font-black text-brand-gray-900 mb-2">Access Denied</h1>
        <p className="text-brand-gray-500 mb-8 max-w-xs">Please log in to view your personalized dashboard and history.</p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-bold">
          <Link href="/login">Login Now</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray-50/50 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Profile Completion Nudge Banner */}
        <ProfileCompletionBanner 
          percentage={profileCompletion} 
          missingItems={missingItems} 
          dismissKey={`customer_${user.id}`} 
        />

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-brand-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shrink-0">
              <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                ) : (
                  <User className="w-10 h-10 text-brand-gray-300" />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black text-brand-gray-900 mb-1 truncate">
                Hello, {user.user_metadata?.display_name || "Beauty Lover"}! ✨
              </h1>
              <p className="text-brand-gray-500 font-medium text-sm truncate">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-brand-gray-100 px-2 py-1 rounded-lg text-xs">
                  <Calendar className="w-3 h-3 mr-1.5 text-primary" /> {bookings.length} Bookings
                </Badge>
                <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-brand-gray-100 px-2 py-1 rounded-lg text-xs">
                  <ShoppingBag className="w-3 h-3 mr-1.5 text-primary" /> {orders.length} Orders
                </Badge>
                <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-brand-gray-100 px-2 py-1 rounded-lg text-xs">
                  <Star className="w-3 h-3 mr-1.5 text-luxury-gold" /> Gold Member
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 w-full sm:w-auto">
              {/* Profile Completion Circle */}
              <div className="flex items-center gap-3 bg-brand-gray-50 border border-brand-gray-100 rounded-2xl p-3">
                <ProfileCompletionRing percentage={profileCompletion} size={48} strokeWidth={5} />
                <div className="text-left">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gray-400">Profile</p>
                  <p className="text-xs font-black text-brand-gray-800">{profileCompletion}% Set</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl border-brand-gray-200" asChild>
                  <Link href="/profile"><Settings className="w-3.5 h-3.5 mr-1.5" />Settings</Link>
                </Button>
                <Button size="sm" className="bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded-xl" asChild>
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-brand-gray-100 w-full md:w-fit">
          <button
            onClick={() => setActiveTab("bookings")}
            className={cn(
              "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === "bookings" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-brand-gray-500 hover:bg-brand-gray-50"
            )}
          >
            <Calendar className="w-4 h-4" /> My Bookings
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === "orders" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-brand-gray-500 hover:bg-brand-gray-50"
            )}
          >
            <Package className="w-4 h-4" /> My Orders
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "bookings" ? (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {bookings.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-2 border-brand-gray-200 bg-transparent py-20 text-center">
                  <Calendar className="w-12 h-12 text-brand-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-brand-gray-900">No appointments yet</h3>
                  <p className="text-brand-gray-500 mb-6">Discover premium parlours and book your next session.</p>
                  <Button asChild className="bg-primary text-white rounded-xl">
                    <Link href="/parlours">Browse Parlours</Link>
                  </Button>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="rounded-3xl border-brand-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className={cn(
                              "px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest",
                              booking.status === "confirmed" ? "bg-emerald-100 text-emerald-600" : 
                              booking.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-brand-gray-100 text-brand-gray-600"
                            )}>
                              {booking.status}
                            </Badge>
                            <span className="text-xs text-brand-gray-400 font-bold">#{booking.id.slice(0, 8)}</span>
                          </div>
                          
                          <h3 className="text-xl font-black text-brand-gray-900 mb-2">{booking.service_name}</h3>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-sm text-brand-gray-500">
                              <Calendar className="w-4 h-4 text-primary/50" /> {booking.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-gray-500">
                              <Clock className="w-4 h-4 text-primary/50" /> {booking.time}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-gray-500">
                              <MapPin className="w-4 h-4 text-primary/50" /> {booking.parlour_name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-brand-gray-50 p-6 md:w-64 border-l border-brand-gray-100 flex flex-col justify-between items-end">
                          <div className="text-right">
                            <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-widest mb-1">Amount</p>
                            <p className="text-2xl font-black text-primary">{formatCurrency(booking.amount)}</p>
                          </div>
                          <Button asChild variant="outline" size="sm" className="rounded-xl border-brand-gray-200 mt-4">
                            <Link href={`/parlours/${booking.parlour_id}`}>View Details <ChevronRight className="w-4 h-4 ml-1" /></Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {orders.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-2 border-brand-gray-200 bg-transparent py-20 text-center">
                  <Package className="w-12 h-12 text-brand-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-brand-gray-900">No orders yet</h3>
                  <p className="text-brand-gray-500 mb-6">Explore our curated collection of luxury beauty products.</p>
                  <Button asChild className="bg-primary text-white rounded-xl">
                    <Link href="/shop">Go to Shop</Link>
                  </Button>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="rounded-3xl border-brand-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                              {order.status}
                            </Badge>
                            <span className="text-xs text-brand-gray-400 font-bold">Order #{order.id.slice(0, 8)}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-gray-50 flex items-center justify-center border border-brand-gray-100">
                              <Package className="w-6 h-6 text-brand-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-brand-gray-900">{order.items_count} Items Purchased</p>
                              <p className="text-xs text-brand-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="relative w-10 h-10 rounded-lg bg-brand-gray-50 border border-brand-gray-100 flex-shrink-0 overflow-hidden">
                                {item.image_url && <Image src={item.image_url} alt="" fill className="object-cover" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-brand-gray-50 p-6 md:w-64 border-l border-brand-gray-100 flex flex-col justify-between items-end">
                          <div className="text-right">
                            <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                            <p className="text-2xl font-black text-brand-gray-900">{formatCurrency(order.total_amount)}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="ghost" size="sm" className="text-brand-gray-500">Track</Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-brand-gray-200">View Invoice</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
