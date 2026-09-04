"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Sparkles, Mail, Lock, User, Phone, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Loader2, Scissors, Building2, MapPin, 
  CheckCircle2, ArrowRight, Calendar, Package,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { createParlourAction } from "@/lib/actions/parlours"

export default function SellerSignupPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "Unisex",
    city: "Dhaka",
    address: "",
    phone: ""
  })

  const handleNext = () => setStep(2)
  const handleBack = () => setStep(1)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { 
          full_name: formData.fullName, 
          role: "Seller",
          phone_number: formData.phone
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const user = authData.user
    if (!user) {
      setError("Something went wrong during signup.")
      setLoading(false)
      return
    }

    // 2. Create the parlour entry (even if email is not verified, we can create it as pending)
    const result = await createParlourAction({
      name: formData.businessName,
      owner_id: user.id,
      city: formData.city,
      phone: formData.phone,
      type: formData.businessType,
      address: formData.address
    })

    if (!result.success) {
      setError("User created but parlour setup failed: " + result.error)
      setLoading(false)
      return
    }

    setStep(3) // Success step
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex bg-brand-gray-50/50">
      {/* Sidebar Content */}
      <div className="hidden lg:flex w-1/3 bg-brand-gray-900 flex-col p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <Link href="/" className="flex items-center gap-2 mb-20 relative z-10">
          <Image src="/logo.png" alt="Parloora Logo" width={48} height={48} className="rounded-xl object-contain" />
          <span className="text-2xl font-black">Parloora</span>
        </Link>

        <div className="space-y-12 relative z-10">
          <div>
            <h2 className="text-4xl font-black mb-4 leading-tight">Grow Your <span className="text-primary italic">Beauty</span> Business</h2>
            <p className="text-brand-gray-400">Join thousands of beauty professionals who use Parloora to reach more customers and manage their bookings seamlessly.</p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Building2, title: "List Your Parlour", desc: "Showcase your services to a global audience." },
              { icon: Calendar, title: "Manage Bookings", desc: "Automate your schedule and reduce no-shows." },
              { icon: Package, title: "Sell Products", desc: "Expand your revenue by selling beauty essentials." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-brand-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {step === 3 ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-black text-brand-gray-900 mb-4">Application Received!</h1>
              <p className="text-brand-gray-500 mb-8 leading-relaxed">
                Thank you for applying to be a Parloora Partner. We&apos;ve sent a verification email to <strong className="text-brand-gray-900 font-bold">{formData.email}</strong>. 
                <br /><br />
                Our team will review your business details and get back to you within 24 hours.
              </p>
              <div className="space-y-4">
                <Button asChild className="w-full bg-brand-gray-900 text-white rounded-xl px-8 h-12 font-bold hover:scale-[1.02] transition-transform">
                  <Link href="/">Return to Homepage</Link>
                </Button>
                <p className="text-xs text-brand-gray-400">
                  Didn&apos;t receive the email? <button className="text-primary font-bold hover:underline">Resend Verification</button>
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2].map((i) => (
                    <div key={i} className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-500",
                      step >= i ? "bg-primary" : "bg-brand-gray-200"
                    )} />
                  ))}
                </div>
                <h1 className="text-3xl font-black text-brand-gray-900 mb-2">Partner with Parloora</h1>
                <p className="text-brand-gray-500">Step {step} of 2: {step === 1 ? "Account Owner Details" : "Tell us about your business"}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSignup} className="space-y-6">
                {step === 1 ? (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          name="fullName"
                          required 
                          placeholder="Your legal name" 
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">Business Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          name="email"
                          type="email" 
                          required 
                          placeholder="contact@yourbusiness.com" 
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">Create Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          name="password"
                          type="password" 
                          required 
                          placeholder="Min. 8 characters" 
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">Business Name</Label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          name="businessName"
                          required 
                          placeholder="e.g. Elegance Spa & Salon" 
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-brand-gray-400">Business Type</Label>
                        <select 
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 rounded-xl border border-brand-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white"
                        >
                          <option>Man</option>
                          <option>Woman</option>
                          <option>Unisex</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-brand-gray-400">Contact Number</Label>
                        <div className="relative group">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            name="phone"
                            required 
                            placeholder="+880..." 
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">City</Label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          name="city"
                          required 
                          placeholder="Dhaka" 
                          value={formData.city}
                          onChange={handleInputChange}
                          className="pl-11 h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-brand-gray-400">Business Address</Label>
                      <Input 
                        name="address"
                        required 
                        placeholder="House no, Road no, Area..." 
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-brand-gray-200 focus:ring-primary focus:border-primary transition-all px-4" 
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  {step === 2 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack} 
                      className="flex-1 h-12 rounded-xl font-bold border-brand-gray-200 hover:bg-brand-gray-50 transition-colors"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={cn(
                      "flex-[2] h-12 rounded-xl font-black text-lg transition-all active:scale-95",
                      step === 1 ? "bg-brand-gray-900 text-white hover:bg-brand-gray-800" : "bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90"
                    )}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : step === 1 ? (
                      <div className="flex items-center justify-center gap-2">
                        Next Step <ArrowRight className="w-5 h-5" />
                      </div>
                    ) : (
                      "Launch My Business"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {step !== 3 && (
            <p className="mt-10 text-center text-sm text-brand-gray-400 font-medium">
              Already have a business account? <Link href="/login" className="text-primary font-bold hover:underline transition-all">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
