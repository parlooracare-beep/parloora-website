/**
 * Parloora Safe Environment Configuration & Readiness Validator
 *
 * Validates critical environment variables without exposing any secret values
 * in logs or client-facing bundles.
 */

export interface EnvStatus {
  isProduction: boolean
  siteUrl: string
  services: {
    supabase: boolean
    supabaseServiceRole: boolean
    stripe: boolean
    sslcommerz: boolean
    bkash: boolean
    resend: boolean
    twilio: boolean
    openai: boolean
  }
  missingRequired: string[]
}

/**
 * Validates the runtime configuration and returns the operational readiness status.
 * Never throws fatal exceptions in production, enabling graceful degradation.
 */
export function validateEnvironment(): EnvStatus {
  const isProduction = process.env.NODE_ENV === "production"
  const missingRequired: string[] = []

  // 1. Critical Public Keys
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
    missingRequired.push("NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!supabaseAnon || supabaseAnon.length < 20) {
    missingRequired.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  // 2. Integration Readiness Checks
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const sslStoreId = process.env.SSLCOMMERZ_STORE_ID
  const sslStorePass = process.env.SSLCOMMERZ_STORE_PASS
  const bkashKey = process.env.BKASH_APP_KEY
  const bkashSecret = process.env.BKASH_APP_SECRET
  const resendKey = process.env.RESEND_API_KEY
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const openaiKey = process.env.OPENAI_API_KEY

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parloora.com"

  return {
    isProduction,
    siteUrl,
    services: {
      supabase: Boolean(supabaseUrl && supabaseAnon),
      supabaseServiceRole: Boolean(serviceRoleKey && !serviceRoleKey.includes("placeholder")),
      stripe: Boolean(stripeSecret && !stripeSecret.includes("placeholder")),
      sslcommerz: Boolean(sslStoreId && sslStorePass && !sslStoreId.includes("placeholder")),
      bkash: Boolean(bkashKey && bkashSecret && !bkashKey.includes("placeholder")),
      resend: Boolean(resendKey && !resendKey.includes("placeholder")),
      twilio: Boolean(twilioSid && !twilioSid.includes("placeholder")),
      openai: Boolean(openaiKey && !openaiKey.includes("placeholder")),
    },
    missingRequired,
  }
}
