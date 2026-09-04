"use client"

import * as React from "react"
import { User, Mail, Phone, Camera, Save, Loader2, CheckCircle2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

export default function AdminProfilePage() {
  const [profile, setProfile] = React.useState<{ displayName: string; email?: string; phone: string } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("display_name, email, phone")
          .eq("id", user.id)
          .single()

        setProfile({
          displayName: data?.display_name || "",
          email: data?.email || user.email || "",
          phone: data?.phone || ""
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setSuccess(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from("users")
        .update({
          display_name: profile.displayName,
          phone: profile.phone,
        })
        .eq("id", user.id)

      if (!error) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert("Failed to update profile: " + error.message)
      }
    }

    setIsSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-brand-gray-400" />
          My Profile
        </h2>
        <p className="text-brand-gray-500 text-sm mt-1">Manage your admin account information.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-brand-gray-200 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-brand-gray-50 border-b pb-8">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-brand-gray-900 flex items-center justify-center text-amber-400 text-3xl font-bold border-4 border-white shadow-lg">
                  {profile?.displayName?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-brand-gray-100 text-brand-gray-600 hover:text-primary transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <CardTitle className="mt-4 text-xl">{profile?.displayName || "Admin"}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
              <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                <Shield className="w-3 h-3 mr-1" /> Administrator
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-gray-400" /> Full Name
              </label>
              <Input
                value={profile?.displayName || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                placeholder="Enter your full name"
                className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gray-400" /> Email Address
              </label>
              <Input
                value={profile?.email || ""}
                disabled
                className="rounded-xl h-12 bg-brand-gray-50 border-brand-gray-100 text-brand-gray-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-brand-gray-400 italic px-1">Email cannot be changed for security reasons.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gray-400" /> Phone Number
              </label>
              <Input
                value={profile?.phone || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="+880 1XXX XXXXXX"
                className="rounded-xl h-12 border-brand-gray-200 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="pt-4 border-t flex flex-col items-center gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-14 bg-brand-gray-900 text-white hover:bg-brand-gray-800 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </Button>

              {success && (
                <div className="flex items-center gap-2 text-emerald-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5" /> Profile updated successfully!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
