"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ParlooraLogo } from "@/components/shared/Logo"
import { useRouter, useSearchParams } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, Mail, Lock, Eye, EyeOff, User, Phone, Loader2, Store, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { signUpAction } from "@/lib/actions/auth"
import { BANGLADESH_DISTRICTS } from "@/lib/constants"

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SignupForm />
    </React.Suspense>
  )
}

function SignupForm() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirectedFrom") || searchParams.get("redirect")
  const initialRole = searchParams.get("role") === "seller" ? "Seller" : "Customer"

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [district, setDistrict] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [role, setRole] = React.useState<"Customer" | "Seller">(initialRole)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [createdEmail, setCreatedEmail] = React.useState("")



  const passwordStrength = React.useMemo(() => {
    let score = 0
    if (!password) return { score, label: "", color: "bg-brand-gray-200" }
    if (password.length >= 8) score += 25
    if (/[A-Z]/.test(password)) score += 25
    if (/[a-z]/.test(password)) score += 25
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25

    let label = "Weak"
    let color = "bg-red-500"
    if (score === 50) {
      label = "Fair"
      color = "bg-amber-500"
    } else if (score === 75) {
      label = "Good"
      color = "bg-emerald-500"
    } else if (score === 100) {
      label = "Strong"
      color = "bg-green-500"
    }

    return { score, label, color }
  }, [password])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError(null)

    if (role === "Seller" && !businessName.trim()) {
      setError("Business Name is required")
      setLoading(false)
      return
    }

    if (role === "Seller" && !district) {
      setError("Please select your business location")
      setLoading(false)
      return
    }

    try {
      const result = await signUpAction({
        email: email.trim() || undefined,
        password,
        fullName,
        phone,
        role,
        businessName: role === "Seller" ? businessName : undefined,
        district: role === "Seller" ? district : undefined,
      })

      if (!result.success) {
        setError(result.error || "An unexpected error occurred")
        setLoading(false)
        return
      }

      setCreatedEmail(result.email || email)
      setSuccess(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }



  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-3">Check your inbox!</h1>
          <p className="text-brand-gray-500 mb-8">
            We&apos;ve sent a confirmation link to <strong className="text-brand-gray-700">{createdEmail}</strong>. 
            Please verify your email to complete your registration.
          </p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-primary to-secondary rounded-full px-8">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    )
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
          <div className="flex justify-center mb-12">
            <ParlooraLogo size="xl" href="/" />
          </div>
          <h2 className="text-4xl font-bold text-brand-gray-900 mb-4 leading-tight">
            Join the Beauty Revolution
          </h2>
          <p className="text-brand-gray-500 text-lg leading-relaxed">
            Create your account and access beauty services seamlessly across Bangladesh.
          </p>
          <div className="mt-12 space-y-4 border-t border-brand-gray-200 pt-8">
            {["Free to join, no hidden fees", "Instant booking confirmation", "Earn reward points on every visit", "Exclusive offers & discounts"].map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-left">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span className="text-brand-gray-600 font-medium text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto relative">
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
        <div className="lg:hidden mb-8 mt-12">
          <ParlooraLogo size="md" href="/" />
        </div>

        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            {redirectTarget?.includes("/checkout") && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary">
                <div>
                  <p className="font-bold text-sm text-brand-gray-900">Create an account to complete your order</p>
                  <p className="text-xs text-brand-gray-600">Quick and easy registration. Your cart is preserved!</p>
                </div>
              </div>
            )}
            {redirectTarget?.includes("/parlours") && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary">
                <div>
                  <p className="font-bold text-sm text-brand-gray-900">Create an account to book your appointment</p>
                  <p className="text-xs text-brand-gray-600">You will return directly to the parlour booking screen.</p>
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">Create your account</h1>
            <p className="text-brand-gray-500">
              Already have an account?{" "}
              <Link 
                href={redirectTarget ? `/login?redirectedFrom=${encodeURIComponent(redirectTarget)}` : "/login"} 
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>



          {/* Role Selection */}
          <div className="flex p-1 bg-brand-gray-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole("Customer")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                role === "Customer" 
                  ? "bg-white text-brand-gray-900 shadow-sm" 
                  : "text-brand-gray-500 hover:text-brand-gray-700"
              )}
            >
              <User className="w-4 h-4" />
              I&apos;m a Customer
            </button>
            <button
              type="button"
              onClick={() => setRole("Seller")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                role === "Seller" 
                  ? "bg-white text-brand-gray-900 shadow-sm" 
                  : "text-brand-gray-500 hover:text-brand-gray-700"
              )}
            >
              <Store className="w-4 h-4" />
              I&apos;m a Parlour
            </button>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* SELLER SPECIFIC FIELD: Business Name */}
            {role === "Seller" && (
              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium text-brand-gray-700">Business name</label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="E.g., Rose Beauty Parlour"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-brand-gray-700">
                {role === "Seller" ? "Owner's Full name" : "Full name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder={role === "Seller" ? "Owner's name" : "Your full name"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-brand-gray-700">Mobile number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-brand-gray-700">
                Email address {role === "Customer" && <span className="text-brand-gray-400">(optional)</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required={role === "Seller"}
                />
              </div>
            </div>

            {/* SELLER SPECIFIC FIELD: Business Location (District) */}
            {role === "Seller" && (
              <div className="space-y-2">
                <label htmlFor="district" className="text-sm font-medium text-brand-gray-700">Business Location (District)</label>
                <div className="relative">
                  <select
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 border border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm bg-white text-brand-gray-700 text-sm appearance-none outline-none"
                    required
                  >
                    <option value="">Select district...</option>
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-brand-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  minLength={8}
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
              
              {/* Real-time Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-gray-500">Password Strength:</span>
                    <span className="font-semibold text-brand-gray-700">{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-brand-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", passwordStrength.color)}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 mt-2 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
              ) : (
                "Create free account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-brand-gray-400 mt-6">
            By creating an account, you agree to Parloora&apos;s{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
