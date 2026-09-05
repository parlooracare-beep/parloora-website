import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize server-side Stripe SDK using environment private keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build_purposes', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2025-01-27.acacia' as any, // Use standard robust API version
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency = 'bdt', email, bookingId, customerName, serviceName } = body

    // 1. Validate parameter formats
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid checkout transaction amount.' },
        { status: 400 }
      )
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey || secretKey.includes('Placeholder') || secretKey === 'sk_test_placeholder_key_for_build_purposes') {
      return NextResponse.json(
        { success: false, error: 'Online card payment gateway is currently not configured.' },
        { status: 503 }
      )
    }

    // 2. Create PaymentIntent with rich booking metadata linking to Supabase database
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe processes in fractional units (cents/poisha)
      currency,
      receipt_email: email || undefined,
      metadata: {
        bookingId: bookingId || '',
        customerName: customerName || 'Guest',
        serviceName: serviceName || 'Beauty Care Service',
        platform: 'Parloora Marketplace'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // 3. Return clientSecret to securely initialize frontend Payment Elements
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Stripe Payment Intent API Exception:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize Stripe PaymentIntent' },
      { status: 500 }
    )
  }
}
