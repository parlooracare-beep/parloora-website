"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Star, MapPin, Clock, Phone, ChevronLeft, Heart, Share2,
  CheckCircle2, Scissors, Calendar, ChevronRight, X, Loader2, Users, Sparkles, CreditCard, Store,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Trash2, Plus, Upload, Camera, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn, formatCurrency, formatParlourName } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

import { getParlourById, uploadGalleryImage, deleteGalleryImage } from "@/lib/actions/parlours"
import { createBooking, hasCompletedBooking, getBookedSlots, confirmBookingPayment } from "@/lib/actions/bookings"
import { submitReview } from "@/lib/actions/reviews"
import { getStaffForService } from "@/lib/actions/staff"
import { createClient } from "@/lib/supabase/client"
import { validatePromoCode, applyPromoCode } from "@/lib/actions/promo"
import { Database } from "@/types/supabase"
import { Elements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import { StripePaymentForm } from "@/components/shared/StripePaymentForm"

type Service = Database["public"]["Tables"]["services"]["Row"]
type ParlourWithDetails = NonNullable<Awaited<ReturnType<typeof getParlourById>>>

const SERVICE_CATEGORIES = ["All", "Hair", "Makeup", "Skincare", "Waxing", "Nails"]

// Time slots
const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
]

export default function ParlourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")
  const [parlour, setParlour] = React.useState<ParlourWithDetails | null>(null)
  const [loading, setLoading] = React.useState(true)

  const [activeCategory, setActiveCategory] = React.useState("All")
  const [selectedService, setSelectedService] = React.useState<Service | null>(null)
  const [isFavorited, setIsFavorited] = React.useState(false)
  const [showBooking, setShowBooking] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState("")
  const [selectedTime, setSelectedTime] = React.useState("")
  const [bookingStep, setBookingStep] = React.useState(1)
  const [isBooking, setIsBooking] = React.useState(false)
  const [bookingSuccess, setBookingSuccess] = React.useState(false)
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([])
  const [selectingSlots, setSelectingSlots] = React.useState<Record<string, string>>({}) // { time: userId }
  const [loadingSlots, setLoadingSlots] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = React.useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStaff, setSelectedStaff] = React.useState<any | null>(null)
  const [loadingStaff, setLoadingStaff] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [showLightbox, setShowLightbox] = React.useState(false)
  const [lightboxIndex, setLightboxIndex] = React.useState(0)
  const [activeImageIndex, setActiveImageIndex] = React.useState(0)
  
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState("")
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false)
  const [canReview, setCanReview] = React.useState(false)

  // Booking payment states
  const [bookingPaymentMethod, setBookingPaymentMethod] = React.useState<string>("cash")
  const [bookingStripeClientSecret, setBookingStripeClientSecret] = React.useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookingStripePaymentIntentId, setBookingStripePaymentIntentId] = React.useState<string | null>(null)
  const [showStripeBookingForm, setShowStripeBookingForm] = React.useState(false)
  const [activeBookingId, setActiveBookingId] = React.useState<string | null>(null)

  // Booking promo code states
  const [bookingPromoCode, setBookingPromoCode] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appliedBookingPromo, setAppliedBookingPromo] = React.useState<any>(null)
  const [bookingPromoError, setBookingPromoError] = React.useState<string | null>(null)
  const [isValidatingBookingPromo, setIsValidatingBookingPromo] = React.useState(false)
  const [showBookingPromoInput, setShowBookingPromoInput] = React.useState(false)

  const galleryUrls = parlour?.gallery_urls 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (Array.isArray(parlour.gallery_urls) ? parlour.gallery_urls : JSON.parse(parlour.gallery_urls as any)) as string[]
    : []

  const finalBookingTotal = appliedBookingPromo 
    ? Math.max(0, (selectedService?.price || 0) - appliedBookingPromo.discountAmount) 
    : (selectedService?.price || 0)

  const handleValidateBookingPromo = async () => {
    if (!bookingPromoCode.trim() || !selectedService) return
    setIsValidatingBookingPromo(true)
    setBookingPromoError(null)
    try {
      const res = await validatePromoCode(bookingPromoCode, "bookings", selectedService.price)
      if (res.success) {
        setAppliedBookingPromo(res)
        setBookingPromoError(null)
      } else {
        setBookingPromoError(res.error || "Invalid promo code")
      }
    } catch (err) {
      console.error(err)
      setBookingPromoError("An error occurred validating promo code")
    } finally {
      setIsValidatingBookingPromo(false)
    }
  }

  const handleRemoveBookingPromo = () => {
    setAppliedBookingPromo(null)
    setBookingPromoCode("")
    setBookingPromoError(null)
  }

  const handleShare = async () => {
    if (typeof window === "undefined") return
    if (navigator.share) {
      try {
        await navigator.share({
          title: parlour?.name || "Parloora",
          text: parlour?.description || "Check out this beauty parlour on Parloora!",
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy link:", err)
      }
    }
  }

  // Real-time setup
  React.useEffect(() => {
    if (!parlour || !selectedDate) return

    const supabase = createClient()
    
    // 1. Listen for actual database changes (confirmed bookings)
    const channel = supabase.channel(`parlour-slots-${parlour.id}-${selectedDate}`)
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `parlour_id=eq.${parlour.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new.date === selectedDate) {
            setBookedSlots(prev => [...prev, payload.new.time])
          }
        }
      )
      // 2. Listen for "Live Selecting" broadcast from other users
      .on('broadcast', { event: 'slot-selecting' }, ({ payload }) => {
        setSelectingSlots(prev => ({
          ...prev,
          [payload.time]: payload.userId
        }))
        
        // Auto-clear selecting status after 10 seconds if no update
        setTimeout(() => {
          setSelectingSlots(prev => {
            const next = { ...prev }
            if (next[payload.time] === payload.userId) {
              delete next[payload.time]
            }
            return next
          })
        }, 10000)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [parlour, selectedDate])

  // Broadcast own selection
  const broadcastSelection = (time: string) => {
    if (!parlour || !user) return
    const supabase = createClient()
    supabase.channel(`parlour-slots-${parlour.id}-${selectedDate}`).send({
      type: 'broadcast',
      event: 'slot-selecting',
      payload: { time, userId: user.id }
    })
  }

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from("users").select("role").eq("id", user.id).single()
          .then(({ data }) => setUserRole(data?.role ?? "customer"))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        supabase.from("users").select("role").eq("id", u.id).single()
          .then(({ data }) => setUserRole(data?.role ?? "customer"))
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getParlourById(id)
      setParlour(data)
      
      const verified = await hasCompletedBooking(id)
      setCanReview(verified)
      
      setLoading(false)
    }
    load()
  }, [id])

  React.useEffect(() => {
    if (parlour?.services && serviceParam && user && !selectedService) {
      const targetService = parlour.services.find((s) => s.id === serviceParam)
      if (targetService) {
        handleBook(targetService)
      }
    }
  }, [parlour, serviceParam, user, selectedService])

  const filteredServices = React.useMemo(() => {
    if (!parlour?.services) return []
    return activeCategory === "All"
      ? parlour.services
      : parlour.services.filter((s) => s.category === activeCategory)
  }, [parlour, activeCategory])

  const handleBook = async (service: Service) => {
    if (!user) {
      router.push(`/login?redirectedFrom=${encodeURIComponent(`/parlours/${id}?service=${service.id}`)}`)
      return
    }

    let role = userRole
    if (!role) {
      const supabase = createClient()
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single()
      role = data?.role ?? "customer"
      setUserRole(role)
    }

    if (role !== "customer") {
      alert("Only customer accounts can book services. Sellers and admins cannot create bookings.")
      return
    }

    setSelectedService(service)
    setShowBooking(true)
    setBookingStep(1)
    setSelectedDate("")
    setSelectedTime("")
    setSelectedStaff(null)
    setBookingSuccess(false)
    setBookingPaymentMethod("cash")
    setBookingStripeClientSecret(null)
    setBookingStripePaymentIntentId(null)
    setShowStripeBookingForm(false)
    
    setLoadingStaff(true)
    try {
      const staff = await getStaffForService(service.id)
      setStaffList(staff)
    } catch (err) {
      console.error("Error loading staff for service:", err)
      setStaffList([])
    } finally {
      setLoadingStaff(false)
    }
  }

  const handleStripeBookingSuccess = async (piId: string) => {
    if (activeBookingId) {
      await confirmBookingPayment(activeBookingId, piId, "stripe")
    }
    if (appliedBookingPromo) {
      await applyPromoCode(appliedBookingPromo.code)
    }
    setShowStripeBookingForm(false)
    setBookingSuccess(true)
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !parlour) return
    const file = files[0]

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("parlourId", parlour.id)
      formData.append("file", file)

      const res = await uploadGalleryImage(formData)
      if (res.success && res.url) {
        setParlour(prev => {
          if (!prev) return null
          const existing = prev.gallery_urls 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (Array.isArray(prev.gallery_urls) ? prev.gallery_urls : JSON.parse(prev.gallery_urls as any)) 
            : []
          return {
            ...prev,
            gallery_urls: [...existing, res.url]
          }
        })
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Error uploading image:", err)
      alert("Error uploading image")
    } finally {
      setIsUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleDeleteImage = async (url: string) => {
    if (!parlour) return
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const res = await deleteGalleryImage(parlour.id, url)
      if (res.success) {
        setParlour(prev => {
          if (!prev) return null
          const existing = prev.gallery_urls 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? (Array.isArray(prev.gallery_urls) ? prev.gallery_urls : JSON.parse(prev.gallery_urls as any)) 
            : []
          const filtered = existing.filter((u: string) => u !== url)
          return {
            ...prev,
            gallery_urls: filtered
          }
        })
        setActiveImageIndex(0)
      } else {
        alert("Delete failed: " + (res.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Error deleting image:", err)
      alert("Error deleting image")
    }
  }

  const handleConfirmBooking = async () => {
    if (!parlour || !selectedService) return

    setIsBooking(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsBooking(false)
      router.push(`/login?redirectedFrom=${encodeURIComponent(`/parlours/${id}?service=${selectedService.id}`)}`)
      return
    }

    const bookingData = {
      parlour_id: parlour.id,
      parlour_name: parlour.name,
      service_id: selectedService.id,
      service_name: selectedService.name,
      price: selectedService.price,
      amount: finalBookingTotal,
      date: selectedDate,
      time: selectedTime,
      status: "pending",
      payment_status: "pending",
      payment_method: bookingPaymentMethod,
      customer_id: user.id,
      customer_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || "Valued Customer",
      seller_id: parlour.owner_id,
      staff_id: selectedStaff?.id || null
    }

    const res = await createBooking(bookingData)
    
    if (!res.success) {
      setIsBooking(false)
      alert("Failed to create booking: " + res.error)
      return
    }

    const bookingId = res.data?.id
    setActiveBookingId(bookingId || null)

    // ── Cash ────────────────────────────────────────────────────────
    if (bookingPaymentMethod === "cash") {
      if (appliedBookingPromo) {
        await applyPromoCode(appliedBookingPromo.code)
      }
      setIsBooking(false)
      setBookingSuccess(true)
      return
    }

    // ── bKash ───────────────────────────────────────────────────────
    if (bookingPaymentMethod === "bkash") {
      try {
        if (appliedBookingPromo) {
          await applyPromoCode(appliedBookingPromo.code)
        }
        const bk = await fetch("/api/checkout/bkash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalBookingTotal, bookingId }),
        }).then((r) => r.json())

        if (bk.success && bk.bkashURL) {
          window.location.href = bk.bkashURL
          return
        }
        alert("bKash error: " + (bk.error || "Unknown error"))
      } catch (err) {
        console.error(err)
        alert("Failed to initiate bKash payment.")
      } finally {
        setIsBooking(false)
      }
      return
    }

    // ── SSLCommerz ──────────────────────────────────────────────────
    if (bookingPaymentMethod === "sslcommerz") {
      try {
        if (appliedBookingPromo) {
          await applyPromoCode(appliedBookingPromo.code)
        }
        const ssl = await fetch("/api/checkout/sslcommerz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalBookingTotal,
            bookingId,
            customerName: user?.user_metadata?.display_name || "Guest",
            customerEmail: user?.email || "guest@parloora.com",
            customerPhone: user?.phone || "01700000000",
            serviceName: selectedService.name,
          }),
        }).then((r) => r.json())

        if (ssl.success && ssl.gatewayUrl) {
          window.location.href = ssl.gatewayUrl
          return
        }
        alert("SSLCommerz error: " + (ssl.error || "Unknown error"))
      } catch (err) {
        console.error(err)
        alert("Failed to initiate SSLCommerz payment.")
      } finally {
        setIsBooking(false)
      }
      return
    }

    // ── Stripe ──────────────────────────────────────────────────────
    if (bookingPaymentMethod === "stripe") {
      try {
        const response = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalBookingTotal,
            email: user?.email || "",
            customerName: user?.user_metadata?.display_name || "Guest",
            bookingId,
            serviceName: selectedService.name,
          }),
        }).then((r) => r.json())

        if (response.success && response.clientSecret) {
          setBookingStripeClientSecret(response.clientSecret)
          setBookingStripePaymentIntentId(response.paymentIntentId)
          setShowStripeBookingForm(true)
          return
        }
        alert("Stripe session creation failed: " + (response.error || "Unknown error"))
      } catch (err) {
        console.error(err)
        alert("Failed to initiate Stripe payment.")
      } finally {
        setIsBooking(false)
      }
      return
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !parlour) return

    setIsSubmittingReview(true)
    const res = await submitReview({
      parlourId: parlour.id,
      rating,
      comment,
      customerName: user.user_metadata?.display_name || "Anonymous"
    })
    setIsSubmittingReview(false)

    if (res.success) {
      setComment("")
      setRating(5)
      const updated = await getParlourById(id)
      if (updated) setParlour(updated)
    } else {
      alert("Failed to submit review: " + res.error)
    }
  }
  // Load booked slots when date changes
  React.useEffect(() => {
    if (selectedDate && parlour) {
      async function loadSlots() {
        setLoadingSlots(true)
        const slots = await getBookedSlots(parlour!.id, selectedDate)
        setBookedSlots(slots || [])
        setLoadingSlots(false)
      }
      loadSlots()
    }
  }, [selectedDate, parlour])

  React.useEffect(() => {
    if (!showLightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLightbox(false)
      } else if (e.key === "ArrowLeft" && galleryUrls.length > 1) {
        setLightboxIndex(prev => (prev === 0 ? galleryUrls.length - 1 : prev - 1))
      } else if (e.key === "ArrowRight" && galleryUrls.length > 1) {
        setLightboxIndex(prev => (prev === galleryUrls.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showLightbox, galleryUrls.length])

  // Generate next 14 days
  const dates = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return {
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        value: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b px-4 py-3 sticky top-[72px] z-20">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-brand-gray-600 hover:text-primary transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={cn("p-2 rounded-full border transition-all", isFavorited ? "bg-red-50 border-red-200 text-red-500" : "border-brand-gray-200 text-brand-gray-400 hover:text-red-400")}
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500")} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full border border-brand-gray-200 text-brand-gray-400 hover:text-primary hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
              title="Share Parlour"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner / Gallery */}
      {parlour && galleryUrls.length > 0 ? (
        <div className="relative h-64 md:h-[450px] w-full bg-brand-gray-900 group">
          {/* Main Display Image */}
          <div 
            className="absolute inset-0 cursor-pointer overflow-hidden"
            onClick={() => {
              const currentIdx = activeImageIndex >= galleryUrls.length ? 0 : activeImageIndex
              setLightboxIndex(currentIdx)
              setShowLightbox(true)
            }}
          >
            <Image
              src={galleryUrls[activeImageIndex >= galleryUrls.length ? 0 : activeImageIndex] || ""}
              alt={`${parlour?.name || "Parlour"} gallery`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>

          {/* Left/Right Slide controls */}
          {galleryUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImageIndex(prev => (prev === 0 ? galleryUrls.length - 1 : prev - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImageIndex(prev => (prev === galleryUrls.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Upload Button overlay for owner/admin */}
          {user && (parlour.owner_id === user.id || userRole === "admin") && (
            <div className="absolute top-4 right-4 z-10">
              <input
                type="file"
                id="gallery-banner-upload"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
                disabled={isUploadingImage}
              />
              <label
                htmlFor="gallery-banner-upload"
                className="cursor-pointer bg-black/60 hover:bg-black/80 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/15 transition-all shadow-lg active:scale-95 select-none"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>Add Image</span>
              </label>
            </div>
          )}

          {/* Thumbnails strip at the bottom */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 max-w-[90%] overflow-x-auto scrollbar-none">
              {galleryUrls.map((url, idx) => (
                <div 
                  key={url} 
                  className={cn(
                    "relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0",
                    (activeImageIndex >= galleryUrls.length ? 0 : activeImageIndex) === idx ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <Image src={url} alt="thumbnail" fill className="object-cover" />
                  {/* Delete button on hover for owner/admin */}
                  {user && (parlour.owner_id === user.id || userRole === "admin") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(url)
                      }}
                      className="absolute top-0.5 right-0.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow-md hover:scale-110 transition-all"
                      title="Delete Image"
                    >
                      <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#2D0072] via-[#4A148C] to-[#880E4F] h-56 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Scissors className="w-32 h-32 text-white/10" />
          </div>

          {/* If owner/admin, show upload helper */}
          {parlour && user && (parlour.owner_id === user.id || userRole === "admin") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] p-4 text-center">
              <p className="text-white font-semibold mb-3 text-sm max-w-xs md:max-w-md">
                Add premium images to your parlour gallery to show clients what your parlour looks like!
              </p>
              <input
                type="file"
                id="gallery-banner-empty-upload"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
                disabled={isUploadingImage}
              />
              <label
                htmlFor="gallery-banner-empty-upload"
                className="cursor-pointer bg-white text-brand-gray-900 px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all select-none"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Upload className="w-4 h-4 text-primary" />
                )}
                <span>Upload First Gallery Image</span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 -mt-10 pb-16">
        {loading || !parlour ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-lg mt-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-brand-gray-500">Loading parlour details...</p>
          </div>
        ) : (
          <>
            {/* Booking Readiness Gate Banner */}
            {!parlour.is_booking_ready && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Booking Unavailable</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This parlour is currently updating its profile and documents. Online booking is temporarily disabled.
                  </p>
                </div>
              </div>
            )}

            {/* Info Card */}
            <Card className="mb-6 overflow-hidden shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {parlour.type || "Parlour"}
                      </Badge>
                      {parlour.featured && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">⭐ Featured</Badge>
                      )}
                      <Badge className={cn("text-xs border-0", parlour.status === 'active' || true ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                        {parlour.status === 'active' || true ? "● Open Now" : "● Closed"}
                      </Badge>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-brand-gray-900 mb-1">{formatParlourName(parlour.name)}</h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-gray-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <strong className="text-brand-gray-800">{parlour.rating || 5.0}</strong>
                        <span>({parlour.total_bookings || 0} bookings)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-gray-400" /> {parlour.address || parlour.city}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-gray-400" /> {"10:00 AM – 9:00 PM"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-brand-gray-400" /> {parlour.phone || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {["Women's Salon", "Premium", "Verified"].map((tag) => (
                        <span key={tag} className="text-xs bg-brand-gray-100 text-brand-gray-600 px-3 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-brand-gray-600 leading-relaxed border-t pt-4">
                  {parlour.description || "Welcome to our premium beauty parlour. Book your desired services today!"}
                </p>
              </CardContent>
            </Card>

        {/* Mobile Jump Links */}
        <div className="flex gap-2 lg:hidden mb-6 bg-white p-1 rounded-xl border border-brand-gray-100">
          <a href="#services" className="flex-1 text-center py-2 text-xs font-bold text-brand-gray-700 bg-brand-gray-50 rounded-lg hover:bg-brand-gray-100 transition-colors">Go to Services</a>
          <a href="#reviews" className="flex-1 text-center py-2 text-xs font-bold text-brand-gray-700 bg-brand-gray-50 rounded-lg hover:bg-brand-gray-100 transition-colors">Go to Reviews</a>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Services Section */}
          <div id="services" className="lg:col-span-2 space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-gray-900">Services</h2>
              <span className="text-sm text-brand-gray-400">{parlour.services?.length || 0} services available</span>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                    activeCategory === cat
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-white text-brand-gray-600 border border-brand-gray-200 hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service Cards */}
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-brand-gray-100 hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-gray-900 text-sm sm:text-base">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] sm:text-xs text-brand-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.duration || "60 min"}</span>
                        <span className="bg-brand-gray-100 px-2 py-0.5 rounded-full">{service.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto shrink-0">
                      <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                        <span className="text-xs text-brand-gray-400 sm:hidden">Price:</span>
                        <span className="font-bold text-primary text-base sm:text-lg">{formatCurrency(service.price)}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!parlour.is_booking_ready}
                        onClick={() => handleBook(service)}
                        className={cn(
                          "rounded-xl font-bold transition-all shadow-md h-10 w-full sm:w-auto px-6",
                          parlour.is_booking_ready
                            ? "bg-primary text-white hover:bg-primary/95 hover:scale-105 active:scale-95 cursor-pointer"
                            : "bg-brand-gray-100 text-brand-gray-400 border border-brand-gray-200 cursor-not-allowed"
                        )}
                      >
                        {parlour.is_booking_ready ? "Book Now" : "N/A"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reviews Sidebar */}
          <div id="reviews" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-brand-gray-900">Customer Reviews</h2>

            {/* Review Form */}
            {canReview && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-brand-gray-800 mb-3">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="focus:outline-none"
                        >
                          <Star className={cn("w-5 h-5", s <= rating ? "text-amber-400 fill-amber-400" : "text-brand-gray-300")} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary min-h-[80px]"
                      required
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmittingReview || !comment}
                      className="w-full bg-primary hover:bg-primary/90 rounded-xl h-10 text-xs font-bold"
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Rating Summary */}
            <Card className="border-brand-gray-100">
              <CardContent className="p-5 text-center">
                <div className="text-5xl font-black text-brand-gray-900 mb-1">{parlour.rating || 5.0}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-brand-gray-500">Based on {parlour.total_bookings || 0} bookings</p>
              </CardContent>
            </Card>

            {/* Review List */}
            <div className="space-y-3">
              {parlour.reviews?.map((review) => (
                <Card key={review.id} className="border-brand-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {review.customer_name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-brand-gray-800 text-sm">{review.customer_name}</span>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Customer
                            </span>
                          </div>
                          <span className="text-xs text-brand-gray-400 shrink-0">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                          {Array.from({ length: review.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-brand-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!parlour.reviews?.length && (
                <p className="text-sm text-brand-gray-500 text-center py-4">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* ══════════ BOOKING MODAL ══════════ */}
      {showBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative p-6 border-b">
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-brand-gray-100 w-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: bookingSuccess ? "100%" : `${(bookingStep / 3) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-brand-gray-900 leading-tight">
                    {bookingSuccess ? "Booking Confirmed! 🎉" : `Book: ${selectedService?.name}`}
                  </h3>
                  {!bookingSuccess && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
                        {bookingStep}
                      </span>
                      <p className="text-xs text-brand-gray-500 font-medium">
                        {bookingStep === 1 
                          ? "Choose your preferred date" 
                          : bookingStep === 2 
                          ? "Select an available time slot" 
                          : "Choose payment method"}
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowBooking(false)} 
                  className="p-2 hover:bg-brand-gray-100 rounded-full transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5 text-brand-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {bookingSuccess ? (
                /* Success State */
                <div className="text-center py-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h4 className="text-2xl font-bold text-brand-gray-900 mb-2">You&apos;re all set!</h4>
                  <p className="text-brand-gray-500 text-sm mb-8 leading-relaxed">
                    Great choice! Your appointment at <span className="text-brand-gray-900 font-bold">{parlour?.name ? formatParlourName(parlour.name) : ""}</span> is secured. 
                    {bookingPaymentMethod === "cash" 
                      ? " Zero advance payment needed — pay in cash directly at the parlour after your service."
                      : " We've sent the booking and payment receipt to your email."}
                  </p>
                  
                  <div className="relative bg-white border-2 border-brand-gray-100 rounded-2xl overflow-hidden shadow-sm mb-8">
                    {/* Ticket Notches */}
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-brand-gray-50 rounded-full border-r-2 border-brand-gray-100" />
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-brand-gray-50 rounded-full border-l-2 border-brand-gray-100" />
                    
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-dashed border-brand-gray-200">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Service</p>
                          <strong className="text-brand-gray-900">{selectedService?.name}</strong>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Type</p>
                          <Badge className="bg-primary/10 text-primary border-0 text-[10px]">{parlour?.type || "Parlour"}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pb-3 border-b border-dashed border-brand-gray-200">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Date</p>
                          <strong className="text-brand-gray-900">{selectedDate}</strong>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Time Slot</p>
                          <strong className="text-brand-gray-900">{selectedTime}</strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pb-3 border-b border-dashed border-brand-gray-200">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Specialist</p>
                          <strong className="text-brand-gray-900">{selectedStaff ? selectedStaff.name : "Any Specialist"}</strong>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Payment Method</p>
                          {bookingPaymentMethod === "cash" ? (
                            <span className="text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-300 font-bold px-2 py-0.5 rounded-full inline-block">
                              💵 Cash on Service
                            </span>
                          ) : (
                            <span className="text-xs text-brand-gray-700 bg-brand-gray-100 font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                              💳 {bookingPaymentMethod}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-widest">Total Price</p>
                          <strong className="text-2xl font-black text-primary">{formatCurrency(selectedService?.price || 0)}</strong>
                        </div>
                        <div className="w-12 h-12 bg-brand-gray-50 rounded-lg flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-brand-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowBooking(false)} 
                    className="w-full bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded-xl h-14 font-bold text-lg shadow-xl shadow-brand-gray-200"
                  >
                    Return to Parlour
                  </Button>
                </div>
              ) : showStripeBookingForm && bookingStripeClientSecret ? (
                /* Stripe Payment Form (Step 3 - Stripe View) */
                <div className="space-y-4">
                  <div className="bg-brand-gray-50 p-4 rounded-xl border mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-gray-400 font-bold uppercase">Booking Service</p>
                      <strong className="text-sm text-brand-gray-800">{selectedService?.name}</strong>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowStripeBookingForm(false)} className="text-xs text-primary font-bold">
                      Back
                    </Button>
                  </div>
                  <Elements
                    stripe={getStripe()}
                    options={{
                      clientSecret: bookingStripeClientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#2D0072",
                          colorBackground: "#ffffff",
                          colorText: "#1F2937",
                          borderRadius: "12px",
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      amount={selectedService?.price || 0}
                      onCancel={() => setShowStripeBookingForm(false)}
                      onSuccess={handleStripeBookingSuccess}
                    />
                  </Elements>
                </div>
              ) : bookingStep === 1 ? (
                /* Step 1: Date Selection */
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Available Dates
                      </p>
                      <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-widest">Select One</span>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-2 pb-4 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {dates.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => {
                            setSelectedDate(d.label)
                            setSelectedTime("") // Reset time when date changes
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 min-w-[72px] shrink-0",
                            selectedDate === d.label
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 -translate-y-1"
                              : "border-brand-gray-100 bg-white text-brand-gray-600 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase mb-1 opacity-70">{d.dayName}</span>
                          <span className="text-lg font-black">{d.dayNum}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Specialist */}
                  <div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <p className="text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Select Specialist
                      </p>
                      <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-widest">Optional</span>
                    </div>

                    {loadingStaff ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Any Specialist Option */}
                        <button
                          type="button"
                          onClick={() => setSelectedStaff(null)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 min-w-[90px] shrink-0 text-center",
                            selectedStaff === null
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 -translate-y-1"
                              : "border-brand-gray-100 bg-white text-brand-gray-600 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="w-10 h-10 rounded-full bg-brand-gray-100 flex items-center justify-center mb-2 text-brand-gray-500 font-bold border border-brand-gray-200">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                          </div>
                          <span className="text-xs font-bold leading-tight">Any</span>
                          <span className="text-[9px] opacity-70 mt-0.5">Specialist</span>
                        </button>

                        {/* Available Staff Members */}
                        {staffList.map((staff) => (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => setSelectedStaff(staff)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 min-w-[90px] max-w-[120px] shrink-0 text-center",
                              selectedStaff?.id === staff.id
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 -translate-y-1"
                                : "border-brand-gray-100 bg-white text-brand-gray-600 hover:border-primary/40 hover:bg-primary/5"
                            )}
                          >
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-2 overflow-hidden border border-brand-gray-200">
                              {staff.avatar_url ? (
                                <Image src={staff.avatar_url} alt={staff.name} fill className="object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-primary">{staff.name.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="text-xs font-bold truncate w-full leading-tight">{staff.name.split(' ')[0]}</span>
                            <span className="text-[9px] opacity-70 truncate w-full mt-0.5">{staff.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-gray-500 font-medium uppercase tracking-tighter">Selected Date</p>
                        <p className="text-sm font-bold text-brand-gray-900">{selectedDate}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : bookingStep === 2 ? (
                /* Step 2: Time Selection */
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-brand-gray-50 rounded-2xl p-4 border border-brand-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-gray-500 font-medium">Selected Date</p>
                        <p className="text-sm font-bold text-brand-gray-900">{selectedDate}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBookingStep(1)} className="text-primary hover:bg-primary/10 text-xs font-bold">
                      Change
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Available Time Slots
                      </p>
                      {loadingSlots ? (
                        <Loader2 className="w-3 h-3 animate-spin text-brand-gray-400" />
                      ) : (
                        <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-widest">Select One</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {TIME_SLOTS.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        const isBeingSelected = selectingSlots[time] && selectingSlots[time] !== user?.id;
                        
                        return (
                          <button
                            key={time}
                            disabled={isBooked || isBeingSelected || loadingSlots}
                            onClick={() => {
                              setSelectedTime(time);
                              broadcastSelection(time);
                            }}
                            className={cn(
                              "text-sm py-3 rounded-xl border font-bold transition-all duration-300 relative overflow-hidden",
                              selectedTime === time
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                : isBooked
                                ? "bg-brand-gray-50 border-brand-gray-100 text-brand-gray-300 cursor-not-allowed"
                                : isBeingSelected
                                ? "bg-amber-50 border-amber-100 text-amber-500 cursor-wait animate-pulse"
                                : "border-brand-gray-100 bg-white text-brand-gray-700 hover:border-primary/40 hover:bg-primary/5"
                            )}
                          >
                            <span className="relative z-10">{time}</span>
                            {isBooked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-50/50 backdrop-blur-[1px]">
                                <span className="text-[8px] bg-brand-gray-200 text-brand-gray-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Sold Out</span>
                              </div>
                            )}
                            {isBeingSelected && (
                              <div className="absolute top-0 right-0 p-1">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-white border border-brand-gray-200" />
                        <span className="text-[10px] text-brand-gray-400 font-bold uppercase">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] text-brand-gray-400 font-bold uppercase">Being Selected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-brand-gray-200" />
                        <span className="text-[10px] text-brand-gray-400 font-bold uppercase">Reserved</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Live System</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <AnimatePresence>
                    {selectedTime && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-brand-gray-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                              <Scissors className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-bold">{selectedService?.name}</h5>
                              <p className="text-xs text-white/60">{selectedService?.duration || "60 min"} duration</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {selectedStaff && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Specialist</span>
                                <span className="font-bold text-rose-300">{selectedStaff.name} ({selectedStaff.title})</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Service Price</span>
                              <span className="font-bold">{formatCurrency(selectedService?.price || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Platform Fee</span>
                              <span className="text-emerald-400 font-bold">Included</span>
                            </div>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                              <span className="text-lg font-bold">Total Amount</span>
                              <span className="text-2xl font-black text-secondary">{formatCurrency(selectedService?.price || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Step 3: Payment Method Selection */
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-brand-gray-50 rounded-2xl p-4 border border-brand-gray-100 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-gray-500 font-medium">Date & Time</p>
                        <p className="text-sm font-bold text-brand-gray-900">{selectedDate} at {selectedTime}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBookingStep(2)} className="text-primary hover:bg-primary/10 text-xs font-bold" disabled={isBooking}>
                      Change
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-bold text-brand-gray-800">Select how you want to pay:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { 
                          id: "cash", 
                          label: "Cash on Service (Pay at Parlour)", 
                          sub: "No advance payment needed. Pay in cash after treatment.", 
                          badge: "Recommended", 
                          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200", 
                          icon: Store 
                        },
                        { id: "bkash", label: "bKash", sub: "Pay in advance with Bangladesh's #1 MFS", badge: "MFS", badgeClass: "bg-primary/10 text-primary border-0", icon: null },
                        { id: "sslcommerz", label: "SSLCommerz", sub: "Pay via local banks, cards or mobile wallets", badge: "Local Pay", badgeClass: "bg-primary/10 text-primary border-0", icon: null },
                        { id: "stripe", label: "Pay Online (Stripe)", sub: "Secure checkout with credit or debit card", badge: "Card", badgeClass: "bg-primary/10 text-primary border-0", icon: CreditCard },
                      ].map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            disabled={isBooking}
                            onClick={() => setBookingPaymentMethod(method.id)}
                            className={cn(
                              "p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between",
                              bookingPaymentMethod === method.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                : "border-brand-gray-100 hover:border-primary/40 hover:bg-brand-gray-50",
                              isBooking && "opacity-55 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                bookingPaymentMethod === method.id ? "border-primary" : "border-brand-gray-200"
                              )}>
                                {bookingPaymentMethod === method.id && (
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-brand-gray-800 text-sm">{method.label}</span>
                                <p className="text-[10px] text-brand-gray-400 mt-0.5">{method.sub}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {method.badge && (
                                <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border", method.badgeClass)}>
                                  {method.badge}
                                </Badge>
                              )}
                              {Icon && <Icon className="w-4 h-4 text-brand-gray-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Cash on Service Informational Callout */}
                    {bookingPaymentMethod === "cash" && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5 text-emerald-900 mt-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed text-emerald-800">
                          <strong className="text-emerald-950">Zero Advance Payment:</strong> Your appointment slot is guaranteed immediately. You will pay ৳{finalBookingTotal.toLocaleString()} directly at the parlour counter after receiving your service.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing summary & Promo code */}
                  <div className="bg-brand-gray-50/50 rounded-2xl p-4 border border-brand-gray-100 space-y-4 mt-4">
                    <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-wider">Price Details</h4>
                    <div className="space-y-2 text-sm text-brand-gray-600">
                      <div className="flex justify-between">
                        <span>Service price</span>
                        <span className="font-semibold text-brand-gray-900">{formatCurrency(selectedService?.price || 0)}</span>
                      </div>
                      
                      {appliedBookingPromo && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount ({appliedBookingPromo.code})</span>
                          <span className="font-semibold">-৳{appliedBookingPromo.discountAmount}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span>Platform fee</span>
                        <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">Free</span>
                      </div>
                      
                      <div className="pt-2 border-t border-brand-gray-100 flex justify-between items-center text-brand-gray-900">
                        <span className="font-bold">Total Payable</span>
                        <span className="text-lg font-black text-primary">{formatCurrency(finalBookingTotal)}</span>
                      </div>
                    </div>

                    {/* Promo Code Input zone */}
                    <div className="pt-3 border-t border-brand-gray-100">
                      {!appliedBookingPromo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowBookingPromoInput(!showBookingPromoInput)}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            Have a promo code?
                          </button>
                          
                          {showBookingPromoInput && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="ENTER CODE"
                                value={bookingPromoCode}
                                onChange={(e) => setBookingPromoCode(e.target.value.toUpperCase())}
                                className="h-10 rounded-xl uppercase font-mono tracking-wider text-xs border-brand-gray-200 bg-white"
                              />
                              <Button
                                type="button"
                                onClick={handleValidateBookingPromo}
                                disabled={isValidatingBookingPromo || !bookingPromoCode.trim()}
                                className="bg-primary hover:bg-primary/95 text-white h-10 px-4 rounded-xl text-xs font-bold shrink-0"
                              >
                                {isValidatingBookingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                              </Button>
                            </div>
                          )}
                          {bookingPromoError && (
                            <p className="text-[11px] text-red-500 font-medium mt-1">{bookingPromoError}</p>
                          )}
                        </>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-brand-gray-500 font-semibold uppercase tracking-wider">Coupon Applied:</span>
                            <p className="text-xs font-bold text-emerald-700 font-mono tracking-wider mt-0.5">{appliedBookingPromo.code}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-600">-৳{appliedBookingPromo.discountAmount}</span>
                            <button
                              type="button"
                              onClick={handleRemoveBookingPromo}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!bookingSuccess && !showStripeBookingForm && (
              <div className="p-6 border-t bg-white flex gap-4">
                {bookingStep === 1 ? (
                  <Button
                    className="flex-1 h-14 bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-gray-100 disabled:opacity-50 transition-all active:scale-95"
                    disabled={!selectedDate}
                    onClick={() => setBookingStep(2)}
                  >
                    Select Time <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : bookingStep === 2 ? (
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" onClick={() => setBookingStep(1)} className="w-20 h-14 rounded-2xl border-brand-gray-200">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      className="flex-1 h-14 bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-gray-100 disabled:opacity-50 transition-all active:scale-95"
                      disabled={!selectedTime || loadingSlots}
                      onClick={() => setBookingStep(3)}
                    >
                      Select Payment <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" onClick={() => setBookingStep(2)} className="w-20 h-14 rounded-2xl border-brand-gray-200" disabled={isBooking}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    {!user ? (
                      <Button
                        asChild
                        className="flex-1 h-14 bg-brand-gray-900 hover:bg-brand-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-gray-100"
                      >
                        <Link href={`/login?redirectedFrom=/parlours/${id}`}>
                          Log in to Confirm
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                        disabled={isBooking}
                        onClick={handleConfirmBooking}
                      >
                        {isBooking ? (
                          <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
                        ) : bookingPaymentMethod === "cash" ? (
                          "Book with Cash on Service (Pay at Parlour)"
                        ) : (
                          "Proceed to Payment"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ LIGHTBOX MODAL ══════════ */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:rotate-90 duration-300 z-[60]"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image viewer */}
          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            {galleryUrls.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(prev => (prev === 0 ? galleryUrls.length - 1 : prev - 1))}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10 border border-white/5 active:scale-95"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <div className="relative w-full h-full max-w-[90vw] max-h-[80vh] flex items-center justify-center">
              <Image
                src={galleryUrls[lightboxIndex >= galleryUrls.length ? 0 : lightboxIndex] || ""}
                alt="Lightbox View"
                fill
                className="object-contain select-none"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>

            {galleryUrls.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(prev => (prev === galleryUrls.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10 border border-white/5 active:scale-95"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Indicator text */}
          <div className="mt-6 text-white/70 text-sm font-medium">
            Image {lightboxIndex + 1} of {galleryUrls.length}
          </div>
        </div>
      )}
    </div>
  )
}
