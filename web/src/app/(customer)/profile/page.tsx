"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, Camera, Save, Loader2, CheckCircle2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Heart, LogOut, ChevronRight, Settings, Calendar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShoppingBag, Sparkles, Globe, Crown, Bell, Lock, MapPin, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getUserProfile, updateCustomerProfile, updateNotificationPrefs, uploadAvatar } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/client"
import { ProfileCompletionRing } from "@/components/shared/ProfileCompletionRing"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [profile, setProfile] = React.useState<{
    id: string
    displayName: string
    email?: string
    phone: string
    avatarUrl: string
    emailNotifications: boolean
    smsNotifications: boolean
    gender: string
    dob: string
    location: string
    preferredLanguage: string
    beautyPreferences: string[]
    favoriteServices: string[]
    emergencyContact: { name: string; phone: string; relation: string }
    profileCompletion: number
  } | null>(null)
  
  const [loading, setLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUpdatingPrefs, setIsUpdatingPrefs] = React.useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [bookingsCount, setBookingsCount] = React.useState(0)
  const [ordersCount, setOrdersCount] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState<"personal" | "preferences" | "security" | "notifications">("personal")

  const BEAUTY_PREFERENCE_OPTIONS = [
    "Facial & Clean-up", "Hair Cut & Styling", "Makeup & Makeover", "Nail Art & Extensions",
    "Bridal Makeup", "Spa & Massage", "Skin Treatment", "Waxing & Threading", 
    "Manicure & Pedicure", "Hair Coloring", "Hair Keratin & Rebonding"
  ]

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch extended profile data
        const profileData = await getUserProfile()
        if (profileData) {
          setProfile({
            id: profileData.id,
            displayName: profileData.displayName,
            email: profileData.email,
            phone: profileData.phone,
            avatarUrl: profileData.avatarUrl,
            emailNotifications: profileData.emailNotifications,
            smsNotifications: profileData.smsNotifications,
            gender: profileData.gender || "",
            dob: profileData.dob || "",
            location: profileData.location || "",
            preferredLanguage: profileData.preferredLanguage || "en",
            beautyPreferences: Array.isArray(profileData.beautyPreferences) ? profileData.beautyPreferences : [],
            favoriteServices: profileData.favoriteServices || [],
            emergencyContact: profileData.emergencyContact || { name: "", phone: "", relation: "" },
            profileCompletion: profileData.profileCompletion || 0
          })
        }

        // Bookings count
        const { count: bCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", user.id)
        setBookingsCount(bCount || 0)

        // Orders count
        const { count: oCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", user.id)
        setOrdersCount(oCount || 0)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setSuccess(false)
    
    const res = await updateCustomerProfile({
      displayName: profile.displayName,
      phone: profile.phone,
      gender: profile.gender,
      dob: profile.dob,
      location: profile.location,
      preferredLanguage: profile.preferredLanguage,
      beautyPreferences: profile.beautyPreferences,
      favoriteServices: profile.favoriteServices,
      emergencyContact: profile.emergencyContact
    })

    setIsSaving(false)

    if (res.success) {
      setSuccess(true)
      if (res.completionScore !== undefined) {
        setProfile(prev => prev ? { ...prev, profileCompletion: res.completionScore! } : null)
      }
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert("Failed to update profile: " + res.error)
    }
  }

  const handleTogglePref = async (type: "email" | "sms", currentValue: boolean) => {
    if (!profile || isUpdatingPrefs) return

    const newEmailVal = type === "email" ? !currentValue : profile.emailNotifications
    const newSmsVal = type === "sms" ? !currentValue : profile.smsNotifications

    setIsUpdatingPrefs(true)
    const res = await updateNotificationPrefs({
      emailNotifications: newEmailVal,
      smsNotifications: newSmsVal
    })
    setIsUpdatingPrefs(false)

    if (res.success) {
      setProfile(prev => prev ? {
        ...prev,
        emailNotifications: newEmailVal,
        smsNotifications: newSmsVal
      } : null)
    } else {
      alert("Failed to update notification preferences: " + res.error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB")
      return
    }

    setIsUploadingAvatar(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await uploadAvatar(formData)
      if (res.success && res.avatarUrl) {
        setProfile(prev => prev ? { 
          ...prev, 
          avatarUrl: res.avatarUrl!,
          profileCompletion: res.completionScore || prev.profileCompletion
        } : null)
      } else {
        alert(res.error || "Failed to upload avatar")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("An error occurred while uploading your avatar")
      console.error(err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleTogglePreference = (preference: string) => {
    if (!profile) return
    const current = profile.beautyPreferences || []
    const updated = current.includes(preference)
      ? current.filter(item => item !== preference)
      : [...current, preference]
    
    setProfile({
      ...profile,
      beautyPreferences: updated
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-4 pb-32 md:pb-12 max-w-4xl">
      {/* ══════ PROFILE HEADER CARD ══════ */}
      <div className="bg-gradient-to-br from-[#2e1065] via-[#5b21b6] to-[#7c3aed] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-8 shadow-xl">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar block */}
            <div className="relative group w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden cursor-pointer bg-white/10 flex items-center justify-center transition-all hover:scale-105 hover:border-white/40 shadow-inner">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{profile?.displayName?.charAt(0) || "U"}</span>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>

              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploadingAvatar}
              />

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {profile?.displayName || "User"}
                </h1>
                <div className="bg-amber-400/25 border border-amber-400/40 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Gold Member
                </div>
              </div>
              <p className="text-white/70 text-sm font-medium">{profile?.email}</p>
              <div className="flex items-center gap-3 text-xs text-white/50 justify-center md:justify-start">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {bookingsCount} Bookings</span>
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> {ordersCount} Orders</span>
              </div>
            </div>
          </div>

          {/* Completion Progress widget */}
          <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
            <ProfileCompletionRing percentage={profile?.profileCompletion || 0} size={70} strokeWidth={6} />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Profile Status</p>
              <p className="text-xs font-black text-white/95 mt-0.5">
                {profile?.profileCompletion === 100 ? "Fully Complete!" : "Complete Setup"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ SUCCESS TOAST ══════ */}
      {success && (
        <div className="mb-6 flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/80 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" /> Your profile has been updated successfully!
        </div>
      )}

      {/* ══════ MAIN GRID CONTENT ══════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        
        {/* Profile Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "personal", label: "Personal Info", icon: User },
            { id: "preferences", label: "Preferences", icon: Sparkles },
            { id: "security", label: "Security & Emergency", icon: Lock },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => { setActiveTab(tab.id as any); setSuccess(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all border text-left cursor-pointer",
                  active
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white border-brand-gray-100 text-brand-gray-500 hover:bg-brand-gray-50 hover:text-brand-gray-700"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 mt-8 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50/40 border border-transparent hover:border-red-200/40 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-red-500" />
            Logout
          </button>
        </div>

        {/* Form Fields Tab Display */}
        <div className="md:col-span-3">
          <form onSubmit={handleSaveProfile}>
            <Card className="border border-brand-gray-100 shadow-lg rounded-3xl overflow-hidden bg-white">
              
              {/* Tab 1: Personal Info */}
              {activeTab === "personal" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <User className="w-5 h-5 text-primary" /> Personal Information
                    </CardTitle>
                    <CardDescription className="text-xs">Update your core personal details below.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Full Name
                        </label>
                        <Input
                          value={profile?.displayName || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                          placeholder="Your full name"
                          className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Mobile Number
                        </label>
                        <Input
                          value={profile?.phone || ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                          placeholder="01xxxxxxxxx"
                          className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Email Address
                        </label>
                        <Input
                          value={profile?.email && !profile.email.endsWith("@parloora.com") ? profile.email : ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                          placeholder="you@example.com (optional)"
                          className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={profile?.dob ? profile.dob.substring(0, 10) : ""}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, dob: e.target.value } : null)}
                          className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary text-brand-gray-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            value={profile?.gender || ""}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, gender: e.target.value } : null)}
                            className="w-full h-12 pl-4 pr-10 border border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl transition-all bg-white text-brand-gray-700 text-sm appearance-none outline-none"
                          >
                            <option value="">Select Gender...</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray-400">
                            <ChevronRight className="w-4 h-4 transform rotate-90" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          Current Location (City/Area)
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
                          <Input
                            value={profile?.location || ""}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, location: e.target.value } : null)}
                            placeholder="E.g., Gulshan, Dhaka"
                            className="pl-10 rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Tab 2: Preferences */}
              {activeTab === "preferences" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Sparkles className="w-5 h-5 text-primary" /> Beauty Preferences
                    </CardTitle>
                    <CardDescription className="text-xs">Select your preferred services and language settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    
                    {/* Preferred Language */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        Preferred Language
                      </label>
                      <div className="flex gap-4">
                        {[
                          { code: "en", label: "English" },
                          { code: "bn", label: "বাংলা (Bangla)" }
                        ].map(lang => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setProfile(prev => prev ? { ...prev, preferredLanguage: lang.code } : null)}
                            className={cn(
                              "flex-1 py-3 px-4 border rounded-xl font-bold text-xs transition-all cursor-pointer",
                              profile?.preferredLanguage === lang.code
                                ? "border-primary bg-primary/5 text-primary shadow-sm"
                                : "border-brand-gray-200 hover:bg-brand-gray-50/50 text-brand-gray-600"
                            )}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Beauty Preferences Checkbox List */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider block">
                        Interested Beauty Services
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {BEAUTY_PREFERENCE_OPTIONS.map(pref => {
                          const isChecked = profile?.beautyPreferences.includes(pref)
                          return (
                            <button
                              key={pref}
                              type="button"
                              onClick={() => handleTogglePreference(pref)}
                              className={cn(
                                "flex items-center gap-3 p-3.5 border rounded-xl text-xs font-semibold transition-all text-left cursor-pointer",
                                isChecked
                                  ? "border-primary/60 bg-primary/5 text-primary"
                                  : "border-brand-gray-150 hover:bg-brand-gray-50 text-brand-gray-600"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0",
                                isChecked ? "bg-primary border-primary text-white" : "border-brand-gray-300 bg-white"
                              )}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate">{pref}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Tab 3: Security & Emergency */}
              {activeTab === "security" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Lock className="w-5 h-5 text-primary" /> Security & Emergency Contact
                    </CardTitle>
                    <CardDescription className="text-xs">Set up emergency info and security settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    
                    {/* Emergency Contact Block */}
                    <div className="space-y-4">
                      <div className="border-b border-brand-gray-100 pb-2">
                        <h4 className="text-sm font-extrabold text-brand-gray-800">Emergency Contact Detail</h4>
                        <p className="text-xs text-brand-gray-400">Useful during medical emergencies or scheduling failures.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider block">
                            Contact Name
                          </label>
                          <Input
                            value={profile?.emergencyContact?.name || ""}
                            onChange={(e) => setProfile(prev => prev ? {
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                            } : null)}
                            placeholder="E.g., Kamal Hossain"
                            className="rounded-xl h-11 border-brand-gray-200 focus:ring-primary focus:border-primary text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider block">
                            Mobile Number
                          </label>
                          <Input
                            value={profile?.emergencyContact?.phone || ""}
                            onChange={(e) => setProfile(prev => prev ? {
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                            } : null)}
                            placeholder="01xxxxxxxxx"
                            className="rounded-xl h-11 border-brand-gray-200 focus:ring-primary focus:border-primary text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider block">
                            Relationship
                          </label>
                          <div className="relative">
                            <select
                              value={profile?.emergencyContact?.relation || ""}
                              onChange={(e) => setProfile(prev => prev ? {
                                ...prev,
                                emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                              } : null)}
                              className="w-full h-11 pl-4 pr-10 border border-brand-gray-200 focus:border-primary focus:ring-primary rounded-xl bg-white text-brand-gray-700 text-sm appearance-none outline-none"
                            >
                              <option value="">Choose...</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="sibling">Sibling</option>
                              <option value="child">Child</option>
                              <option value="friend">Friend</option>
                              <option value="other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray-400">
                              <ChevronRight className="w-4 h-4 transform rotate-90" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Tab 4: Notifications */}
              {activeTab === "notifications" && (
                <>
                  <CardHeader className="bg-brand-gray-50/50 border-b pb-5">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-brand-gray-900">
                      <Bell className="w-5 h-5 text-primary" /> Notification Settings
                    </CardTitle>
                    <CardDescription className="text-xs">Control how we communicate with you.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 divide-y divide-brand-gray-100">
                    {/* Email toggle */}
                    <div className="flex items-center justify-between py-4 first:pt-0">
                      <div className="space-y-0.5 pr-4">
                        <p className="font-bold text-sm text-brand-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-brand-gray-400" /> Email Notifications
                        </p>
                        <p className="text-xs text-brand-gray-400">
                          Receive booking confirmations, status changes, and shop order receipts.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePref("email", profile?.emailNotifications ?? true)}
                        disabled={isUpdatingPrefs}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer",
                          profile?.emailNotifications ? "bg-primary" : "bg-brand-gray-205 bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            profile?.emailNotifications ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>

                    {/* SMS toggle */}
                    <div className="flex items-center justify-between py-4 last:pb-0">
                      <div className="space-y-0.5 pr-4">
                        <p className="font-bold text-sm text-brand-gray-900 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-brand-gray-400" /> SMS Alerts
                        </p>
                        <p className="text-xs text-brand-gray-400">
                          Get text reminders 1 hour before scheduled appointments and critical status updates.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTogglePref("sms", profile?.smsNotifications ?? true)}
                        disabled={isUpdatingPrefs}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer",
                          profile?.smsNotifications ? "bg-primary" : "bg-brand-gray-205 bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            profile?.smsNotifications ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  </CardContent>
                </>
              )}

               {/* Card Footer Submit Button */}
              {activeTab !== "notifications" && (
                <div className="bg-brand-gray-50/50 border-t p-4 sm:p-6 flex justify-center sm:justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Tab Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
