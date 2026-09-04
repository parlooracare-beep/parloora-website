import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendBookingReminder } from "@/lib/email"
import { sendBookingReminderSMS } from "@/lib/sms"

// CRON ENDPOINT: Dispatches booking reminders 1 hour before scheduled time.
// Triggered via a cron job using: Authorization: Bearer <CRON_SECRET>

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || cronSecret === "your_secure_cron_secret_32_chars_min") {
    console.error("CRON_SECRET is not properly configured")
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Get today's date in YYYY-MM-DD format (local/system timezone)
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    // Fetch all confirmed bookings for today
    const { data: bookings, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("date", todayStr)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("status", "confirmed") as any

    if (fetchErr) {
      console.error("Failed to fetch bookings for reminders:", fetchErr)
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "No bookings scheduled for today" })
    }

    const now = new Date()
    const dispatched = []

    for (const booking of bookings) {
      if (!booking.time || !booking.customer_id) continue

      // Parse booking time (format is usually "HH:MM:SS" or "HH:MM")
      const [hours, minutes] = booking.time.split(":").map(Number)
      
      const bookingDateTime = new Date()
      bookingDateTime.setHours(hours, minutes, 0, 0)

      // Calculate difference in milliseconds
      const diffMs = bookingDateTime.getTime() - now.getTime()
      const diffMins = diffMs / (1000 * 60)

      // Only remind if the booking starts in the next 45 to 75 minutes (i.e. ~1 hour from now)
      if (diffMins >= 45 && diffMins <= 75) {
        // Fetch user profile and preferences
        const { data: profile } = await supabase
          .from("users")
          .select("email, phone, email_notifications, sms_notifications")
          .eq("id", booking.customer_id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .single() as any

        if (profile) {
          const emailSent = profile.email_notifications !== false && profile.email
            ? await sendBookingReminder(profile.email, {
                service_name:  booking.service_name,
                parlour_name:  booking.parlour_name,
                date:          booking.date,
                time:          booking.time,
                customer_name: booking.customer_name,
              }).then(r => r.success).catch(() => false)
            : false

          const smsSent = profile.sms_notifications !== false && profile.phone
            ? await sendBookingReminderSMS(profile.phone, {
                service_name:  booking.service_name,
                parlour_name:  booking.parlour_name,
                time:          booking.time,
                customer_name: booking.customer_name,
              }).then(r => r.success).catch(() => false)
            : false

          dispatched.push({
            bookingId: booking.id,
            emailSent,
            smsSent,
          })
        }
      }
    }

    return NextResponse.json({
      message: `Processed ${bookings.length} bookings today`,
      remindersSent: dispatched.length,
      dispatched,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Reminder cron job crashed:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
