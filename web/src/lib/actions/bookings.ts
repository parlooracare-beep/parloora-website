"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin"
import { Database } from "@/types/supabase"
import { createNotification } from "./notifications"
import { sendBookingConfirmation, sendBookingStatusUpdate } from "@/lib/email"
import { sendBookingConfirmationSMS, sendBookingStatusSMS } from "@/lib/sms"

type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a time string like "10:00 AM" or "14:00" into a 24-hour decimal
 * hour number so we can do reliable arithmetic comparisons.
 */
function parseTimeToHours(timeStr: string | null): number | null {
  if (!timeStr) return null
  const ampm = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let hours = parseInt(ampm[1], 10)
    const mins = parseInt(ampm[2], 10)
    const period = ampm[3].toUpperCase()
    if (period === "AM" && hours === 12) hours = 0
    if (period === "PM" && hours !== 12) hours += 12
    return hours + mins / 60
  }
  // Try 24h "HH:MM" format
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (h24) {
    return parseInt(h24[1], 10) + parseInt(h24[2], 10) / 60
  }
  return null
}

// ─── createBooking ────────────────────────────────────────────────────────────

export async function createBooking(bookingData: BookingInsert) {
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .insert([bookingData])
    .select()
    .single()

  if (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: error.message }
  }

  if (data) {
    // 1. In-app notification → Seller
    if (bookingData.seller_id) {
      await createNotification({
        user_id: bookingData.seller_id,
        title: "New Booking Request",
        message: `You have a new booking request for ${bookingData.service_name} from ${bookingData.customer_name || 'a customer'}.`,
        type: "booking",
        link: "/seller/bookings"
      })
    }

    // 2. External email + SMS → Customer (fire-and-forget)
    if (bookingData.customer_id) {
      const supabaseFetch = await createClient()
      const { data: profile } = await supabaseFetch
        .from("users")
        .select("email, phone, email_notifications, sms_notifications")
        .eq("id", bookingData.customer_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any

      if (profile) {
        if (profile.email_notifications !== false && profile.email) {
          sendBookingConfirmation(profile.email, {
            service_name:  bookingData.service_name,
            parlour_name:  bookingData.parlour_name,
            date:          bookingData.date as string | null,
            time:          bookingData.time as string | null,
            amount:        bookingData.amount as number | null,
            customer_name: bookingData.customer_name,
          }).catch(console.error)
        }
        if (profile.sms_notifications !== false && profile.phone) {
          sendBookingConfirmationSMS(profile.phone, {
            service_name:  bookingData.service_name,
            parlour_name:  bookingData.parlour_name,
            date:          bookingData.date as string | null,
            time:          bookingData.time as string | null,
            customer_name: bookingData.customer_name,
          }).catch(console.error)
        }
      }
    }
  }

  return { success: true, data }
}

// ─── getSellerBookings ────────────────────────────────────────────────────────

export async function getSellerBookings(sellerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller bookings:", error)
    return []
  }

  return data || []
}

// ─── updateBookingStatus ──────────────────────────────────────────────────────

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single()

  if (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: error.message }
  }

  if (data) {
    const statusMsg = status === 'confirmed' ? 'approved' : status === 'cancelled' ? 'cancelled' : status
    if (data.customer_id) {
      await createNotification({
        user_id: data.customer_id,
        title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your booking for ${data.service_name} at ${data.parlour_name} has been ${statusMsg}.`,
        type: "booking",
        link: "/bookings"
      })
    }

    if (data.customer_id) {
      const supabaseFetch = await createClient()
      const { data: profile } = await supabaseFetch
        .from("users")
        .select("email, phone, email_notifications, sms_notifications")
        .eq("id", data.customer_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any

      if (profile) {
        if (profile.email_notifications !== false && profile.email) {
          sendBookingStatusUpdate(profile.email, {
            service_name:  data.service_name,
            parlour_name:  data.parlour_name,
            date:          data.date,
            time:          data.time,
            customer_name: data.customer_name,
          }, status).catch(console.error)
        }
        if (profile.sms_notifications !== false && profile.phone) {
          sendBookingStatusSMS(profile.phone, {
            service_name:  data.service_name,
            parlour_name:  data.parlour_name,
            date:          data.date,
            customer_name: data.customer_name,
          }, status).catch(console.error)
        }
      }
    }
  }

  return { success: true, data }
}

// ─── getCustomerBookings ──────────────────────────────────────────────────────

export async function getCustomerBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customer bookings:", error)
    return []
  }

  return data
}

// ─── getBookingStats ──────────────────────────────────────────────────────────

export async function getBookingStats(sellerId: string) {
  const supabase = await createClient()
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, amount, status")
    .eq("seller_id", sellerId)
    .gte("created_at", sevenDaysAgo.toISOString())

  if (error || !data) {
    console.error("Error fetching booking stats:", error)
    return []
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }).reverse()

  const stats = last7Days.map(day => ({
    day,
    revenue: 0,
    bookings: 0
  }))

  data.forEach(booking => {
    if (booking.created_at) {
      const dayName = new Date(booking.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      const dayIndex = stats.findIndex(s => s.day === dayName)
      if (dayIndex !== -1) {
        stats[dayIndex].bookings += 1
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          stats[dayIndex].revenue += Number(booking.amount || 0)
        }
      }
    }
  })

  return stats
}

// ─── getSellerMetrics ─────────────────────────────────────────────────────────

export async function getSellerMetrics(sellerId: string) {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("customer_id")
    .eq("seller_id", sellerId)
    .not("customer_id", "is", null)

  const uniqueCustomers = new Set((bookings || []).map(b => b.customer_id)).size

  const { data: parlour } = await supabase
    .from("parlours")
    .select("rating")
    .eq("owner_id", sellerId)
    .single()

  return {
    uniqueCustomers,
    avgRating: parlour?.rating || 0
  }
}

// ─── hasCompletedBooking ──────────────────────────────────────────────────────

export async function hasCompletedBooking(parlourId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("customer_id", user.id)
    .eq("parlour_id", parlourId)
    .eq("status", "completed")
    .limit(1)

  if (error || !data || data.length === 0) {
    return false
  }

  return true
}

// ─── getBookedSlots ───────────────────────────────────────────────────────────

export async function getBookedSlots(parlourId: string, date: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookings")
    .select("time")
    .eq("parlour_id", parlourId)
    .eq("date", date)
    .not("status", "eq", "cancelled")

  if (error) {
    console.error("Error fetching booked slots:", error)
    return []
  }

  return data.map(b => b.time).filter((t): t is string => t !== null)
}

// ─── cancelBooking ────────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." }
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single()

  if (fetchError || !booking) {
    console.error("Error fetching booking to cancel:", fetchError)
    return { success: false, error: "Booking not found" }
  }

  // Validate ownership
  if (booking.customer_id !== user.id) {
    return { success: false, error: "Unauthorized to cancel this booking" }
  }

  // Validate status
  if (booking.status === "cancelled" || booking.status === "completed" || booking.status === "no_show") {
    return { success: false, error: `Cannot cancel a booking that is already ${booking.status}` }
  }

  // Validate cancellation window: at least 24 hours before the booking
  if (booking.date && booking.time) {
    // Parse "YYYY-MM-DD" + "HH:MM" or "HH:MM AM/PM" into a datetime
    const timeInHours = parseTimeToHours(booking.time)
    if (timeInHours !== null) {
      const [year, month, day] = booking.date.split("-").map(Number)
      const bookingDateTime = new Date(year, month - 1, day)
      bookingDateTime.setHours(Math.floor(timeInHours), Math.round((timeInHours % 1) * 60))
      const diffInHours = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return { success: false, error: "Bookings can only be cancelled at least 24 hours in advance" }
      }
    }
  }

  // Determine new payment_status
  const newPaymentStatus =
    booking.payment_status === "paid" ? "refund_pending" : booking.payment_status

  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: newPaymentStatus,
    })
    .eq("id", bookingId)
    .select()
    .single()

  if (updateError || !updatedBooking) {
    console.error("Error updating booking status to cancelled:", updateError)
    return { success: false, error: updateError?.message || "Failed to cancel booking" }
  }

  // Notify seller in-app
  if (updatedBooking.seller_id) {
    await createNotification({
      user_id: updatedBooking.seller_id,
      title: "Booking Cancelled by Client",
      message: `The booking for ${updatedBooking.service_name} at ${updatedBooking.time} on ${updatedBooking.date} has been cancelled by the customer.`,
      type: "booking",
      link: "/seller/bookings"
    })
  }

  // External notifications (email + SMS) to customer
  if (updatedBooking.customer_id) {
    const { data: profile } = await supabase
      .from("users")
      .select("email, phone, email_notifications, sms_notifications")
      .eq("id", updatedBooking.customer_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single() as any

    if (profile) {
      if (profile.email_notifications !== false && profile.email) {
        sendBookingStatusUpdate(profile.email, {
          service_name:  updatedBooking.service_name,
          parlour_name:  updatedBooking.parlour_name,
          date:          updatedBooking.date,
          time:          updatedBooking.time,
          customer_name: updatedBooking.customer_name,
        }, "cancelled").catch(console.error)
      }
      if (profile.sms_notifications !== false && profile.phone) {
        sendBookingStatusSMS(profile.phone, {
          service_name:  updatedBooking.service_name,
          parlour_name:  updatedBooking.parlour_name,
          date:          updatedBooking.date,
          customer_name: updatedBooking.customer_name,
        }, "cancelled").catch(console.error)
      }
    }
  }

  return { success: true, data: updatedBooking }
}

// ─── confirmBookingPayment ────────────────────────────────────────────────────

export async function confirmBookingPayment(bookingId: string, paymentIntentId: string, paymentMethod: string = "stripe") {
  const supabase = hasServiceRoleKey() ? createAdminClient() : await createClient()
  
  console.log(`confirmBookingPayment: confirming booking ${bookingId} with payment intent ${paymentIntentId}...`)

  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      payment_intent_id: paymentIntentId,
      payment_method: paymentMethod,
      status: "confirmed", // auto-confirm on successful payment
    })
    .eq("id", bookingId)
    .select()
    .single()

  if (error) {
    console.error("Error confirming booking payment:", error)
    return { success: false, error: error.message }
  }

  if (data) {
    if (data.customer_id) {
      const { data: profile } = await supabase
        .from("users")
        .select("email, phone, email_notifications, sms_notifications")
        .eq("id", data.customer_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as any

      if (profile) {
        if (profile.email_notifications !== false && profile.email) {
          sendBookingStatusUpdate(profile.email, {
            service_name:  data.service_name,
            parlour_name:  data.parlour_name,
            date:          data.date,
            time:          data.time,
            customer_name: data.customer_name,
          }, "confirmed").catch(console.error)
        }
        if (profile.sms_notifications !== false && profile.phone) {
          sendBookingStatusSMS(profile.phone, {
            service_name:  data.service_name,
            parlour_name:  data.parlour_name,
            date:          data.date,
            customer_name: data.customer_name,
          }, "confirmed").catch(console.error)
        }
      }
    }
  }

  return { success: true, data }
}
