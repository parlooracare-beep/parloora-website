import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { sendBookingStatusUpdate, sendOrderConfirmation } from "@/lib/email"
import { sendBookingStatusSMS } from "@/lib/sms"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_build_purposes', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2025-01-27.acacia" as any,
})

// Stripe requires the raw body bytes for signature verification

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("⚠️  Stripe webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createClient()

  // ─── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {
    // ── Payment succeeded — confirm booking / order ──────────────────────────
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent
      const { bookingId } = pi.metadata

      if (bookingId) {
        // Update the booking record
        const { data: updatedBooking, error: bookErr } = await supabase
          .from("bookings")
          .update({
            payment_status: "paid",
            payment_intent_id: pi.id,
            payment_method: "stripe",
            updated_at: new Date().toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .eq("id", bookingId)
          .select()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .single() as any

        if (bookErr) {
          console.error("Failed to update booking after payment:", bookErr)
        } else if (updatedBooking) {
          console.log(`✅ Booking ${bookingId} marked as paid via Stripe`)
          
          // Send payment confirmation email/SMS
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
                }, "paid & confirmed").catch(console.error)
              }
              if (profile.sms_notifications !== false && profile.phone) {
                sendBookingStatusSMS(profile.phone, {
                  service_name:  updatedBooking.service_name,
                  parlour_name:  updatedBooking.parlour_name,
                  date:          updatedBooking.date,
                  customer_name: updatedBooking.customer_name,
                }, "paid & confirmed").catch(console.error)
              }
            }
          }
        }
      }

      // Also mark orders that reference this payment intent
      const { data: updatedOrders } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("orders" as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ status: "Confirmed", payment_status: "paid", payment_intent_id: pi.id } as any)
        .eq("payment_intent_id", pi.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select() as any

      if (updatedOrders && updatedOrders.length > 0) {
        for (const order of updatedOrders) {
          if (order.customer_id) {
            const { data: profile } = await supabase
              .from("users")
              .select("email, email_notifications")
              .eq("id", order.customer_id)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .single() as any
            
            if (profile && profile.email_notifications !== false && profile.email) {
              sendOrderConfirmation(profile.email, {
                id: order.id,
                customer_name: order.customer_name,
                total_amount: order.total_amount,
                items_count: order.items_count,
                status: "Confirmed"
              }).catch(console.error)
            }
          }
        }
      }

      break
    }

    // ── Payment failed — mark booking/order accordingly ─────────────────────
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent
      const { bookingId } = pi.metadata

      if (bookingId) {
        await supabase
          .from("bookings")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ payment_status: "failed", updated_at: new Date().toISOString() } as any)
          .eq("id", bookingId)
      }

      console.warn(`❌ Payment failed for booking ${bookingId}:`, pi.last_payment_error?.message)
      break
    }

    // ── Charge refunded ─────────────────────────────────────────────────────
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("bookings" as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ payment_status: "refunded", updated_at: new Date().toISOString() } as any)
        .eq("payment_intent_id", paymentIntentId)

      await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("orders" as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ status: "Refunded", payment_status: "refunded" } as any)
        .eq("payment_intent_id", paymentIntentId)

      console.log(`🔄 Refund processed for PaymentIntent ${paymentIntentId}`)
      break
    }

    default:
      // Unhandled event types — log for debugging
      console.log(`Unhandled Stripe event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
