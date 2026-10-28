"use client"

import * as React from "react"
import Link from "next/link"
import { ParlooraLogo } from "@/components/shared/Logo"
import { useRouter, useSearchParams } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInAction } from "@/lib/actions/auth"
import { useI18n } from "@/lib/store/useI18n"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const { t } = useI18n()
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
        setError(result.error || t("auth.loginError"))
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
      setError(err.message || t("common.somethingWentWrong"))
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
          <div className="flex justify-center mb-12">
            <ParlooraLogo size="xl" href="/" />
          </div>
          <h2 className="text-4xl font-bold text-brand-gray-900 mb-4 leading-tight">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-brand-gray-500 text-lg leading-relaxed">
            {t("auth.welcomeBackSub")}
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center border-t border-brand-gray-200 pt-8">
            <div>
              <p className="text-2xl font-bold text-primary">{t("common.verified")}</p>
              <p className="text-brand-gray-400 text-xs mt-1">Top Parlours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Instant</p>
              <p className="text-brand-gray-400 text-xs mt-1">Direct Booking</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Genuine</p>
              <p className="text-brand-gray-400 text-xs mt-1">Client Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Top Controls: Back Button & Language Switcher */}
        <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-8 lg:right-8 z-10 flex items-center justify-between">
          <Button asChild variant="ghost" className="h-auto p-1.5 pr-4 rounded-full border border-brand-gray-200 bg-white hover:bg-brand-gray-50 transition-all group shadow-sm">
            <Link href="/">
              <div className="w-8 h-8 rounded-full bg-brand-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-brand-gray-500 group-hover:text-brand-gray-900 transition-colors">{t("common.back")}</span>
            </Link>
          </Button>
          <LanguageSwitcher />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden mb-10 mt-12">
          <ParlooraLogo size="md" href="/" />
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
            <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">{t("auth.signInTitle")}</h1>
            <p className="text-brand-gray-500">
              {t("auth.dontHaveAccount")}{" "}
              <Link 
                href={redirectTarget ? `/signup?redirectedFrom=${encodeURIComponent(redirectTarget)}` : "/signup"} 
                className="text-primary font-medium hover:underline"
              >
                {t("auth.signUpFree")}
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
              <label htmlFor="email" className="text-sm font-medium text-brand-gray-700">{t("auth.emailLabel")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 hover:border-brand-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-brand-gray-700">{t("auth.passwordLabel")}</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("auth.settingUpSession")}</>
              ) : (
                t("auth.signIn")
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-brand-gray-400 mt-8">
            {t("auth.termsAgree")}{" "}
            <Link href="/terms" className="text-primary hover:underline">{t("auth.termsLink")}</Link> {t("common.and")}{" "}
            <Link href="/privacy" className="text-primary hover:underline">{t("auth.privacyLink")}</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
