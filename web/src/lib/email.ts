/**
 * Parloora — Transactional Email via Resend
 * ---------------------------------------------------------
 * All email-sending logic lives here. Functions are called
 * from server actions and API webhook handlers ONLY — never
 * from client components.
 *
 * Env vars required:
 *   RESEND_API_KEY        — from https://resend.com/api-keys
 *   RESEND_FROM_EMAIL     — verified sender address
 *   RESEND_FROM_NAME      — display name (default: Parloora)
 */

import { getSiteUrl } from "./site-url"

const RESEND_API = "https://api.resend.com/emails"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@parloora.com"
const FROM_NAME  = process.env.RESEND_FROM_NAME  || "Parloora"
const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`

// ─── Shared design tokens ────────────────────────────────────────────────────
const BRAND_PURPLE = "#4B1E6D"
const BRAND_ROSE   = "#E6B7A9"
const SITE_URL     = getSiteUrl()

// ─── Low-level send helper ───────────────────────────────────────────────────
async function sendEmail(payload: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.startsWith("re_your_")) {
    console.warn("⚠️  Resend API key not configured — skipping email to", payload.to)
    return { success: false, error: "Resend API key not configured" }
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error("Resend error:", err)
      return { success: false, error: JSON.stringify(err) }
    }

    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Email send failed:", err)
    return { success: false, error: err.message }
  }
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function layout(body: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Parloora</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f5f5; font-family: -apple-system, 'Segoe UI', sans-serif; }
    .wrap  { max-width: 600px; margin: 0 auto; }
    .header{ background: linear-gradient(135deg,${BRAND_PURPLE},#7B3FA0); padding: 32px 40px; text-align: center; }
    .logo  { color: #fff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
    .logo span { color: ${BRAND_ROSE}; }
    .card  { background: #fff; border-radius: 0 0 16px 16px; padding: 40px; }
    .pill  { display:inline-block; background:${BRAND_PURPLE}15; color:${BRAND_PURPLE}; font-size:11px;
             font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:4px 12px;
             border-radius:999px; margin-bottom:20px; }
    h1     { color: #1a1a2e; font-size: 24px; font-weight: 900; line-height:1.3; margin-bottom:8px; }
    p      { color: #555; font-size: 15px; line-height: 1.7; margin-bottom:16px; }
    .detail-box { background:#fafafa; border:1px solid #eee; border-radius:12px;
                  padding:20px 24px; margin:24px 0; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0;
                  border-bottom:1px dashed #eee; font-size:14px; }
    .detail-row:last-child { border-bottom:none; }
    .detail-label { color:#888; font-weight:600; }
    .detail-value { color:#1a1a2e; font-weight:700; text-align:right; }
    .cta   { display:block; background:linear-gradient(135deg,${BRAND_PURPLE},#7B3FA0);
             color:#fff!important; text-decoration:none; font-weight:800; font-size:15px;
             text-align:center; padding:16px 32px; border-radius:12px; margin:24px 0; }
    .footer{ text-align:center; padding:24px 40px; color:#aaa; font-size:12px; }
    .footer a { color:#aaa; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ""}
  <div class="wrap">
    <div class="header" style="text-align: center;">
      <a href="${SITE_URL}" style="text-decoration: none; display: inline-block;">
        <img src="${SITE_URL}/logo.png" alt="Parloora" width="44" height="44" style="border-radius: 10px; display: block; margin: 0 auto 10px auto;" />
        <div class="logo">Parlo<span>ora</span></div>
      </a>
    </div>
    <div class="card">
      ${body}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Parloora &mdash; Beauty-Tech Marketplace<br/>
      <a href="${SITE_URL}">parloora.com</a> &middot;
      <a href="${SITE_URL}/privacy">Privacy</a> &middot;
      <a href="${SITE_URL}/terms">Terms</a>
    </div>
  </div>
</body>
</html>`
}

// ─── 1. Booking Confirmation ──────────────────────────────────────────────────
export async function sendBookingConfirmation(
  to: string,
  booking: {
    id?: string
    service_name?: string | null
    parlour_name?: string | null
    date?: string | null
    time?: string | null
    amount?: number | null
    customer_name?: string | null
    staff_name?: string | null
  }
) {
  const subject = `✅ Booking Confirmed — ${booking.service_name || "Your Service"} at ${booking.parlour_name || "Parloora"}`
  const html = layout(`
    <div class="pill">Booking Confirmed</div>
    <h1>You're all set, ${booking.customer_name || "there"}! 🎉</h1>
    <p>Your appointment has been booked successfully. Here are your details:</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Parlour</span><span class="detail-value">${booking.parlour_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.date || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.time || "—"}</span></div>
      ${booking.staff_name ? `<div class="detail-row"><span class="detail-label">Specialist</span><span class="detail-value">${booking.staff_name}</span></div>` : ""}
      <div class="detail-row"><span class="detail-label">Total</span><span class="detail-value">৳${Number(booking.amount || 0).toLocaleString()}</span></div>
    </div>
    <a class="cta" href="${SITE_URL}/bookings">View My Bookings</a>
    <p style="font-size:13px;color:#999;">Please arrive 5–10 minutes early. Need to reschedule? Contact the parlour directly or visit your bookings dashboard.</p>
  `, `Booking confirmed for ${booking.service_name} on ${booking.date}`)

  return sendEmail({ to, subject, html })
}

// ─── 2. Booking Status Update ─────────────────────────────────────────────────
export async function sendBookingStatusUpdate(
  to: string,
  booking: {
    service_name?: string | null
    parlour_name?: string | null
    date?: string | null
    time?: string | null
    customer_name?: string | null
  },
  status: string
) {
  const isConfirmed = status === "confirmed"
  const isCancelled = status === "cancelled"
  const emoji  = isConfirmed ? "✅" : isCancelled ? "❌" : "ℹ️"
  const label  = isConfirmed ? "Booking Confirmed" : isCancelled ? "Booking Cancelled" : `Booking ${status}`
  const color  = isConfirmed ? "#16a34a" : isCancelled ? "#dc2626" : BRAND_PURPLE
  const subject = `${emoji} ${label} — ${booking.service_name || "Your Service"}`

  const html = layout(`
    <div class="pill" style="background:${color}15;color:${color};">${label}</div>
    <h1 style="color:${color};">${isConfirmed ? "Great news!" : isCancelled ? "Booking Cancelled" : label}</h1>
    <p>Hi ${booking.customer_name || "there"}, your booking status has been updated to <strong>${status}</strong>.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Parlour</span><span class="detail-value">${booking.parlour_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.date || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.time || "—"}</span></div>
    </div>
    ${isCancelled
      ? `<p>We're sorry your appointment was cancelled. You can book another slot anytime.</p>`
      : `<p>We look forward to seeing you soon!</p>`}
    <a class="cta" href="${SITE_URL}/bookings">View My Bookings</a>
  `, `Your booking for ${booking.service_name} has been ${status}`)

  return sendEmail({ to, subject, html })
}

// ─── 3. Booking Reminder (1 hour before) ─────────────────────────────────────
export async function sendBookingReminder(
  to: string,
  booking: {
    service_name?: string | null
    parlour_name?: string | null
    date?: string | null
    time?: string | null
    customer_name?: string | null
    staff_name?: string | null
  }
) {
  const subject = `⏰ Reminder: ${booking.service_name} in ~1 hour at ${booking.parlour_name}`
  const html = layout(`
    <div class="pill">Appointment Reminder</div>
    <h1>Your appointment is coming up! ⏰</h1>
    <p>Hi ${booking.customer_name || "there"}, just a friendly reminder that you have an upcoming appointment:</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${booking.service_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Parlour</span><span class="detail-value">${booking.parlour_name || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.date || "—"}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.time || "—"}</span></div>
      ${booking.staff_name ? `<div class="detail-row"><span class="detail-label">Specialist</span><span class="detail-value">${booking.staff_name}</span></div>` : ""}
    </div>
    <p>Please arrive 5–10 minutes early. See you soon! 💅</p>
    <a class="cta" href="${SITE_URL}/bookings">View Booking Details</a>
  `, `Reminder: ${booking.service_name} at ${booking.time} today`)

  return sendEmail({ to, subject, html })
}

// ─── 4. Order Confirmation ────────────────────────────────────────────────────
export async function sendOrderConfirmation(
  to: string,
  order: {
    id?: string
    customer_name?: string | null
    total_amount?: number | null
    items_count?: number | null
    status?: string | null
  }
) {
  const subject = `🛍️ Order Confirmed — Parloora Shop`
  const html = layout(`
    <div class="pill">Order Confirmed</div>
    <h1>Thanks for your order, ${order.customer_name || "there"}! 🛍️</h1>
    <p>Your product order has been placed successfully and is being processed.</p>
    <div class="detail-box">
      ${order.id ? `<div class="detail-row"><span class="detail-label">Order ID</span><span class="detail-value">#${order.id.slice(0,8).toUpperCase()}</span></div>` : ""}
      <div class="detail-row"><span class="detail-label">Items</span><span class="detail-value">${order.items_count || "—"} item(s)</span></div>
      <div class="detail-row"><span class="detail-label">Total</span><span class="detail-value">৳${Number(order.total_amount || 0).toLocaleString()}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${order.status || "Processing"}</span></div>
    </div>
    <a class="cta" href="${SITE_URL}/orders">Track My Order</a>
  `, `Your Parloora order has been confirmed.`)

  return sendEmail({ to, subject, html })
}

// ─── 5. Welcome Email ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = `🌸 Welcome to Parloora, ${name}!`
  const html = layout(`
    <div class="pill">Welcome Aboard</div>
    <h1>Hello ${name}, welcome to Parloora! 🌸</h1>
    <p>We're thrilled to have you join Bangladesh's premier beauty-tech marketplace. Discover top-rated parlours, book appointments in seconds, and enjoy exclusive rewards.</p>
    <div class="detail-box" style="text-align:center; padding:24px;">
      <p style="margin:0; font-size:18px; font-weight:900; color:${BRAND_PURPLE};">Book Your Self-Care Services in Seconds</p>
    </div>
    <a class="cta" href="${SITE_URL}/parlours">Explore Parlours Near You</a>
    <p style="font-size:13px;color:#999;">Questions? Reply to this email or visit our <a href="${SITE_URL}/about" style="color:${BRAND_PURPLE};">Help Centre</a>.</p>
  `, `Welcome to Parloora — Book your self-care services in seconds.`)

  return sendEmail({ to, subject, html })
}
