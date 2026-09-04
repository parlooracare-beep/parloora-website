"use client"

import * as React from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
  amount: number
}

export function StripePaymentForm({ onSuccess, onCancel, amount }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet.
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    // Trigger form validation first
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message || "An error occurred validating elements.")
      setIsProcessing(false)
      return
    }

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // We handle the success callback in-app instead of page redirect
    })

    if (error) {
      // Show error to customer
      setErrorMessage(error.message || "An unexpected error occurred processing your payment.")
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment completed successfully! Call parent success callback
      onSuccess(paymentIntent.id)
    } else {
      setErrorMessage("Payment status could not be verified. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-brand-gray-50 p-4 rounded-2xl border border-brand-gray-100 mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-brand-gray-400 font-bold uppercase tracking-wider">Amount to Pay</span>
          <p className="text-2xl font-black text-primary">৳{amount.toLocaleString()}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-brand-gray-100 shadow-inner">
        <PaymentElement 
          options={{
            layout: "accordion",
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={isProcessing}
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border-brand-gray-200 text-brand-gray-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            `Pay ৳${amount.toLocaleString()}`
          )}
        </Button>
      </div>

      <p className="text-[10px] text-center text-brand-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
        🔒 SSL Encrypted & Secure checkout
      </p>
    </form>
  )
}
