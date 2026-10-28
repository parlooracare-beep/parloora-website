/**
 * Parloora — SMS Notifications via Twilio
 * ---------------------------------------------------------
 * Plain-text SMS helpers for booking confirmations, reminders,
 * and status alerts. Called only from server actions / API routes.
 *
 * Env vars required:
 *   TWILIO_ACCOUNT_SID   — from https://console.twilio.com
 *   TWILIO_AUTH_TOKEN    — from https://console.twilio.com
 *   TWILIO_FROM_NUMBER   — your Twilio phone number (e.g. +1234567890)
 *
 * Swapping to Greenweb BD / Infobip:
 *   Replace the fetch() call in sendSMS() with the appropriate REST call.
 *   The function signatures above it stay unchanged.
 */

import { getSiteUrl } from "./site-url"

// ─── Low-level sender ─────────────────────────────────────────────────────────
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || accountSid.startsWith("ACyour_") || !authToken || !from) {
    console.warn("⚠️  Twilio credentials not configured — skipping SMS to", to)
    return { success: false, error: "Twilio credentials not configured" }
  }

  // Normalize phone — must be E.164 format e.g. +8801XXXXXXXXX
  const normalizedTo = to.startsWith("+") ? to : `+${to.replace(/\D/g, "")}`

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ From: from, To: normalizedTo, Body: body }).toString(),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error("Twilio error:", err)
      return { success: false, error: JSON.stringify(err) }
    }

    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("SMS send failed:", err)
    return { success: false, error: err.message }
  }
}

// ─── 1. Booking Confirmation SMS ──────────────────────────────────────────────
export async function sendBookingConfirmationSMS(
  phone: string,
  booking: {
    service_name?: string | null
    parlour_name?: string | null
    date?: string | null
    time?: string | null
    customer_name?: string | null
    locale?: "en" | "bn"
  }
) {
  const isBn = booking.locale === "bn"
  const body = isBn
    ? `✅ পার্লোরা বুকিং নিশ্চিত হয়েছে!\n` +
      `প্রিয় ${booking.customer_name || "গ্রাহক"}, ${booking.parlour_name || "পার্লারে"} আপনার ${booking.service_name || "সেবা"} ` +
      `${booking.date || "—"} তারিখ ${booking.time || "—"} সময়ে নিশ্চিত হয়েছে।\n` +
      `দেখুন: ${getSiteUrl()}/bookings`
    : `✅ Parloora Booking Confirmed!\n` +
      `Hi ${booking.customer_name || "there"}, your ${booking.service_name || "appointment"} ` +
      `at ${booking.parlour_name || "the parlour"} is booked for ` +
      `${booking.date || "—"} at ${booking.time || "—"}.\n` +
      `View: ${getSiteUrl()}/bookings`

  return sendSMS(phone, body)
}

// ─── 2. Booking Reminder SMS (1 hour before) ──────────────────────────────────
export async function sendBookingReminderSMS(
  phone: string,
  booking: {
    service_name?: string | null
    parlour_name?: string | null
    time?: string | null
    customer_name?: string | null
    locale?: "en" | "bn"
  }
) {
  const isBn = booking.locale === "bn"
  const body = isBn
    ? `⏰ পার্লোরা স্মারক: প্রিয় ${booking.customer_name || "গ্রাহক"}, ` +
      `${booking.parlour_name || "পার্লারে"} আপনার ${booking.service_name || "অ্যাপয়েন্টমেন্ট"} ` +
      `শুরু হবে ${booking.time || "—"}। অনুগ্রহ করে ৫–১০ মিনিট আগে পৌঁছান।`
    : `⏰ Parloora Reminder: Hi ${booking.customer_name || "there"}, ` +
      `your ${booking.service_name || "appointment"} at ` +
      `${booking.parlour_name || "the parlour"} starts at ${booking.time || "—"}. ` +
      `Please arrive 5–10 mins early. See you soon! 💅`

  return sendSMS(phone, body)
}

// ─── 3. Booking Status Alert SMS ──────────────────────────────────────────────
export async function sendBookingStatusSMS(
  phone: string,
  booking: {
    service_name?: string | null
    parlour_name?: string | null
    date?: string | null
    customer_name?: string | null
    locale?: "en" | "bn"
  },
  status: string
) {
  const isBn = booking.locale === "bn"
  const emoji = status === "confirmed" ? "✅" : status === "cancelled" ? "❌" : "ℹ️"
  const statusBn = status === "confirmed" ? "নিশ্চিত করা হয়েছে" : status === "cancelled" ? "বাতিল করা হয়েছে" : status
  const body = isBn
    ? `${emoji} পার্লোরা: ${booking.parlour_name || "পার্লারে"} আপনার ${booking.service_name || "বুকিং"} ` +
      `(${booking.date || "—"}) ${statusBn}। বিস্তারিত: ${getSiteUrl()}/bookings`
    : `${emoji} Parloora: Your booking for ${booking.service_name || "your service"} ` +
      `at ${booking.parlour_name || "the parlour"} on ${booking.date || "—"} ` +
      `has been ${status}. View: ${getSiteUrl()}/bookings`

  return sendSMS(phone, body)
}
