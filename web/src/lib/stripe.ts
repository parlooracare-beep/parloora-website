import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Lazy-loads and caches the Stripe client instance.
 * Ensures Stripe SDK is only loaded once, and only on the client side.
 */
export function getStripe() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!stripePromise) {
    // Falls back to a mock/public test key for local development sandbox
    const publishableKey = 
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
      'pk_test_51MzZqfJz2hR6tL9GMockKeyForLocalDevSandboxPleaseSetActualKeyInProduction'
    
    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}
