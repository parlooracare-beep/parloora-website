/**
 * Parloora Edge Proxy (Next.js Middleware)
 *
 * This file acts as Next.js Edge Middleware — it intercepts every request
 * BEFORE any page, layout, or React bundle is loaded into the browser.
 *
 * Security Strategy: Option A — JWT Role Cache
 *   User roles are cached in auth.users.app_metadata by the
 *   `sync_role_to_jwt` PostgreSQL trigger (see supabase/sync_role_to_jwt.sql).
 *   This means role validation costs ZERO database queries here at the Edge.
 *
 * Route Protection Matrix:
 *   /admin/*       → requires role: 'admin'
 *   /seller/*      → requires role: 'seller' or 'admin'
 *   /login, /signup → redirect already-authenticated users to their dashboard
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protected route definitions with their allowed roles
const PROTECTED_ROUTES: { prefix: string; allowedRoles: string[] }[] = [
  { prefix: '/admin', allowedRoles: ['admin'] },
  { prefix: '/seller', allowedRoles: ['seller', 'admin'] },
  { prefix: '/checkout', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/bookings', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/orders', allowedRoles: ['customer', 'seller', 'admin'] },
  { prefix: '/dashboard', allowedRoles: ['customer', 'seller', 'admin'] },
]

// Auth routes that should redirect authenticated users away
const AUTH_ROUTES = ['/login', '/signup']

// Dashboard redirect map per role
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/admin/dashboard',
  seller: '/seller/dashboard',
  customer: '/dashboard',
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Forward refreshed session cookies back to the browser
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Retrieve user from JWT — this validates the session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── 1. AUTH ROUTES: Redirect authenticated users to their dashboard ──────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)
  if (isAuthRoute && user) {
    // Read role from app_metadata (JWT-cached, zero DB latency) — normalize to lowercase
    const role: string = (
      user.app_metadata?.role ??
      user.user_metadata?.role ??
      'customer'
    ).toLowerCase()

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = ROLE_DASHBOARDS[role] ?? '/dashboard'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // ── 2. PROTECTED ROUTES: Validate role from JWT app_metadata ────────────
  const matchedRoute = PROTECTED_ROUTES.find(({ prefix }) =>
    pathname.startsWith(prefix)
  )

  if (matchedRoute) {
    // No session → redirect to login, preserving destination for post-auth redirect
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Read role from app_metadata (JWT-cached by sync_role_to_jwt trigger)
    // Falls back to user_metadata for backward compatibility with existing sessions.
    // Normalize to lowercase to handle 'Seller', 'Admin', 'seller', 'admin' etc.
    const role: string = (
      user.app_metadata?.role ??
      user.user_metadata?.role ??
      'customer'
    ).toLowerCase()

    const { allowedRoles } = matchedRoute

    if (!allowedRoles.includes(role)) {
      // Authenticated but wrong role → redirect to appropriate home
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = ROLE_DASHBOARDS[role] ?? '/'
      homeUrl.search = ''
      return NextResponse.redirect(homeUrl)
    }
  }

  return response
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * Excludes: _next/static, _next/image, favicon, and image file types.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
