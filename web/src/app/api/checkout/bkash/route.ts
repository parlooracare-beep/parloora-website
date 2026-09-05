import { NextResponse } from "next/server"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

/**
 * bKash Payment Gateway Integration
 * -------------------------------------------------------------------
 * Uses bKash PGW (Payment Gateway) API v1.2.0 – Create Payment flow.
 *
 * Flow:
 *   1. POST /api/checkout/bkash with { amount, bookingId, orderId, intent }
 *   2. This route:
 *      a. Grants an app-level token (cached for reuse within TTL)
 *      b. Creates a payment session
 *      c. Returns { bkashURL } for the client to redirect / open bKash deep-link
 *
 * Env vars required:
 *   BKASH_APP_KEY       — from bKash merchant dashboard
 *   BKASH_APP_SECRET    — from bKash merchant dashboard
 *   BKASH_USERNAME      — from bKash merchant dashboard
 *   BKASH_PASSWORD      — from bKash merchant dashboard
 *   BKASH_IS_LIVE       — "true" for production, "false" for sandbox
 *   NEXT_PUBLIC_SITE_URL — e.g. https://www.parloora.com
 */

const BKASH_BASE =
  process.env.BKASH_IS_LIVE === "true"
    ? "https://tokenized.pay.bka.sh/v1.2.0-beta"
    : "https://tokenized.sandbox.bka.sh/v1.2.0-beta"

// ─── Token cache (module-level, valid for lifetime of serverless function) ────
let cachedToken: string | null = null
let tokenExpiry = 0

async function getBkashToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch(`${BKASH_BASE}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      username: process.env.BKASH_USERNAME!,
      password: process.env.BKASH_PASSWORD!,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  })

  const data = await res.json()
  if (!data.id_token) throw new Error("bKash token grant failed: " + JSON.stringify(data))

  cachedToken = data.id_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // refresh 1 min before expiry
  return cachedToken!
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, bookingId, orderId, intent = "sale" } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount." }, { status: 400 })
    }

    const missingCreds = !process.env.BKASH_APP_KEY || !process.env.BKASH_APP_SECRET
    if (missingCreds) {
      return NextResponse.json(
        { success: false, error: "bKash credentials not configured." },
        { status: 500 }
      )
    }

    const siteUrl = getSiteUrl()
    const token = await getBkashToken()

    const merchantRef = `PRL-${Date.now()}-${(bookingId || orderId || "GUEST").slice(0, 6)}`

    const createRes = await fetch(`${BKASH_BASE}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY!,
      },
      body: JSON.stringify({
        mode: "0011",         // Tokenized payment mode
        payerReference: bookingId || orderId || "guest",
        callbackURL: `${siteUrl}/api/webhooks/bkash?bookingId=${bookingId || ""}&orderId=${orderId || ""}`,
        amount: String(Math.round(amount)),
        currency: "BDT",
        intent,
        merchantInvoiceNumber: merchantRef,
      }),
    })

    const createData = await createRes.json()

    if (createData.statusCode !== "0000") {
      console.error("bKash create payment failed:", createData)
      return NextResponse.json(
        { success: false, error: createData.statusMessage || "bKash payment creation failed." },
        { status: 502 }
      )
    }

    // Store the payment_id in DB so the callback can reference it
    const supabase = await createClient()
    if (bookingId) {
      await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("bookings" as any)
        .update({
          payment_transaction_id: createData.paymentID,
          payment_method: "bkash",
          payment_status: "pending",
        })
        .eq("id", bookingId)
    }

    return NextResponse.json({
      success: true,
      bkashURL: createData.bkashURL,
      paymentID: createData.paymentID,
      merchantRef,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("bKash checkout error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
