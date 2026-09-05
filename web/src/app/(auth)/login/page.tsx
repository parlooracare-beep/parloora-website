"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { signInAction } from "@/lib/actions/auth"

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirectedFrom") || searchParams.get("redirect")

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    setError(null)

    try {
      const result = await signInAction({ email, password })

      if (!result.success) {
        setError(result.error || "An unexpected error occurred")
        setLoading(false)
        return
      }

      // If a specific destination was requested (e.g. /checkout or /parlours/...), redirect there
      if (redirectTarget && redirectTarget.startsWith("/")) {
        router.push(redirectTarget)
      } else if (result.role === "Seller") {
        router.push("/seller/dashboard")
      } else if (result.role === "Admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
      
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server")
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-purple/5 via-brand-rose/5 to-brand-beige relative overflow-hidden flex-col items-center justify-center p-12 border-r border-brand-gray-100">
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-violet-400/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Image src="/logo.png" alt="Parloora Logo" width={56} height={56} className="rounded-2xl object-contain" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">Parloora</span>
          </div>
          <h2 className="text-4xl font-bold text-brand-gray-900 mb-4 leading-tight">
            Welcome Back, Beautiful!
          </h2>
          <p className="text-brand-gray-500 text-lg leading-relaxed">
            Log in to access your bookings, manage your appointments, and discover new parlours near you.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center border-t border-brand-gray-200 pt-8">
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-brand-gray-400 text-sm mt-1">Parlours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">50k+</p>
              <p className="text-brand-gray-400 text-sm mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">4.8★</p>
              <p className="text-brand-gray-400 text-sm mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Back Button */}
        <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-10">
          <Button asChild variant="ghost" className="h-auto p-1.5 pr-4 rounded-full border border-brand-gray-200 bg-white hover:bg-brand-gray-50 transition-all group shadow-sm">
            <Link href="/">
              <div className="w-8 h-8 rounded-full bg-brand-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-brand-gray-500 group-hover:text-brand-gray-900 transition-colors">Back</span>
            </Link>
          </Button>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10 mt-12">
          <Image src="/logo.png" alt="Parloora Logo" width={40} height={40} className="rounded-xl object-contain" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Parloora
          </span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            {redirectTarget?.includes("/checkout") && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-gray-900">Sign in to complete your order</p>
                  <p className="text-xs text-brand-gray-600">Your cart items are saved and ready for checkout.</p>
                </div>
              </div>
            )}
            {redirectTarget?.includes("/parlours") && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-gray-900">Sign in to book your appointment</p>
                  <p className="text-xs text-brand-gray-600">You will be returned directly to the booking screen.</p>
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">Sign in to your account</h1>
            <p className="text-brand-gray-500">
              Don&apos;t have an account?{" "}
              <Link 
                href={redirectTarget ? `/signup?redirectedFrom=${encodeURIComponent(redirectTarget)}` : "/signup"} 
                className="text-primary font-medium hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>



          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-brand-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-brand-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up session...</>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-brand-gray-400 mt-8">
            By continuing, you agree to Parloora&apos;s{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
