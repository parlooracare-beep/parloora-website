import { NextResponse } from "next/server"

/**
 * SSLCommerz Payment Initiation Route
 * -------------------------------------------------------------------
 * Flow:
 *  1. Client sends booking/order details (POST)
 *  2. This route calls SSLCommerz's sandbox/live API to create a session
 *  3. SSLCommerz responds with a GatewayPageURL
 *  4. Client is redirected to that URL to complete payment on the SSLCommerz hosted page
 *  5. After payment, SSLCommerz calls /api/webhooks/sslcommerz (IPN) with the result
 *
 * Env vars required:
 *   SSLCOMMERZ_STORE_ID      — provided by SSLCommerz
 *   SSLCOMMERZ_STORE_PASS    — provided by SSLCommerz
 *   SSLCOMMERZ_IS_LIVE       — "true" for production, "false" for sandbox
 *   NEXT_PUBLIC_SITE_URL     — e.g. https://www.parloora.com
 */

const SSLCOMMERZ_BASE =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      amount,
      bookingId,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      serviceName = "Beauty Service",
    } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction amount." },
        { status: 400 }
      )
    }

    const storeId = process.env.SSLCOMMERZ_STORE_ID
    const storePass = process.env.SSLCOMMERZ_STORE_PASS
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    if (!storeId || !storePass) {
      return NextResponse.json(
        { success: false, error: "SSLCommerz credentials not configured." },
        { status: 500 }
      )
    }

    const transactionId = `PRL-${Date.now()}-${(bookingId || orderId || "GUEST").slice(0, 8)}`

    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePass,
      total_amount: String(Math.round(amount)),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${siteUrl}/api/webhooks/sslcommerz?status=success&ref=${transactionId}`,
      fail_url: `${siteUrl}/api/webhooks/sslcommerz?status=fail&ref=${transactionId}`,
      cancel_url: `${siteUrl}/api/webhooks/sslcommerz?status=cancel&ref=${transactionId}`,
      ipn_url: `${siteUrl}/api/webhooks/sslcommerz`,
      // Customer info
      cus_name: customerName || "Guest",
      cus_email: customerEmail || "guest@parloora.com",
      cus_phone: customerPhone || "01700000000",
      cus_add1: customerAddress || "Dhaka, Bangladesh",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      // Product info
      product_name: serviceName,
      product_category: "Beauty Service",
      product_profile: "general",
      // Shipping (not applicable for services)
      shipping_method: "NO",
      num_of_item: "1",
      // Metadata stored for IPN validation
      value_a: bookingId || "",
      value_b: orderId || "",
    })

    const sslRes = await fetch(`${SSLCOMMERZ_BASE}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })

    const sslData = await sslRes.json()

    if (sslData.status !== "SUCCESS") {
      console.error("SSLCommerz session init failed:", sslData)
      return NextResponse.json(
        { success: false, error: sslData.failedreason || "SSLCommerz session creation failed." },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      gatewayUrl: sslData.GatewayPageURL,
      sessionKey: sslData.sessionkey,
      transactionId,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("SSLCommerz API error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
