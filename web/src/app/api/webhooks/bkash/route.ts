import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * bKash Payment Callback Handler
 * -------------------------------------------------------------------
 * bKash redirects the user to this URL after payment (success or failure).
 * We execute the payment here and update the DB accordingly.
 *
 * Env vars required: same as /api/checkout/bkash
 */

const BKASH_BASE =
  process.env.BKASH_IS_LIVE === "true"
    ? "https://tokenized.pay.bka.sh/v1.2.0-beta"
    : "https://tokenized.sandbox.bka.sh/v1.2.0-beta"

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
  if (!data.id_token) throw new Error("bKash token grant failed")
  cachedToken = data.id_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken!
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentID = searchParams.get("paymentID")
  const status = searchParams.get("status")
  const bookingId = searchParams.get("bookingId")
  const orderId = searchParams.get("orderId")

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  // User cancelled
  if (status === "cancel" || status === "failure") {
    return NextResponse.redirect(
      new URL(`/checkout?payment=failed&method=bkash`, siteUrl)
    )
  }

  if (!paymentID) {
    return NextResponse.redirect(new URL(`/checkout?payment=failed&method=bkash`, siteUrl))
  }

  try {
    const supabase = await createClient()
    const token = await getBkashToken()

    // Execute the payment
    const executeRes = await fetch(`${BKASH_BASE}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY!,
      },
      body: JSON.stringify({ paymentID }),
    })

    const executeData = await executeRes.json()

    if (executeData.statusCode === "0000" && executeData.transactionStatus === "Completed") {
      // ── Success ────────────────────────────────────────────────
      const trxID = executeData.trxID

      if (bookingId) {
        await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("bookings" as any)
          .update({
            payment_status: "paid",
            payment_transaction_id: trxID,
            payment_method: "bkash",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId)
      }

      if (orderId) {
        await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("orders" as any)
          .update({ status: "Confirmed", payment_status: "paid", payment_transaction_id: trxID })
          .eq("id", orderId)
      }

      console.log(`✅ bKash payment confirmed: ${trxID}`)
      return NextResponse.redirect(
        new URL(`/dashboard?payment=success&method=bkash&trx=${trxID}`, siteUrl)
      )
    } else {
      // ── Failure ────────────────────────────────────────────────
      console.warn("bKash execute failed:", executeData)

      if (bookingId) {
        await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("bookings" as any)
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", bookingId)
      }

      return NextResponse.redirect(
        new URL(`/checkout?payment=failed&method=bkash&reason=${executeData.statusMessage}`, siteUrl)
      )
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("bKash callback error:", error)
    return NextResponse.redirect(new URL(`/checkout?payment=failed&method=bkash`, siteUrl))
  }
}
