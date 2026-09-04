import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

/**
 * SSLCommerz IPN (Instant Payment Notification) + Redirect Handler
 * -------------------------------------------------------------------
 * Handles three types of calls from SSLCommerz:
 *   GET ?status=success|fail|cancel  — browser redirect after payment attempt
 *   POST (no query params)           — server-to-server IPN callback
 *
 * Validation:
 *   All IPN calls are verified using MD5 hash validation against the
 *   store password to prevent tampering.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SSLCOMMERZ_BASE =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com"

async function validateSSLCommerzIPN(payload: Record<string, string>): Promise<boolean> {
  try {
    const storePass = process.env.SSLCOMMERZ_STORE_PASS || ""
    const receivedHash = payload.verify_sign
    if (!receivedHash) return false

    // Re-compute hash as per SSLCommerz docs
    const sortedKeys = Object.keys(payload)
      .filter((k) => k !== "verify_sign" && k !== "verify_key")
      .sort()

    const hashStr =
      sortedKeys.map((k) => `${k}=${payload[k]}`).join("&") +
      `&store_passwd=${crypto.createHash("md5").update(storePass).digest("hex")}`

    const computedHash = crypto.createHash("md5").update(hashStr).digest("hex")
    return computedHash === receivedHash
  } catch {
    return false
  }
}

// ─── POST — Server-to-server IPN ──────────────────────────────────────────────
export async function POST(request: Request) {
  const formData = await request.formData()
  const payload: Record<string, string> = {}
  formData.forEach((value, key) => {
    payload[key] = String(value)
  })

  const isValid = await validateSSLCommerzIPN(payload)
  if (!isValid) {
    console.warn("SSLCommerz IPN validation failed", payload)
    return NextResponse.json({ error: "Invalid IPN" }, { status: 400 })
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tran_id, status, val_id, value_a: bookingId, value_b: orderId, amount, currency } = payload

  if (status === "VALID" || status === "VALIDATED") {
    // Update booking
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          payment_method: "sslcommerz",
          payment_transaction_id: tran_id,
          updated_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .eq("id", bookingId)
    }

    // Update order
    if (orderId) {
      await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("orders" as any)
        .update({
          status: "Confirmed",
          payment_status: "paid",
          payment_transaction_id: tran_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .eq("id", orderId)
    }

    console.log(`✅ SSLCommerz payment confirmed: ${tran_id}`)
  } else {
    console.warn(`❌ SSLCommerz IPN status: ${status} for ${tran_id}`)

    if (bookingId) {
      await supabase
        .from("bookings")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ payment_status: "failed", updated_at: new Date().toISOString() } as any)
        .eq("id", bookingId)
    }
  }

  return NextResponse.json({ received: true })
}

// ─── GET — Browser redirect after payment ─────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const ref = searchParams.get("ref")

  if (status === "success") {
    return NextResponse.redirect(new URL(`/dashboard?payment=success&ref=${ref}`, request.url))
  } else if (status === "cancel") {
    return NextResponse.redirect(new URL(`/checkout?payment=cancelled`, request.url))
  } else {
    return NextResponse.redirect(new URL(`/checkout?payment=failed`, request.url))
  }
}
