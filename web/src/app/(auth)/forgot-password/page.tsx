"use client"

import * as React from "react"
import Link from "next/link"
import { ParlooraLogo } from "@/components/shared/Logo"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Stage = "form" | "sent" | "error"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [stage, setStage] = React.useState<Stage>("form")
  const [errorMsg, setErrorMsg] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setErrorMsg(error.message)
        setStage("error")
      } else {
        setStage("sent")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.")
      setStage("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-6">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 flex justify-center">
          <ParlooraLogo size="lg" href="/" />
        </div>

        <AnimatePresence mode="wait">
          {/* ── Success state ─────────────────────────────────────── */}
          {stage === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-brand-gray-100 border border-brand-gray-100 p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-brand-gray-900 mb-3">Check Your Inbox</h1>
              <p className="text-brand-gray-500 leading-relaxed mb-2">
                We've sent a password reset link to
              </p>
              <p className="font-bold text-primary mb-8">{email}</p>
              <p className="text-brand-gray-400 text-sm mb-8">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setStage("form"); setEmail("") }}
                  className="text-primary font-bold hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-brand-gray-500 hover:text-primary font-bold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </motion.div>
          )}

          {/* ── Form + Error states ───────────────────────────────── */}
          {(stage === "form" || stage === "error") && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-brand-gray-100 border border-brand-gray-100 overflow-hidden"
            >
              {/* Card header */}
              <div className="bg-gradient-to-br from-brand-gray-900 to-brand-gray-800 p-8 text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black mb-1">Forgot Password?</h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  No worries — enter your email and we'll send you a reset link.
                </p>
              </div>

              <div className="p-8">
                {/* Error banner */}
                <AnimatePresence>
                  {stage === "error" && errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 flex gap-3 items-start bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="reset-email"
                      className="text-xs font-black uppercase tracking-widest text-brand-gray-400"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-13 rounded-xl border-brand-gray-100 focus:ring-primary/20 text-brand-gray-900"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-13 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base disabled:opacity-60 disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending Link…
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-brand-gray-400 hover:text-primary font-bold text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
