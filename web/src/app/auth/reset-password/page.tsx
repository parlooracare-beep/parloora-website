"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const passwordStrength = React.useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength]
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"][passwordStrength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateErr } = await supabase.auth.updateUser({ password })

      if (updateErr) {
        setError(updateErr.message)
      } else {
        setDone(true)
        setTimeout(() => router.push("/login"), 3000)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to update password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-6">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-brand-gray-900 tracking-tight">Parloora</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl shadow-brand-gray-100 border border-brand-gray-100 p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-brand-gray-900 mb-3">Password Updated!</h1>
              <p className="text-brand-gray-500 leading-relaxed mb-6">
                Your password has been successfully changed. Redirecting you to login…
              </p>
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Taking you to login
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-brand-gray-100 border border-brand-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-brand-gray-900 to-brand-gray-800 p-8 text-white">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black mb-1">Set New Password</h1>
                <p className="text-white/60 text-sm">
                  Choose a strong password to protect your Parloora account.
                </p>
              </div>

              <div className="p-8">
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 flex gap-3 items-start bg-red-50 text-red-700 border border-red-100 rounded-2xl p-4"
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New password */}
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-xs font-black uppercase tracking-widest text-brand-gray-400">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                      <Input
                        id="new-password"
                        type={showPw ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-13 rounded-xl border-brand-gray-100 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= passwordStrength ? strengthColor : "bg-brand-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-bold ${passwordStrength >= 3 ? "text-emerald-600" : passwordStrength >= 2 ? "text-amber-600" : "text-red-500"}`}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-xs font-black uppercase tracking-widest text-brand-gray-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`pl-10 pr-12 h-13 rounded-xl transition-colors ${
                          confirm && confirm !== password
                            ? "border-red-300 focus:ring-red-200"
                            : confirm && confirm === password
                            ? "border-emerald-300 focus:ring-emerald-200"
                            : "border-brand-gray-100 focus:ring-primary/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !password || !confirm}
                    className="w-full h-13 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base disabled:opacity-60 disabled:scale-100"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating…</>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
