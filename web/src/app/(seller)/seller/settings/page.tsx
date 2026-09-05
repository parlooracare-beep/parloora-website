"use client"

import * as React from "react"
import Image from "next/image"
import { 
  Loader2, Building2, Phone, MapPin, Globe, Clock, Save, ChevronRight,
  AlertCircle, CheckCircle2, Camera, ShieldCheck, FileText, CreditCard, Notebook 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ProfileCompletionRing } from "@/components/shared/ProfileCompletionRing"
import { getSellerProfile, updateSellerProfile, uploadSellerFile } from "@/lib/actions/seller-profile"
import { cn } from "@/lib/utils"

const PARLOUR_TYPES = ["Man", "Woman", "Unisex"]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_HOURS: Record<string, { open: string; close: string; closed: boolean }> = {}
DAYS.forEach(d => { DEFAULT_HOURS[d] = { open: "09:00", close: "18:00", closed: false } })

export default function SellerSettingsPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Tab control
  const [activeSection, setActiveSection] = React.useState<"business" | "hours" | "verification" | "payments" | "policies">("business")
  
  // Seller State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = React.useState<any>(null)

  // Form State
  const [name, setName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [fullAddress, setFullAddress] = React.useState("")
  const [city, setCity] = React.useState("")
  const [type, setType] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [coverUrl, setCoverUrl] = React.useState("")
  const [hours, setHours] = React.useState(DEFAULT_HOURS)
  
  // Payments State
  const [bankAccount, setBankAccount] = React.useState("")
  const [bkashNumber, setBkashNumber] = React.useState("")
  const [nagadNumber, setNagadNumber] = React.useState("")

  // Verification State
  const [nidNumber, setNidNumber] = React.useState("")
  const [tradeLicense, setTradeLicense] = React.useState("")
  const [tradeLicenseUrl, setTradeLicenseUrl] = React.useState("")

  // Policies State
  const [bookingRules, setBookingRules] = React.useState("")
  const [cancellationPolicy, setCancellationPolicy] = React.useState("")

  // Hidden file inputs
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const licenseInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    async function load() {
      const p = await getSellerProfile()
      if (p) {
        setProfile(p)
        setName(p.name || "")
        setUsername(p.username || "")
        setPhone(p.phone || "")
        setAddress(p.address || "")
        setFullAddress(p.fullAddress || "")
        setCity(p.city || "")
        setType(p.type || "")
        setDescription(p.description || "")
        setWebsite(p.website || "")
        setLogoUrl(p.logoUrl || "")
        setCoverUrl(p.coverUrl || "")
        setBankAccount(p.bankAccount || "")
        setBkashNumber(p.bkashNumber || "")
        setNagadNumber(p.nagadNumber || "")
        setNidNumber(p.nidNumber || "")
        setTradeLicense(p.tradeLicense || "")
        setTradeLicenseUrl(p.tradeLicenseUrl || "")
        setBookingRules(p.bookingRules || "")
        setCancellationPolicy(p.cancellationPolicy || "")
        if (p.openingHours && typeof p.openingHours === "object" && Object.keys(p.openingHours).length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setHours({ ...DEFAULT_HOURS, ...(p.openingHours as any) })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await updateSellerProfile({
      name,
      username,
      phone,
      address,
      fullAddress,
      city,
      type,
      description,
      website,
      bankAccount,
      bkashNumber,
      nagadNumber,
      nidNumber,
      tradeLicense,
      bookingRules,
      cancellationPolicy,
      openingHours: hours
    })

    if (!res.success) {
      setError(res.error || "Failed to save settings")
    } else {
      setSaved(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProfile((prev: any) => prev ? {
        ...prev,
        profileCompletion: res.completionScore ?? prev.profileCompletion,
        isBookingReady: res.isBookingReady ?? prev.isBookingReady
      } : null)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: "logo" | "cover" | "license") => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await uploadSellerFile(formData, fileType)
      if (res.success && res.publicUrl) {
        if (fileType === "logo") setLogoUrl(res.publicUrl)
        else if (fileType === "cover") setCoverUrl(res.publicUrl)
        else if (fileType === "license") setTradeLicenseUrl(res.publicUrl)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setProfile((prev: any) => prev ? {
          ...prev,
          profileCompletion: res.completionScore ?? prev.profileCompletion,
          logoUrl: fileType === "logo" ? res.publicUrl : prev.logoUrl,
          coverUrl: fileType === "cover" ? res.publicUrl : prev.coverUrl,
          tradeLicenseUrl: fileType === "license" ? res.publicUrl : prev.tradeLicenseUrl
        } : null)

        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(res.error || "Failed to upload file")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred during file upload")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card className="border-amber-200 bg-amber-50 rounded-3xl">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
            <h2 className="text-xl font-bold text-amber-800 mb-2">No Parlour Found</h2>
            <p className="text-amber-700">Please complete your parlour registration before accessing settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ══════ HEADER BANNER ══════ */}
      <div className="bg-gradient-to-br from-brand-gray-900 via-brand-gray-800 to-black rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-brand-gray-800">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          {/* Logo upload block */}
          <div 
            onClick={() => logoInputRef.current?.click()}
            className="relative group w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer shrink-0 bg-brand-gray-800 flex items-center justify-center shadow-inner hover:border-primary/60 transition-all duration-300"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-brand-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input 
              type="file" 
              ref={logoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, "logo")} 
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight">{name || "Your Parlour"}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <Badge className={cn("border-0 text-xs font-bold", 
                profile.isBookingReady 
                  ? "bg-emerald-500/20 text-emerald-300" 
                  : "bg-amber-500/20 text-amber-300"
              )}>
                {profile.isBookingReady ? "Live & Ready for Bookings" : "Under Setup"}
              </Badge>
              <span className="text-white/30 text-xs">|</span>
              <span className="text-white/60 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {city || "District location"}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Indicator */}
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
          <ProfileCompletionRing percentage={profile.profileCompletion || 0} size={64} strokeWidth={5} />
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Setup Completion</p>
            <p className="text-sm font-extrabold text-white">
              {profile.profileCompletion}% Finish
            </p>
            <p className="text-[10px] text-brand-gray-400">
              {profile.isBookingReady ? "Accepting bookers" : "Complete sections to go live"}
            </p>
          </div>
        </div>
      </div>

      {/* ══════ MAIN GRID CONTENT ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "business", label: "Business Info", icon: Building2 },
            { id: "hours", label: "Business Hours", icon: Clock },
            { id: "verification", label: "Verification Docs", icon: ShieldCheck },
            { id: "payments", label: "Payment Options", icon: CreditCard },
            { id: "policies", label: "Policies & Rules", icon: Notebook },
          ].map(section => {
            const Icon = section.icon
            const isSelected = activeSection === section.id
            return (
              <button
                key={section.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveSection(section.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all text-left border cursor-pointer",
                  isSelected
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                    : "bg-white border-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-50/50 hover:text-brand-gray-900"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", isSelected ? "text-white" : "text-brand-gray-400")} />
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Form Fields Display */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave}>
            <Card className="border border-brand-gray-100 shadow-lg rounded-3xl overflow-hidden bg-white">
              
              {/* Section 1: Business Info */}
              {activeSection === "business" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Building2 className="w-5 h-5 text-primary" /> Business Profile
                    </CardTitle>
                    <CardDescription className="text-xs">Setup your shop name, type, contacts and cover banner.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Parlour Name</Label>
                        <Input
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="E.g., Rose Beauty Parlour"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Parlour Type / Target</Label>
                        <div className="relative">
                          <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full rounded-xl border border-brand-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-brand-gray-700 font-semibold"
                            required
                          >
                            <option value="">Select Type...</option>
                            {PARLOUR_TYPES.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray-400">
                            <ChevronRight className="w-4 h-4 transform rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/15">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <Label className="text-xs font-bold text-brand-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-primary" /> Custom Username / Public URL
                        </Label>
                        <span className="text-[11px] font-mono text-primary font-semibold truncate">
                          parloora.vercel.app/parlours/{username || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "your-username")}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-brand-gray-400 font-bold text-sm select-none">@</span>
                        <Input
                          value={username}
                          onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder={name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "the-royal-spa"}
                          className="pl-8 rounded-xl border-brand-gray-200 h-11 focus:ring-primary/20 bg-white font-mono text-xs"
                        />
                      </div>
                      <p className="text-[11px] text-brand-gray-500">
                        Clients can book and view your parlour directly using this clean custom URL. (Letters, numbers, and dashes allowed).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-primary" /> Contact Number
                        </Label>
                        <Input
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="e.g., 01xxxxxxxxx"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-primary" /> Website / Social URL
                        </Label>
                        <Input
                          value={website}
                          onChange={e => setWebsite(e.target.value)}
                          placeholder="https://facebook.com/yourparlour"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">District / City</Label>
                        <Input
                          value={city}
                          disabled
                          className="rounded-xl border-brand-gray-200 h-12 bg-brand-gray-50 text-brand-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary" /> Street Address
                        </Label>
                        <Input
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="E.g., House 12, Road 5, Sector 3"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Business Description</Label>
                      <Textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Tell customers about your parlour, specialties, and unique services..."
                        className="rounded-xl border-brand-gray-200 min-h-[120px] resize-none focus:ring-primary/20 text-sm"
                        required
                      />
                    </div>

                    {/* Cover Photo block */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Business Cover Banner</Label>
                      <input 
                        type="file" 
                        ref={coverInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, "cover")} 
                      />
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="relative group aspect-video md:aspect-[3/1] bg-brand-gray-50 rounded-2xl border-2 border-dashed border-brand-gray-200 flex flex-col items-center justify-center text-center p-6 hover:border-primary/50 transition-all cursor-pointer overflow-hidden shadow-inner"
                      >
                        {coverUrl ? (
                          <Image src={coverUrl} alt="Cover Banner" fill className="absolute inset-0 object-cover rounded-2xl" />
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-gray-400 group-hover:text-primary transition-colors mb-2">
                              <Camera className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-brand-gray-700">Upload Cover Banner</p>
                            <p className="text-[10px] text-brand-gray-400 mt-1">Horizontal layout works best (JPG, PNG up to 2MB)</p>
                          </>
                        )}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button type="button" variant="secondary" size="sm" className="rounded-lg font-bold text-xs h-9">
                            {coverUrl ? "Change Banner" : "Upload Banner"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Section 2: Business Hours */}
              {activeSection === "hours" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Clock className="w-5 h-5 text-primary" /> Business Timings
                    </CardTitle>
                    <CardDescription className="text-xs">Adjust your parlour operating hours. Unchecked days will show as closed.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {DAYS.map(day => {
                      const h = hours[day] || { open: "09:00", close: "18:00", closed: false }
                      return (
                        <div key={day} className="flex items-center gap-4 py-2.5 border-b border-brand-gray-50 last:border-0">
                          <span className="text-sm font-semibold text-brand-gray-700 w-28">{day}</span>
                          <Switch
                            checked={!h.closed}
                            onCheckedChange={val => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !val } }))}
                          />
                          <span className="text-xs text-brand-gray-500 w-8">{h.closed ? "Closed" : "Open"}</span>
                          {!h.closed && (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={h.open}
                                onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                                className="rounded-lg border-brand-gray-200 text-xs h-9 w-28"
                              />
                              <span className="text-xs text-brand-gray-400">–</span>
                              <Input
                                type="time"
                                value={h.close}
                                onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                                className="rounded-lg border-brand-gray-200 text-xs h-9 w-28"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </>
              )}

              {/* Section 3: Verification */}
              {activeSection === "verification" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <ShieldCheck className="w-5 h-5 text-primary" /> Legal & Verification Documents
                    </CardTitle>
                    <CardDescription className="text-xs">Provide security credentials to verify business ownership.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Owner's NID Number</Label>
                        <Input
                          value={nidNumber}
                          onChange={e => setNidNumber(e.target.value)}
                          placeholder="E.g., 1993269250100"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Trade License Number</Label>
                        <Input
                          value={tradeLicense}
                          onChange={e => setTradeLicense(e.target.value)}
                          placeholder="E.g., TRAD/DNCC/12345/2026"
                          className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Trade License Doc Upload */}
                    <div className="space-y-3 pt-2">
                      <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Upload Trade License Copy</Label>
                      <input 
                        type="file" 
                        ref={licenseInputRef} 
                        className="hidden" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => handleFileUpload(e, "license")} 
                      />
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => licenseInputRef.current?.click()}
                          className="h-12 px-6 border-brand-gray-200 hover:bg-brand-gray-50/50 rounded-xl font-bold text-xs"
                        >
                          <FileText className="w-4 h-4 mr-2 text-primary" /> Choose File Copy
                        </Button>
                        
                        {tradeLicenseUrl ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <a href={tradeLicenseUrl} target="_blank" rel="noreferrer" className="underline hover:opacity-90">
                              View Uploaded License
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-brand-gray-400 font-medium">No document uploaded yet.</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-gray-400 leading-relaxed">
                        * Upload trade license PDF or image copy. Maximum file size allowed is 5MB. Verified parlours get a search visibility boost.
                      </p>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Section 4: Payments */}
              {activeSection === "payments" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <CreditCard className="w-5 h-5 text-primary" /> Payout & Payment Accounts
                    </CardTitle>
                    <CardDescription className="text-xs">Setup accounts to receive platform bookings earnings payouts.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="border-b border-brand-gray-100 pb-2">
                        <h4 className="text-sm font-extrabold text-brand-gray-800">Mobile Financial Services (MFS)</h4>
                        <p className="text-xs text-brand-gray-400">Receive quick daily payouts on bKash/Nagad.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">bKash Merchant/Personal Number</Label>
                          <Input
                            value={bkashNumber}
                            onChange={e => setBkashNumber(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Nagad Merchant/Personal Number</Label>
                          <Input
                            value={nagadNumber}
                            onChange={e => setNagadNumber(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="rounded-xl border-brand-gray-200 h-12 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="border-b border-brand-gray-100 pb-2">
                        <h4 className="text-sm font-extrabold text-brand-gray-800">Bank Transfer Details</h4>
                        <p className="text-xs text-brand-gray-400">Receive secure weekly bulk payouts to bank accounts.</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Bank Account Information</Label>
                        <Textarea
                          value={bankAccount}
                          onChange={e => setBankAccount(e.target.value)}
                          placeholder="E.g., Account Name: Rose Salon Ltd, Account No: 1029384756, Bank: Eastern Bank PLC, Branch: Gulshan"
                          className="rounded-xl border-brand-gray-200 min-h-[90px] resize-none focus:ring-primary/20 text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Section 5: Policies & Rules */}
              {activeSection === "policies" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-base font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Notebook className="w-5 h-5 text-primary" /> Policies & Booking Rules
                    </CardTitle>
                    <CardDescription className="text-xs">Provide cancellation parameters and shop terms for customers.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Booking Rules</Label>
                      <Textarea
                        value={bookingRules}
                        onChange={e => setBookingRules(e.target.value)}
                        placeholder="E.g., Please arrive 10 minutes early. Female customers only. Walk-ins are subject to slot availability."
                        className="rounded-xl border-brand-gray-200 min-h-[100px] resize-none focus:ring-primary/20 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider">Cancellation & Refund Policy</Label>
                      <Textarea
                        value={cancellationPolicy}
                        onChange={e => setCancellationPolicy(e.target.value)}
                        placeholder="E.g., Free cancellation up to 24 hours in advance. Late cancellations will lose the 15% booking deposit."
                        className="rounded-xl border-brand-gray-200 min-h-[100px] resize-none focus:ring-primary/20 text-sm"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Card Footer Save Button */}
              <div className="bg-brand-gray-50/50 border-t p-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {saved && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-extrabold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved!
                    </span>
                  )}
                  {error && (
                    <span className="flex items-center gap-1 text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5" /> {error}
                    </span>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-12 px-8 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
