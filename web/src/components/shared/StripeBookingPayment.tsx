"use client"

import * as React from "react"
import { Elements } from "@stripe/react-stripe-js"
import { getStripe } from "@/lib/stripe"
import { StripePaymentForm } from "./StripePaymentForm"

export interface StripeBookingPaymentProps {
  clientSecret: string
  amount: number
  onCancel: () => void
  onSuccess: (paymentIntentId: string) => void
}

export default function StripeBookingPayment({
  clientSecret,
  amount,
  onCancel,
  onSuccess,
}: StripeBookingPaymentProps) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#4B1D5F",
            colorBackground: "#ffffff",
            colorText: "#1F2937",
            borderRadius: "12px",
          },
        },
      }}
    >
      <StripePaymentForm
        amount={amount}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}
