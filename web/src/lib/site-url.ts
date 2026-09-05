/**
 * Resolves the canonical public site URL across local development,
 * Vercel preview/production deployments, and custom production domains.
 */
export function getSiteUrl(): string {
  // 1. Explicit production URL set via environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  // 2. Vercel Production URL (automatically supplied by Vercel deployment engine)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`
  }

  // 3. Vercel Deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  }

  // 4. Local development URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }

  // 5. Default production domain fallback
  return "https://parloora.vercel.app"
}
