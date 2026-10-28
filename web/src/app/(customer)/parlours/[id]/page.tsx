"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Star, MapPin, Clock, Phone, ChevronLeft, Heart, Share2,
  CheckCircle2, Scissors, Calendar, ChevronRight, X, Loader2, Users, Sparkles, CreditCard, Store,
  Trash2, Camera, Navigation, MessageSquare, ShieldCheck
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
import { toggleFavorite, getIsFavorited } from "@/lib/actions/favorites"
import { getParlourOpeningStatus } from "@/lib/opening-hours"
import { useI18n } from "@/lib/store/useI18n"
import { createClient } from "@/lib/supabase/client"
import { validatePromoCode, applyPromoCode } from "@/lib/actions/promo"
import { Database } from "@/types/supabase"
import dynamic from "next/dynamic"

const StripeBookingPayment = dynamic(
  () => import("@/components/shared/StripeBookingPayment"),
  {
    ssr: false,
    loading: () => (
      <div className="py-8 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-brand-gray-500 font-medium">Loading secure payment gateway...</p>
      </div>
    ),
  }
)

type Service = Database["public"]["Tables"]["services"]["Row"]
type ParlourWithDetails = NonNullable<Awaited<ReturnType<typeof getParlourById>>>

// Branded luxury fallback cover for parlours without an uploaded cover image
const DEFAULT_COVER_IMAGE = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"

// Category-specific placeholder images when service has no photo
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
  styling: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
  skincare: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80",
  makeup: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=400&q=80",
  nails: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80",
  waxing: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
  grooming: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80",
}

function getServiceFallbackImage(categoryName?: string | null): string {
  if (!categoryName) return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"
  const lower = categoryName.toLowerCase()
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (lower.includes(key)) return url
  }
  return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80"
}

// Format duration cleanly, appending 'min' if bare number
function formatDuration(duration?: string | null): string {
  if (!duration) return "30 min"
  const trimmed = duration.trim()
  if (trimmed.toLowerCase().includes("min") || trimmed.toLowerCase().includes("hr") || trimmed.toLowerCase().includes("hour")) {
    return trimmed
  }
  return `${trimmed} min`
}

// Booking time slots
const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
]

export default function ParlourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get("service")
  const { t } = useI18n()

  const [parlour, setParlour] = React.useState<ParlourWithDetails | null>(null)
  const [loading, setLoading] = React.useState(true)

  const [activeCategory, setActiveCategory] = React.useState("All")
  const [selectedService, setSelectedService] = React.useState<Service | null>(null)
  const [isFavorited, setIsFavorited] = React.useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Booking states
  const [showBooking, setShowBooking] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState("")
  const [selectedTime, setSelectedTime] = React.useState("")
  const [bookingStep, setBookingStep] = React.useState(1)
  const [isBooking, setIsBooking] = React.useState(false)
  const [bookingSuccess, setBookingSuccess] = React.useState(false)
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([])
  const [selectingSlots, setSelectingSlots] = React.useState<Record<string, string>>({})
  const [loadingSlots, setLoadingSlots] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = React.useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStaff, setSelectedStaff] = React.useState<any | null>(null)
  const [loadingStaff, setLoadingStaff] = React.useState(false)

  // User state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [userRole, setUserRole] = React.useState<string | null>(null)

  // Gallery / Lightbox
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [showLightbox, setShowLightbox] = React.useState(false)
  const [lightboxIndex, setLightboxIndex] = React.useState(0)

  // Reviews
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

  // Gallery URLs parser
  const galleryUrls = React.useMemo(() => {
    if (!parlour?.gallery_urls) return []
    try {
      if (Array.isArray(parlour.gallery_urls)) return parlour.gallery_urls as string[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.parse(parlour.gallery_urls as any) as string[]
    } catch {
      return []
    }
  }, [parlour])

  // Cover image resolver
  const coverImageUrl = React.useMemo(() => {
    if (parlour?.cover_url && parlour.cover_url.trim()) return parlour.cover_url.trim()
    if (galleryUrls.length > 0 && galleryUrls[0]) return galleryUrls[0]
    if (parlour?.image && parlour.image.trim()) return parlour.image.trim()
    return DEFAULT_COVER_IMAGE
  }, [parlour, galleryUrls])

  // Opening hours calculation in Asia/Dhaka
  const openingStatus = React.useMemo(() => {
    return getParlourOpeningStatus(parlour?.opening_hours, parlour?.status === "Active" || parlour?.is_active !== false)
  }, [parlour])

  // Review calculations & statistics
  const reviewList = React.useMemo(() => parlour?.reviews || [], [parlour])
  const reviewCount = reviewList.length
  const avgRating = React.useMemo(() => {
    if (reviewCount === 0) return null
    const total = reviewList.reduce((acc, r) => acc + (r.rating || 0), 0)
    return parseFloat((total / reviewCount).toFixed(1))
  }, [reviewList, reviewCount])

  // Rating distribution: 5, 4, 3, 2, 1
  const ratingDistribution = React.useMemo(() => {
    if (reviewCount === 0) return null
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewList.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)))
      counts[star] = (counts[star] || 0) + 1
    })
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: counts[stars] || 0,
      percentage: Math.round(((counts[stars] || 0) / reviewCount) * 100),
    }))
  }, [reviewList, reviewCount])

  // Verified business status
  const isVerifiedBusiness = Boolean(
    parlour?.trade_license ||
    (Array.isArray(parlour?.verification_docs) && parlour.verification_docs.length > 0) ||
    parlour?.is_booking_ready
  )

  // Premium status
  const isPremiumPartner = Boolean(parlour?.featured)

  // Business Category Label
  const businessCategoryLabel = React.useMemo(() => {
    if (!parlour?.type) return "Beauty Parlour"
    const lower = parlour.type.toLowerCase().trim()
    if (lower.includes("woman") || lower.includes("women")) return "Women's Salon"
    if (lower.includes("man") || lower.includes("men")) return "Men's Salon"
    if (lower.includes("spa")) return "Spa & Wellness"
    if (lower.includes("makeup")) return "Makeup Studio"
    if (lower.includes("unisex")) return "Unisex Salon"
    return parlour.type
  }, [parlour])

  // Available service categories (dynamic extraction from parlour's services)
  const availableCategories = React.useMemo(() => {
    if (!parlour?.services || parlour.services.length === 0) return ["All"]
    const set = new Set<string>()
    parlour.services.forEach((s) => {
      if (s.category && s.category.trim()) {
        set.add(s.category.trim())
      }
    })
    return ["All", ...Array.from(set)]
  }, [parlour])

  // Filtered services
  const filteredServices = React.useMemo(() => {
    if (!parlour?.services) return []
    if (activeCategory === "All") return parlour.services
    return parlour.services.filter(
      (s) => s.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase()
    )
  }, [parlour, activeCategory])

  // Total pricing after promo
  const finalBookingTotal = appliedBookingPromo
    ? Math.max(0, (selectedService?.price || 0) - appliedBookingPromo.discountAmount)
    : (selectedService?.price || 0)

  // Dates for step 1 of booking
  const bookingDates = React.useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return {
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" }),
        value: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
      }
    })
  }, [])

  // Google Maps Directions link
  const directionsUrl = React.useMemo(() => {
    if (!parlour) return null
    if (parlour.map_lat && parlour.map_lng) {
      return `https://www.google.com/maps/search/?api=1&query=${parlour.map_lat},${parlour.map_lng}`
    }
    const queryParts = [parlour.name, parlour.full_address || parlour.address, parlour.city, "Bangladesh"].filter(Boolean)
    if (queryParts.length > 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(", "))}`
    }
    return null
  }, [parlour])

  // Share handler
  const handleShare = async () => {
    if (typeof window === "undefined" || !parlour) return
    const shareData = {
      title: `${formatParlourName(parlour.name)} | Parloora`,
      text: parlour.description || `Book self-care appointments at ${formatParlourName(parlour.name)} on Parloora!`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setToastMessage(t("Link copied to clipboard!"))
      setTimeout(() => setToastMessage(null), 3500)
    } catch (err) {
      console.error("Clipboard copy error:", err)
    }
  }

  // Wishlist toggle handler
  const handleToggleFavorite = async () => {
    if (!parlour) return
    if (!user) {
      router.push(`/login?redirectedFrom=${encodeURIComponent(`/parlours/${id}`)}`)
      return
    }

    setIsTogglingFavorite(true)
    const nextState = !isFavorited
    setIsFavorited(nextState)

    try {
      const res = await toggleFavorite(parlour.id)
      if (res.success) {
        setToastMessage(res.action === "added" ? t("Added to Wishlist") : t("Removed from Wishlist"))
        setTimeout(() => setToastMessage(null), 3000)
      } else {
        // Revert on failure
        setIsFavorited(!nextState)
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err)
      setIsFavorited(!nextState)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  // Promo code validation
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

  // Real-time setup for slot conflicts
  React.useEffect(() => {
    if (!parlour || !selectedDate) return

    const supabase = createClient()
    const channel = supabase.channel(`parlour-slots-${parlour.id}-${selectedDate}`)

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `parlour_id=eq.${parlour.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new.date === selectedDate) {
            setBookedSlots((prev) => [...prev, payload.new.time])
          }
        }
      )
      .on("broadcast", { event: "slot-selecting" }, ({ payload }) => {
        setSelectingSlots((prev) => ({
          ...prev,
          [payload.time]: payload.userId,
        }))

        setTimeout(() => {
          setSelectingSlots((prev) => {
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

  const broadcastSelection = (time: string) => {
    if (!parlour || !user) return
    const supabase = createClient()
    supabase.channel(`parlour-slots-${parlour.id}-${selectedDate}`).send({
      type: "broadcast",
      event: "slot-selecting",
      payload: { time, userId: user.id },
    })
  }

  // Auth & user role loader
  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        const metaRole = (user.user_metadata?.role as string | undefined)?.toLowerCase()
        if (metaRole) setUserRole(metaRole)
        supabase.from("users").select("role").eq("id", user.id).single()
          .then(({ data }) => {
            if (data?.role) setUserRole(data.role.toLowerCase())
          })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const metaRole = (u.user_metadata?.role as string | undefined)?.toLowerCase()
        if (metaRole) setUserRole(metaRole)
        supabase.from("users").select("role").eq("id", u.id).single()
          .then(({ data }) => {
            if (data?.role) setUserRole(data.role.toLowerCase())
          })
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load parlour data & initial wishlist status
  React.useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await getParlourById(id)
        if (!isMounted) return
        setParlour(data)
        setLoading(false)

        if (data?.username && id !== data.username && typeof window !== "undefined") {
          window.history.replaceState(null, "", `/parlours/${data.username}`)
        }

        // Check verification & review eligibility
        if (data?.id) {
          hasCompletedBooking(data.id)
            .then((verified) => {
              if (isMounted) setCanReview(verified)
            })
            .catch(() => {})

          getIsFavorited(data.id)
            .then((fav) => {
              if (isMounted) setIsFavorited(fav)
            })
            .catch(() => {})
        }
      } catch (err) {
        console.error("Error loading parlour:", err)
        if (isMounted) {
          setParlour(null)
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [id])

  // Book service handler
  const handleBook = React.useCallback(async (service: Service) => {
    if (!user) {
      router.push(`/login?redirectedFrom=${encodeURIComponent(`/parlours/${id}?service=${service.id}`)}`)
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
  }, [id, router, user])

  // Auto-open booking modal if service query param is present
  React.useEffect(() => {
    if (parlour?.services && serviceParam && user && !selectedService) {
      const targetService = parlour.services.find((s) => s.id === serviceParam)
      if (targetService) {
        const timer = setTimeout(() => handleBook(targetService), 50)
        return () => clearTimeout(timer)
      }
    }
  }, [parlour, serviceParam, user, selectedService, handleBook])

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

  // Gallery image upload for owner/admin
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !parlour) return

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("parlourId", parlour.id)

    try {
      const res = await uploadGalleryImage(formData)
      if (res.success && res.url) {
        setParlour((prev) => {
          if (!prev) return null
          const nextUrls = [res.url, ...galleryUrls]
          return {
            ...prev,
            gallery_urls: nextUrls,
          }
        })
      } else {
        alert("Upload failed: " + (res.error || "Unknown error"))
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!parlour || !confirm("Are you sure you want to delete this photo from the gallery?")) return

    try {
      const res = await deleteGalleryImage(parlour.id, imageUrl)
      if (res.success) {
        setParlour((prev) => {
          if (!prev) return null
          const nextUrls = galleryUrls.filter((u) => u !== imageUrl)
          return {
            ...prev,
            gallery_urls: nextUrls,
          }
        })
      } else {
        alert("Delete failed: " + (res.error || "Unknown error"))
      }
    } catch (err) {
      console.error(err)
      alert("Error deleting image")
    }
  }

  // Booking confirmation
  const handleConfirmBooking = async () => {
    if (!user || !parlour || !selectedService || !selectedDate || !selectedTime) return

    setIsBooking(true)
    const res = await createBooking({
      parlour_id: parlour.id,
      service_id: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      payment_method: bookingPaymentMethod,
      staff_id: selectedStaff?.id,
      original_price: selectedService.price,
      amount: finalBookingTotal,
    })

    if (!res.success) {
      setIsBooking(false)
      alert("Failed to create booking: " + res.error)
      return
    }

    const bookingId = res.data?.id
    setActiveBookingId(bookingId || null)

    if (bookingPaymentMethod === "cash") {
      if (appliedBookingPromo) {
        await applyPromoCode(appliedBookingPromo.code)
      }
      setIsBooking(false)
      setBookingSuccess(true)
      return
    }

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

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !parlour) return

    setIsSubmittingReview(true)
    const res = await submitReview({
      parlourId: parlour.id,
      rating,
      comment,
      customerName: user.user_metadata?.display_name || "Anonymous",
    })
    setIsSubmittingReview(false)

    if (res.success) {
      setComment("")
      setRating(5)
      setToastMessage(t("Thank you! Your review has been published."))
      setTimeout(() => setToastMessage(null), 3500)
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

  // Lightbox keyboard controls
  React.useEffect(() => {
    if (!showLightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowLightbox(false)
      } else if (e.key === "ArrowLeft" && galleryUrls.length > 1) {
        setLightboxIndex((prev) => (prev === 0 ? galleryUrls.length - 1 : prev - 1))
      } else if (e.key === "ArrowRight" && galleryUrls.length > 1) {
        setLightboxIndex((prev) => (prev === galleryUrls.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showLightbox, galleryUrls])

  // JSON-LD Schema.org Structured Data
  const jsonLd = React.useMemo(() => {
    if (!parlour) return null
    return {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      name: formatParlourName(parlour.name),
      image: coverImageUrl,
      telephone: parlour.phone || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: parlour.full_address || parlour.address || undefined,
        addressLocality: parlour.city || undefined,
        addressCountry: "BD",
      },
      geo: parlour.map_lat && parlour.map_lng ? {
        "@type": "GeoCoordinates",
        latitude: parlour.map_lat,
        longitude: parlour.map_lng,
      } : undefined,
      url: typeof window !== "undefined" ? window.location.href : `https://parloora.com/parlours/${parlour.username || parlour.id}`,
      priceRange: "৳৳",
      aggregateRating: reviewCount > 0 && avgRating ? {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviewCount,
      } : undefined,
    }
  }, [parlour, coverImageUrl, avgRating, reviewCount])

  return (
    <div className="min-h-screen bg-[#FBF9FC] text-brand-gray-900 pb-20">
      {/* Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-brand-gray-900/95 text-white backdrop-blur-md px-5 py-3 rounded-full text-xs font-bold shadow-2xl border border-white/15 flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ 1. PREMIUM PARLOUR COVER HERO ══════════ */}
      <div className="relative w-full h-[220px] sm:h-[260px] md:h-[290px] bg-brand-gray-900 overflow-hidden select-none">
        {/* Cover Background Image */}
        <Image
          src={coverImageUrl}
          alt={parlour ? `${formatParlourName(parlour.name)} cover` : "Parlour cover"}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 hover:scale-102"
        />

        {/* Sophisticated Dual Gradient Overlay for legibility & depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40 pointer-events-none" />

        {/* Top Navigation & Action Controls */}
        <div className="container mx-auto px-4 md:px-6 relative z-20 pt-4 flex items-center justify-between">
          {/* Back Pill Button */}
          <Link
            href="/parlours"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/65 text-white/95 text-xs font-semibold backdrop-blur-md border border-white/20 transition-all hover:-translate-x-0.5 active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t("Back to Parlours")}</span>
          </Link>

          {/* Quick Action Floating Pills */}
          <div className="flex items-center gap-2">
            {/* Gallery Lightbox Trigger */}
            {galleryUrls.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(0)
                  setShowLightbox(true)
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 hover:bg-black/65 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos ({galleryUrls.length})</span>
              </button>
            )}

            {/* Wishlist Toggle Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-sm border",
                isFavorited
                  ? "bg-red-500/90 text-white border-red-400 hover:bg-red-600"
                  : "bg-black/45 text-white hover:bg-black/65 border-white/20 hover:text-rose-200"
              )}
            >
              <Heart className={cn("w-4 h-4 transition-transform", isFavorited && "fill-current scale-110")} />
            </button>

            {/* Native Share Button */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share parlour profile"
              className="p-2.5 rounded-full bg-black/45 hover:bg-black/65 text-white hover:text-[#E2A9A9] backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Owner Upload Button */}
            {user && parlour && (parlour.owner_id === user.id || userRole === "admin") && (
              <div className="relative">
                <input
                  type="file"
                  id="cover-photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="cover-photo-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/80 hover:bg-primary text-white text-xs font-bold backdrop-blur-md border border-white/25 transition-all active:scale-95 cursor-pointer shadow-md select-none"
                >
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Add Photo</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ 2. PARLOUR INFORMATION & DETAILS ══════════ */}
      <div className="container mx-auto px-4 md:px-6 -mt-12 sm:-mt-16 relative z-30">
        {loading ? (
          /* Shimmer Loading Skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-brand-gray-100">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-gray-200 shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="flex gap-2">
                    <div className="h-5 w-24 bg-brand-gray-200 rounded-full" />
                    <div className="h-5 w-20 bg-brand-gray-200 rounded-full" />
                  </div>
                  <div className="h-8 w-64 bg-brand-gray-200 rounded-xl" />
                  <div className="h-4 w-48 bg-brand-gray-100 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 w-full bg-white rounded-2xl border border-brand-gray-100 shadow-sm" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-white rounded-2xl border border-brand-gray-100 p-4 shadow-sm" />
                  ))}
                </div>
              </div>
              <div className="h-72 bg-white rounded-3xl border border-brand-gray-100 shadow-sm" />
            </div>
          </div>
        ) : !parlour ? (
          /* 404 / Parlour Not Found */
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl mt-6 border border-brand-gray-100 max-w-lg mx-auto px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">Parlour Not Found</h1>
            <p className="text-sm text-brand-gray-500 mb-6">
              The parlour you are looking for may have been moved, renamed, or is currently inactive.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/parlours" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white px-6">
                  Browse Parlours
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-full px-6">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Main Parlour Header Card */}
            <Card className="mb-6 overflow-hidden shadow-xl border border-brand-gray-100/80 bg-white rounded-3xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Avatar & Core Metadata */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
                    {/* Overlapping Logo Avatar */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-[#FAF7FC] shrink-0 flex items-center justify-center">
                      {parlour.logo_url || parlour.image ? (
                        <Image
                          src={parlour.logo_url || parlour.image || ""}
                          alt={`${formatParlourName(parlour.name)} logo`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#4B1D5F] to-[#7B2E9F] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
                          {formatParlourName(parlour.name).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Titles and Badges */}
                    <div className="flex-1 min-w-0">
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Business Category */}
                        <Badge variant="outline" className="bg-[#4B1D5F]/6 text-[#4B1D5F] border-[#4B1D5F]/20 text-[11px] font-bold px-2.5 py-0.5">
                          {businessCategoryLabel}
                        </Badge>

                        {/* Verified Status Badge (authoritative check only) */}
                        {isVerifiedBusiness && (
                          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t("Verified Business")}</span>
                          </Badge>
                        )}

                        {/* Premium Partner Badge (only when featured) */}
                        {isPremiumPartner && (
                          <Badge className="bg-gradient-to-r from-amber-50 to-rose-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold px-2.5 py-0.5 inline-flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{t("Premium")}</span>
                          </Badge>
                        )}

                        {/* Real Operating Status Badge */}
                        <Badge
                          className={cn(
                            "text-[11px] font-bold px-2.5 py-0.5 inline-flex items-center gap-1.5 border",
                            openingStatus.isOpen
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-brand-gray-100 text-brand-gray-600 border-brand-gray-200"
                          )}
                        >
                          <span className={cn("w-2 h-2 rounded-full", openingStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-brand-gray-400")} />
                          <span>{t(openingStatus.statusLabel)}</span>
                        </Badge>
                      </div>

                      {/* Business Name */}
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-gray-900 tracking-tight leading-tight">
                        {formatParlourName(parlour.name)}
                      </h1>

                      {/* Public Handle */}
                      {parlour.username && (
                        <p className="text-xs font-mono text-[#4B1D5F]/80 font-medium mt-0.5 mb-2">
                          @{parlour.username}
                        </p>
                      )}

                      {/* Authoritative Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-brand-gray-600 mt-2">
                        {/* Rating & Review Count (Critical Rating Rule: No fake 5.0 when 0 reviews) */}
                        {reviewCount > 0 && avgRating !== null ? (
                          <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-xl text-amber-900 font-bold">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{avgRating}</span>
                            <span className="text-xs font-normal text-amber-800">
                              ({reviewCount} {reviewCount === 1 ? t("reviews") : t("reviews")})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-brand-gray-50 border border-brand-gray-200/60 px-2.5 py-1 rounded-xl text-brand-gray-600 font-semibold text-xs">
                            <Star className="w-3.5 h-3.5 text-brand-gray-400" />
                            <span>{t("No reviews yet")}</span>
                          </div>
                        )}

                        {/* Location */}
                        {(parlour.full_address || parlour.address || parlour.city) && (
                          <span className="flex items-center gap-1 text-brand-gray-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#4B1D5F] shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">
                              {parlour.full_address || parlour.address || parlour.city}
                            </span>
                          </span>
                        )}

                        {/* Today's Hours */}
                        <span className="flex items-center gap-1 text-brand-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#4B1D5F] shrink-0" />
                          <span>{openingStatus.todayHoursText}</span>
                        </span>

                        {/* Call action */}
                        {parlour.phone && (
                          <a
                            href={`tel:${parlour.phone}`}
                            className="flex items-center gap-1 text-[#4B1D5F] font-semibold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{parlour.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Direct Action Bar */}
                  <div className="flex flex-wrap sm:flex-nowrap md:flex-col items-stretch gap-2.5 shrink-0 pt-2 md:pt-0">
                    <Button
                      variant="rosegold"
                      onClick={() => {
                        const el = document.getElementById("services")
                        if (el) el.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="flex-1 md:flex-initial h-11 rounded-xl font-bold px-6 shadow-md shadow-[#E2A9A9]/25 hover:scale-102 transition-all cursor-pointer"
                    >
                      <Scissors className="w-4 h-4 mr-1.5" />
                      <span>{t("Available Services")}</span>
                    </Button>

                    <div className="flex items-center gap-2 w-full">
                      {directionsUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 rounded-xl border-brand-gray-200 text-brand-gray-700 hover:border-[#4B1D5F]/40 hover:text-[#4B1D5F] font-bold text-xs"
                        >
                          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                            <Navigation className="w-3.5 h-3.5 mr-1 text-[#4B1D5F]" />
                            <span>{t("Directions")}</span>
                          </a>
                        </Button>
                      )}

                      {parlour.phone && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 rounded-xl border-brand-gray-200 text-brand-gray-700 hover:border-[#4B1D5F]/40 hover:text-[#4B1D5F] font-bold text-xs"
                        >
                          <a href={`tel:${parlour.phone}`}>
                            <Phone className="w-3.5 h-3.5 mr-1 text-[#4B1D5F]" />
                            <span>{t("Call")}</span>
                          </a>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="h-9 px-3 rounded-xl border-brand-gray-200 text-brand-gray-700 hover:border-[#4B1D5F]/40 hover:text-[#4B1D5F] font-bold text-xs"
                        title={t("Share Parlour")}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Optional Clean Business Description */}
                {parlour.description && parlour.description.trim().length > 0 && (
                  <p className="mt-5 text-xs sm:text-sm text-brand-gray-600 leading-relaxed border-t border-brand-gray-100 pt-4">
                    {parlour.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mobile In-Page Quick Jump Tabs */}
            <div className="flex lg:hidden gap-2 mb-6 bg-white p-1 rounded-2xl border border-brand-gray-100 shadow-sm">
              <a
                href="#services"
                className="flex-1 text-center py-2 text-xs font-bold text-brand-gray-700 bg-brand-gray-50 rounded-xl hover:bg-brand-gray-100 transition-colors"
              >
                {t("Services")} ({parlour.services?.length || 0})
              </a>
              <a
                href="#reviews"
                className="flex-1 text-center py-2 text-xs font-bold text-brand-gray-700 bg-brand-gray-50 rounded-xl hover:bg-brand-gray-100 transition-colors"
              >
                {t("Reviews")} ({reviewCount})
              </a>
              <a
                href="#hours"
                className="flex-1 text-center py-2 text-xs font-bold text-brand-gray-700 bg-brand-gray-50 rounded-xl hover:bg-brand-gray-100 transition-colors"
              >
                {t("Opening Hours")}
              </a>
            </div>

            {/* ══════════ 3. MAIN CONTENT: SERVICES & REVIEWS ══════════ */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Services Section */}
              <div id="services" className="lg:col-span-2 space-y-6 scroll-mt-24">
                {/* Services Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-gray-200/80 pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-gray-900 tracking-tight">
                      {t("Available Services")}
                    </h2>
                    <p className="text-xs text-brand-gray-500 mt-0.5">
                      Select your desired beauty and self-care treatments to book instantly.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary w-fit">
                    {filteredServices.length} {filteredServices.length === 1 ? t("service available") : t("services available")}
                  </span>
                </div>

                {/* Dynamic Category Filter Pills */}
                {availableCategories.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer",
                          activeCategory === cat
                            ? "bg-[#4B1D5F] text-white shadow-md shadow-[#4B1D5F]/25"
                            : "bg-white text-brand-gray-600 border border-brand-gray-200 hover:border-[#4B1D5F]/40 hover:text-[#4B1D5F]"
                        )}
                      >
                        {t(cat)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Service Cards Grid */}
                {filteredServices.length > 0 ? (
                  <div className="space-y-3.5">
                    {filteredServices.map((service) => {
                      const imageSrc = service.image || getServiceFallbackImage(service.category)
                      const hasDiscount = (service.discount || 0) > 0
                      const originalPrice = service.price
                      const discountAmount = hasDiscount ? Math.round((originalPrice * (service.discount || 0)) / 100) : 0
                      const effectivePrice = hasDiscount ? originalPrice - discountAmount : originalPrice

                      return (
                        <Card
                          key={service.id}
                          className="border border-brand-gray-100 hover:border-[#4B1D5F]/35 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white group"
                        >
                          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Service Media & Info */}
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Thumbnail */}
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-gray-100 shrink-0 border border-brand-gray-100">
                                <Image
                                  src={imageSrc}
                                  alt={service.name}
                                  fill
                                  sizes="80px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {service.category && (
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FAF5FF] text-[#4B1D5F] px-2 py-0.5 rounded-md border border-[#4B1D5F]/15">
                                      {t(service.category)}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-brand-gray-500 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-brand-gray-400" />
                                    <span>{formatDuration(service.duration)}</span>
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                      {service.discount}% OFF
                                    </span>
                                  )}
                                </div>

                                <h3 className="font-bold text-brand-gray-900 text-base sm:text-lg leading-tight group-hover:text-[#4B1D5F] transition-colors">
                                  {service.name}
                                </h3>

                                {service.description && (
                                  <p className="text-xs text-brand-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Price & Book Action CTA */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                              <div className="text-left sm:text-right">
                                <div className="flex items-baseline gap-2">
                                  {hasDiscount && (
                                    <span className="line-through text-xs text-brand-gray-400 font-medium">
                                      {formatCurrency(originalPrice)}
                                    </span>
                                  )}
                                  <span className="font-black text-[#4B1D5F] text-lg sm:text-xl">
                                    {formatCurrency(effectivePrice)}
                                  </span>
                                </div>
                              </div>

                              <Button
                                variant="rosegold"
                                size="sm"
                                onClick={() => handleBook(service)}
                                className="h-10 px-6 rounded-xl font-black text-xs shadow-md shadow-[#E2A9A9]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              >
                                {t("Book Now")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  /* Empty State for Services */
                  <div className="text-center py-12 bg-white rounded-2xl border border-brand-gray-100 p-6">
                    <Scissors className="w-10 h-10 text-brand-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-brand-gray-800">
                      {activeCategory === "All" ? t("No services available") : t("No services found in this category.")}
                    </h3>
                    <p className="text-xs text-brand-gray-400 mt-1 max-w-sm mx-auto">
                      {activeCategory === "All"
                        ? "This parlour has not published any active services yet. Please check back soon or call the parlour."
                        : "Try selecting another category to see available self-care services."}
                    </p>
                    {activeCategory !== "All" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveCategory("All")}
                        className="mt-4 rounded-full text-xs font-bold"
                      >
                        View All Services
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Opening Hours & Reviews Sidebar */}
              <div className="space-y-6">
                {/* ══════════ OPENING HOURS CARD ══════════ */}
                <Card id="hours" className="border border-brand-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden scroll-mt-24">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#4B1D5F]" />
                        <h3 className="font-bold text-brand-gray-900 text-sm sm:text-base">
                          {t("Opening Hours")}
                        </h3>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 border",
                          openingStatus.isOpen
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-brand-gray-100 text-brand-gray-600 border-brand-gray-200"
                        )}
                      >
                        {t(openingStatus.statusLabel)}
                      </Badge>
                    </div>

                    <div className="divide-y divide-brand-gray-100 text-xs">
                      {openingStatus.scheduleList.map((item) => (
                        <div
                          key={item.day}
                          className={cn(
                            "py-2 flex items-center justify-between transition-colors",
                            item.isToday && "font-bold text-[#4B1D5F] bg-[#FAF5FF] -mx-2 px-2 rounded-lg"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {item.day}
                            {item.isToday && (
                              <span className="text-[9px] font-bold bg-[#4B1D5F] text-white px-1.5 py-0.2 rounded uppercase">
                                Today
                              </span>
                            )}
                          </span>
                          <span className={cn(item.closed ? "text-brand-gray-400" : "text-brand-gray-700")}>
                            {item.hoursText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ══════════ CUSTOMER REVIEWS SECTION ══════════ */}
                <div id="reviews" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-brand-gray-900 tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#4B1D5F]" />
                      <span>{t("Customer Reviews")}</span>
                    </h3>
                    <span className="text-xs text-brand-gray-400 font-medium">
                      {reviewCount} {reviewCount === 1 ? t("reviews") : t("reviews")}
                    </span>
                  </div>

                  {/* Rating Summary Card (Only displays authoritative numbers; NO fake 5.0!) */}
                  {reviewCount > 0 && avgRating !== null ? (
                    <Card className="border border-brand-gray-100 rounded-3xl bg-white shadow-sm overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-brand-gray-100">
                          <div>
                            <div className="text-4xl font-black text-brand-gray-900 leading-none">
                              {avgRating}
                            </div>
                            <div className="flex items-center gap-0.5 mt-1.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    "w-4 h-4",
                                    s <= Math.round(avgRating)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-brand-gray-200"
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-[11px] text-brand-gray-400 mt-1">
                              {t("Based on")} {reviewCount} {t("reviews")}
                            </p>
                          </div>

                          {/* Verified Review Guarantee Badge */}
                          <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-2xl text-center max-w-[140px]">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-emerald-900 leading-tight">
                              100% Verified Customer Reviews
                            </p>
                          </div>
                        </div>

                        {/* Rating Distribution Bars */}
                        {ratingDistribution && (
                          <div className="space-y-1.5">
                            {ratingDistribution.map((row) => (
                              <div key={row.stars} className="flex items-center gap-2 text-xs">
                                <span className="w-4 font-bold text-brand-gray-600">{row.stars}★</span>
                                <div className="flex-1 h-2 bg-brand-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                    style={{ width: `${row.percentage}%` }}
                                  />
                                </div>
                                <span className="w-6 text-[10px] text-brand-gray-400 text-right">
                                  {row.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    /* Zero Reviews Neutral Empty State (NO fake 5.0!) */
                    <Card className="border border-brand-gray-100 rounded-3xl bg-white shadow-sm overflow-hidden text-center p-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto mb-3 text-amber-500">
                        <Star className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-brand-gray-800 text-sm">
                        {t("No reviews yet")}
                      </h4>
                      <p className="text-xs text-brand-gray-500 mt-1 leading-relaxed max-w-xs mx-auto">
                        {t("Be the first to review this parlour after your visit!")}
                      </p>
                      <p className="text-[11px] text-brand-gray-400 mt-2">
                        Only verified customers with completed appointments can publish reviews.
                      </p>
                    </Card>
                  )}

                  {/* Review Submission Form (Only for eligible verified customers) */}
                  {canReview && (
                    <Card className="border border-[#4B1D5F]/20 bg-[#FAF7FC] rounded-3xl shadow-sm overflow-hidden">
                      <CardContent className="p-5">
                        <h4 className="text-sm font-bold text-brand-gray-900 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{t("Leave a Review")}</span>
                        </h4>
                        <p className="text-xs text-brand-gray-500 mb-3">
                          You recently completed an appointment here. Tell us about your service!
                        </p>
                        <form onSubmit={handleSubmitReview} className="space-y-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setRating(s)}
                                className="p-1 focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={cn(
                                    "w-5 h-5",
                                    s <= rating ? "text-amber-400 fill-amber-400" : "text-brand-gray-300"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t("Share your experience...")}
                            className="w-full rounded-2xl border border-brand-gray-200 bg-white text-xs sm:text-sm p-3 focus:ring-2 focus:ring-[#4B1D5F] focus:outline-none min-h-[85px]"
                            required
                          />
                          <Button
                            type="submit"
                            disabled={isSubmittingReview || !comment.trim()}
                            className="w-full bg-[#4B1D5F] hover:bg-[#3B154B] text-white rounded-xl h-10 text-xs font-bold shadow-md cursor-pointer"
                          >
                            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : t("Submit Review")}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Published Review Cards List */}
                  {reviewList.length > 0 && (
                    <div className="space-y-3">
                      {reviewList.map((review) => (
                        <Card key={review.id} className="border border-brand-gray-100 rounded-2xl bg-white shadow-xs">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Customer Avatar */}
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4B1D5F] to-[#7B2E9F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {review.customer_name?.charAt(0).toUpperCase() || "U"}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <h5 className="font-bold text-brand-gray-900 text-xs sm:text-sm">
                                      {review.customer_name || "Verified Customer"}
                                    </h5>
                                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> {t("Verified Customer")}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-brand-gray-400 shrink-0">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="flex items-center gap-0.5 mt-1 mb-2">
                                  {Array.from({ length: review.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  ))}
                                </div>

                                <p className="text-xs text-brand-gray-700 leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════ 4. BOOKING MODAL (PRESERVED & ENHANCED) ══════════ */}
      {showBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative p-5 sm:p-6 border-b border-brand-gray-100">
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-brand-gray-100 w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: bookingSuccess ? "100%" : `${(bookingStep / 3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#4B1D5F] via-[#7B2E9F] to-[#E2A9A9] transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-brand-gray-900 leading-tight">
                    {bookingSuccess ? "Booking Confirmed! 🎉" : `${t("Book Now")}: ${selectedService?.name}`}
                  </h3>
                  {!bookingSuccess && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4B1D5F] text-white text-[10px] font-bold">
                        {bookingStep}
                      </span>
                      <p className="text-xs text-brand-gray-500 font-medium">
                        {bookingStep === 1
                          ? "Step 1 of 3: Choose preferred date & specialist"
                          : bookingStep === 2
                          ? "Step 2 of 3: Select an available time slot"
                          : "Step 3 of 3: Review details & confirm payment"}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowBooking(false)}
                  aria-label="Close booking modal"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-700 transition-all hover:rotate-90 duration-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {bookingSuccess ? (
                /* Success Ticket View */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h4 className="text-2xl font-bold text-brand-gray-900 mb-1">Appointment Confirmed!</h4>
                  <p className="text-brand-gray-500 text-xs sm:text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                    Your appointment at <strong className="text-brand-gray-900">{formatParlourName(parlour?.name || "")}</strong> is secured.
                    {bookingPaymentMethod === "cash"
                      ? " Zero advance payment needed — pay directly at the counter after your service."
                      : " A receipt has been sent to your registered email."}
                  </p>

                  {/* Summary Ticket */}
                  <div className="bg-[#FAF7FC] border border-brand-gray-200/80 rounded-2xl p-5 space-y-3 mb-6 text-left">
                    {activeBookingId && (
                      <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-brand-gray-200">
                        <span className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider">Booking Ref</span>
                        <span className="text-xs font-mono font-black text-[#4B1D5F] bg-[#4B1D5F]/10 px-2 py-0.5 rounded">
                          #{activeBookingId.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-brand-gray-200 text-xs">
                      <span className="text-brand-gray-500">Service</span>
                      <strong className="text-brand-gray-900">{selectedService?.name}</strong>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-brand-gray-200 text-xs">
                      <span className="text-brand-gray-500">Date & Time</span>
                      <strong className="text-brand-gray-900">{selectedDate} at {selectedTime}</strong>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-brand-gray-200 text-xs">
                      <span className="text-brand-gray-500">Specialist</span>
                      <strong className="text-brand-gray-900">{selectedStaff?.name || "Any Specialist"}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-sm">
                      <span className="font-bold text-brand-gray-800">Total Payable</span>
                      <span className="font-black text-lg text-[#4B1D5F]">{formatCurrency(finalBookingTotal)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      className="flex-1 bg-[#4B1D5F] hover:bg-[#3B154B] text-white rounded-xl h-11 font-bold text-xs shadow-md"
                    >
                      <Link href="/bookings">
                        {t("My Bookings")}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBooking(false)}
                      className="flex-1 rounded-xl h-11 font-bold text-xs border-brand-gray-200"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : showStripeBookingForm && bookingStripeClientSecret ? (
                /* Stripe Payment Flow */
                <div className="space-y-4">
                  <div className="bg-brand-gray-50 p-4 rounded-xl border flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-brand-gray-400 font-bold uppercase">Booking Service</p>
                      <strong className="text-xs sm:text-sm text-brand-gray-800">{selectedService?.name}</strong>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowStripeBookingForm(false)} className="text-xs text-[#4B1D5F] font-bold">
                      Back
                    </Button>
                  </div>
                  <StripeBookingPayment
                    clientSecret={bookingStripeClientSecret}
                    amount={finalBookingTotal}
                    onCancel={() => setShowStripeBookingForm(false)}
                    onSuccess={handleStripeBookingSuccess}
                  />
                </div>
              ) : bookingStep === 1 ? (
                /* Step 1: Date & Staff Selection */
                <div className="space-y-6">
                  {/* Date Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs sm:text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#4B1D5F]" /> Available Dates
                      </p>
                      <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Select Day</span>
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-3 -mx-5 px-5 scrollbar-none">
                      {bookingDates.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => {
                            setSelectedDate(d.label)
                            setSelectedTime("")
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-w-[70px] shrink-0 cursor-pointer",
                            selectedDate === d.label
                              ? "bg-[#4B1D5F] text-white border-[#4B1D5F] shadow-lg shadow-[#4B1D5F]/20 scale-102"
                              : "border-brand-gray-100 bg-white text-brand-gray-700 hover:border-[#4B1D5F]/40"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase mb-1 opacity-75">{d.dayName}</span>
                          <span className="text-base font-black">{d.dayNum}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialist Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs sm:text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#4B1D5F]" /> Select Specialist
                      </p>
                      <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Optional</span>
                    </div>

                    {loadingStaff ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-[#4B1D5F]" />
                      </div>
                    ) : (
                      <div className="flex overflow-x-auto gap-2.5 pb-3 -mx-5 px-5 scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setSelectedStaff(null)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-w-[85px] shrink-0 text-center cursor-pointer",
                            selectedStaff === null
                              ? "bg-[#4B1D5F] text-white border-[#4B1D5F] shadow-md shadow-[#4B1D5F]/20"
                              : "border-brand-gray-100 bg-white text-brand-gray-700 hover:border-[#4B1D5F]/40"
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-brand-gray-100 flex items-center justify-center mb-1.5 text-brand-gray-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-tight">Any</span>
                          <span className="text-[9px] opacity-70">Specialist</span>
                        </button>

                        {staffList.map((staff) => (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => setSelectedStaff(staff)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-w-[85px] max-w-[110px] shrink-0 text-center cursor-pointer",
                              selectedStaff?.id === staff.id
                                ? "bg-[#4B1D5F] text-white border-[#4B1D5F] shadow-md shadow-[#4B1D5F]/20"
                                : "border-brand-gray-100 bg-white text-brand-gray-700 hover:border-[#4B1D5F]/40"
                            )}
                          >
                            <div className="relative w-9 h-9 rounded-full bg-[#4B1D5F]/10 flex items-center justify-center mb-1.5 overflow-hidden">
                              {staff.avatar_url ? (
                                <Image src={staff.avatar_url} alt={staff.name} fill className="object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-[#4B1D5F]">{staff.name.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="text-xs font-bold truncate w-full leading-tight">{staff.name.split(" ")[0]}</span>
                            <span className="text-[9px] opacity-70 truncate w-full">{staff.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : bookingStep === 2 ? (
                /* Step 2: Time Selection */
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-brand-gray-50 rounded-2xl p-3.5 border border-brand-gray-100">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#4B1D5F]" />
                      <div>
                        <p className="text-[10px] text-brand-gray-400 font-semibold uppercase">Selected Date</p>
                        <p className="text-xs sm:text-sm font-bold text-brand-gray-900">{selectedDate}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBookingStep(1)} className="text-[#4B1D5F] text-xs font-bold">
                      Change
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs sm:text-sm font-bold text-brand-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#4B1D5F]" /> Available Time Slots
                      </p>
                      {loadingSlots ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gray-400" />
                      ) : (
                        <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Select Slot</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {TIME_SLOTS.map((time) => {
                        const isBooked = bookedSlots.includes(time)
                        const isBeingSelected = selectingSlots[time] && selectingSlots[time] !== user?.id

                        return (
                          <button
                            key={time}
                            disabled={isBooked || isBeingSelected || loadingSlots}
                            onClick={() => {
                              setSelectedTime(time)
                              broadcastSelection(time)
                            }}
                            className={cn(
                              "text-xs py-3 rounded-xl border font-bold transition-all relative overflow-hidden cursor-pointer",
                              selectedTime === time
                                ? "bg-[#4B1D5F] text-white border-[#4B1D5F] shadow-md shadow-[#4B1D5F]/20"
                                : isBooked
                                ? "bg-brand-gray-50 border-brand-gray-100 text-brand-gray-300 cursor-not-allowed"
                                : isBeingSelected
                                ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                                : "border-brand-gray-100 bg-white text-brand-gray-700 hover:border-[#4B1D5F]/40"
                            )}
                          >
                            <span className="relative z-10">{time}</span>
                            {isBooked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-50/70">
                                <span className="text-[8px] bg-brand-gray-200 text-brand-gray-600 px-1 rounded uppercase">Booked</span>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 3: Payment Method Selection & Promo */
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-brand-gray-50 rounded-2xl p-3.5 border border-brand-gray-100">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#4B1D5F]" />
                      <div>
                        <p className="text-[10px] text-brand-gray-400 font-semibold uppercase">Appointment Slot</p>
                        <p className="text-xs sm:text-sm font-bold text-brand-gray-900">{selectedDate} at {selectedTime}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setBookingStep(2)} className="text-[#4B1D5F] text-xs font-bold" disabled={isBooking}>
                      Change
                    </Button>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Select Payment Method</p>
                    <div className="space-y-2">
                      {[
                        {
                          id: "cash",
                          label: "Cash on Service (Pay at Parlour)",
                          sub: "Zero advance required. Pay in cash after treatment.",
                          badge: "Recommended",
                          badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                          icon: Store,
                        },
                        { id: "bkash", label: "bKash MFS", sub: "Pay in advance with Bangladesh's #1 mobile wallet", badge: "Instant", badgeClass: "bg-pink-100 text-pink-800 border-pink-200", icon: null },
                        { id: "sslcommerz", label: "SSLCommerz Local Gateway", sub: "Cards, internet banking & mobile wallets", badge: "Local Pay", badgeClass: "bg-blue-100 text-blue-800 border-blue-200", icon: null },
                        { id: "stripe", label: "Debit / Credit Card (Stripe)", sub: "Visa, Mastercard, Amex secure global checkout", badge: "Global", badgeClass: "bg-purple-100 text-purple-800 border-purple-200", icon: CreditCard },
                      ].map((method) => {
                        const Icon = method.icon
                        return (
                          <button
                            key={method.id}
                            type="button"
                            disabled={isBooking}
                            onClick={() => setBookingPaymentMethod(method.id)}
                            className={cn(
                              "w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                              bookingPaymentMethod === method.id
                                ? "border-[#4B1D5F] bg-[#FAF5FF] ring-1 ring-[#4B1D5F]"
                                : "border-brand-gray-100 hover:border-[#4B1D5F]/30 bg-white"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                bookingPaymentMethod === method.id ? "border-[#4B1D5F]" : "border-brand-gray-300"
                              )}>
                                {bookingPaymentMethod === method.id && (
                                  <div className="w-2 h-2 rounded-full bg-[#4B1D5F]" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-brand-gray-900 text-xs sm:text-sm">{method.label}</span>
                                <p className="text-[10px] text-brand-gray-500">{method.sub}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn("text-[9px] font-bold border", method.badgeClass)}>
                                {method.badge}
                              </Badge>
                              {Icon && <Icon className="w-3.5 h-3.5 text-brand-gray-400" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Price Details & Promo Box */}
                  <div className="bg-[#FAF7FC] rounded-2xl p-4 border border-brand-gray-100 space-y-3">
                    <div className="flex justify-between text-xs text-brand-gray-600">
                      <span>Service price</span>
                      <span className="font-bold text-brand-gray-900">{formatCurrency(selectedService?.price || 0)}</span>
                    </div>

                    {appliedBookingPromo && (
                      <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                        <span>Discount ({appliedBookingPromo.code})</span>
                        <span>-৳{appliedBookingPromo.discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-brand-gray-600">
                      <span>Platform fee</span>
                      <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                    </div>

                    <div className="pt-2 border-t border-brand-gray-200 flex justify-between items-center text-sm">
                      <span className="font-bold text-brand-gray-900">Total Payable</span>
                      <span className="text-xl font-black text-[#4B1D5F]">{formatCurrency(finalBookingTotal)}</span>
                    </div>

                    {/* Promo Code Input */}
                    <div className="pt-2 border-t border-brand-gray-200">
                      {!appliedBookingPromo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowBookingPromoInput(!showBookingPromoInput)}
                            className="text-xs font-bold text-[#4B1D5F] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Have a promo code?
                          </button>

                          {showBookingPromoInput && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="ENTER CODE"
                                value={bookingPromoCode}
                                onChange={(e) => setBookingPromoCode(e.target.value.toUpperCase())}
                                className="h-9 rounded-xl uppercase font-mono text-xs border-brand-gray-200 bg-white"
                              />
                              <Button
                                type="button"
                                onClick={handleValidateBookingPromo}
                                disabled={isValidatingBookingPromo || !bookingPromoCode.trim()}
                                className="bg-[#4B1D5F] hover:bg-[#3B154B] text-white h-9 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
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
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-brand-gray-400 font-semibold uppercase">Promo:</span>
                            <span className="font-bold text-emerald-800 ml-1.5 font-mono">{appliedBookingPromo.code}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveBookingPromo}
                            className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Controls */}
            {!bookingSuccess && !showStripeBookingForm && (
              <div className="p-4 sm:p-5 border-t border-brand-gray-100 bg-white flex gap-3">
                {bookingStep === 1 ? (
                  <Button
                    className="flex-1 h-12 rounded-2xl bg-[#4B1D5F] hover:bg-[#3B154B] font-black text-sm text-white shadow-md shadow-[#4B1D5F]/20 cursor-pointer"
                    disabled={!selectedDate}
                    onClick={() => setBookingStep(2)}
                  >
                    Select Time <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : bookingStep === 2 ? (
                  <div className="flex gap-2.5 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setBookingStep(1)}
                      className="w-16 h-12 rounded-2xl border-brand-gray-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-2xl bg-[#4B1D5F] hover:bg-[#3B154B] font-black text-sm text-white shadow-md shadow-[#4B1D5F]/20 cursor-pointer"
                      disabled={!selectedTime || loadingSlots}
                      onClick={() => setBookingStep(3)}
                    >
                      Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2.5 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setBookingStep(2)}
                      className="w-16 h-12 rounded-2xl border-brand-gray-200 cursor-pointer"
                      disabled={isBooking}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {!user ? (
                      <Button
                        asChild
                        variant="rosegold"
                        className="flex-1 h-12 rounded-2xl font-bold text-sm shadow-md shadow-[#E2A9A9]/30"
                      >
                        <Link href={`/login?redirectedFrom=${encodeURIComponent(`/parlours/${id}${selectedService ? `?service=${selectedService.id}` : ""}`)}`}>
                          Log in to Confirm
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="rosegold"
                        className="flex-1 h-12 rounded-2xl font-black text-sm shadow-md shadow-[#E2A9A9]/30 disabled:opacity-50 cursor-pointer"
                        disabled={isBooking}
                        onClick={handleConfirmBooking}
                      >
                        {isBooking ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                        ) : bookingPaymentMethod === "cash" ? (
                          "Confirm Booking (Cash on Service)"
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

      {/* ══════════ 5. LIGHTBOX MODAL ══════════ */}
      {showLightbox && galleryUrls.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
            {user && parlour && (parlour.owner_id === user.id || userRole === "admin") && (
              <button
                type="button"
                onClick={() => handleDeleteImage(galleryUrls[lightboxIndex])}
                className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-sm transition-all cursor-pointer shadow-md"
                title="Delete photo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:rotate-90 duration-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            {galleryUrls.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev === 0 ? galleryUrls.length - 1 : prev - 1))}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative w-full h-full max-w-[90vw] max-h-[80vh] flex items-center justify-center">
              <Image
                src={galleryUrls[lightboxIndex] || ""}
                alt="Parlour photo"
                fill
                className="object-contain select-none"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>

            {galleryUrls.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex((prev) => (prev === galleryUrls.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all z-10 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="mt-4 text-white/70 text-xs font-semibold">
            Photo {lightboxIndex + 1} of {galleryUrls.length}
          </div>
        </div>
      )}
    </div>
  )
}
