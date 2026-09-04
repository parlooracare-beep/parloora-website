"use client"

import * as React from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Settings, Shield, Bell, CreditCard, 
  Globe, Save, Loader2, CheckCircle2,
  AlertTriangle, Hammer, Layout, Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  getHomepageContent, 
  updateHomepageContent,
  getFooterSettings,
  updateFooterSettings
} from "@/lib/actions/site"
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = React.useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [footer, setFooter] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"aesthetics" | "config">("aesthetics")

  React.useEffect(() => {
    async function load() {
      const [contentData, footerData] = await Promise.all([
        getHomepageContent(),
        getFooterSettings()
      ])
      setContent(contentData)
      setFooter(footerData)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const [res1, res2] = await Promise.all([
      updateHomepageContent(content),
      updateFooterSettings(footer)
    ])
    if (res1.success && res2.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-gray-400" />
            System Configuration
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Manage global platform parameters, brand designs, and security settings.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-brand-gray-150 p-1 rounded-xl flex gap-1 border border-brand-gray-200 shadow-inner">
          <button
            onClick={() => setActiveTab("aesthetics")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "aesthetics" 
                ? "bg-white text-brand-gray-900 shadow-sm" 
                : "text-brand-gray-500 hover:text-brand-gray-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Brand Aesthetics
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "config" 
                ? "bg-white text-brand-gray-900 shadow-sm" 
                : "text-brand-gray-500 hover:text-brand-gray-800"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Core Settings
          </button>
        </div>
      </div>

      {activeTab === "aesthetics" ? (
        <ThemeCustomizer />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

          {/* Platform Fees */}
          <Card className="border-brand-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Financial Settings
              </CardTitle>
              <CardDescription>Configure platform commission and payment parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-brand-gray-500 uppercase">Platform Commission (%)</Label>
                  <div className="relative">
                    <Input defaultValue="10" className="pr-8 h-11 rounded-xl" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-brand-gray-500 uppercase">Min Withdrawal (৳)</Label>
                  <Input defaultValue="5000" className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-brand-gray-900">Auto-Approve Withdrawals</p>
                  <p className="text-xs text-brand-gray-500">Enable automatic payouts for trusted partners.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Website Content Management */}
          <Card className="border-brand-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-500" /> Website Content
              </CardTitle>
              <CardDescription>Manage the text and call-to-actions on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">
              {/* Hero Section */}
              <div className="space-y-4 border-b border-brand-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-brand-gray-900">Hero Section</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Hero Pill Text</Label>
                    <Input 
                      value={content.hero_pill_text} 
                      onChange={(e) => setContent({...content, hero_pill_text: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Main Headline</Label>
                    <Input 
                      value={content.hero_title} 
                      onChange={(e) => setContent({...content, hero_title: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Sub-headline</Label>
                    <Textarea 
                      value={content.hero_subtitle} 
                      onChange={(e) => setContent({...content, hero_subtitle: e.target.value})}
                      className="rounded-xl border-brand-gray-200 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Highlight */}
              <div className="space-y-4 border-b border-brand-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-secondary rounded-full" />
                  <h3 className="text-sm font-bold text-brand-gray-900">Shop Section</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Title</Label>
                    <Input 
                      value={content.shop_title} 
                      onChange={(e) => setContent({...content, shop_title: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Subtitle</Label>
                    <Textarea 
                      value={content.shop_subtitle} 
                      onChange={(e) => setContent({...content, shop_subtitle: e.target.value})}
                      className="rounded-xl border-brand-gray-200 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-bold text-brand-gray-900">CTA Banner</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Title</Label>
                    <Input 
                      value={content.cta_title} 
                      onChange={(e) => setContent({...content, cta_title: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Subtitle</Label>
                    <Textarea 
                      value={content.cta_subtitle} 
                      onChange={(e) => setContent({...content, cta_subtitle: e.target.value})}
                      className="rounded-xl border-brand-gray-200 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Management */}
          <Card className="border-brand-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Footer Management
              </CardTitle>
              <CardDescription>Manage your company info and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">
              <div className="space-y-4 border-b border-brand-gray-100 pb-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">About Parloora</Label>
                  <Textarea 
                    value={footer?.about_text} 
                    onChange={(e) => setFooter({...footer, about_text: e.target.value})}
                    className="rounded-xl border-brand-gray-200 min-h-[80px]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Address</Label>
                    <Input 
                      value={footer?.address} 
                      onChange={(e) => setFooter({...footer, address: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Phone</Label>
                    <Input 
                      value={footer?.phone} 
                      onChange={(e) => setFooter({...footer, phone: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Support Email</Label>
                    <Input 
                      value={footer?.email} 
                      onChange={(e) => setFooter({...footer, email: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand-gray-900">Social Media Links</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Facebook</Label>
                    <Input 
                      value={footer?.facebook_url} 
                      onChange={(e) => setFooter({...footer, facebook_url: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Instagram</Label>
                    <Input 
                      value={footer?.instagram_url} 
                      onChange={(e) => setFooter({...footer, instagram_url: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Twitter (X)</Label>
                    <Input 
                      value={footer?.twitter_url} 
                      onChange={(e) => setFooter({...footer, twitter_url: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">YouTube</Label>
                    <Input 
                      value={footer?.youtube_url} 
                      onChange={(e) => setFooter({...footer, youtube_url: e.target.value})}
                      className="rounded-xl border-brand-gray-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-brand-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> System Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 border border-amber-100 bg-amber-50 rounded-2xl">
                <div className="flex gap-3">
                  <Hammer className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-900">Maintenance Mode</p>
                    <p className="text-xs text-amber-700/70">Enable this to prevent customer bookings during updates.</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border border-brand-gray-100 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-brand-gray-900">Public Partner Registration</p>
                  <p className="text-xs text-brand-gray-500">Allow new sellers to register without an invite.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-brand-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Admin Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-brand-gray-500 uppercase">Support Email</Label>
                <Input defaultValue="support@parloora.com" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-brand-gray-500 uppercase">Notification Level</Label>
                <select className="w-full h-10 px-3 border border-brand-gray-200 rounded-lg text-sm bg-white outline-none focus:border-primary">
                  <option>All Activity</option>
                  <option>Critical Only</option>
                  <option>Disabled</option>
                </select>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-11 rounded-xl font-bold shadow-lg shadow-brand-gray-200 mt-4">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {success && (
                <p className="text-xs text-center text-emerald-600 font-bold flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-bottom-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Platform updated successfully
                </p>
              )}
            </CardContent>
          </Card>

          <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2 text-red-700">
               <AlertTriangle className="w-5 h-5" />
               <span className="font-bold">Danger Zone</span>
             </div>
             <p className="text-xs text-red-600/70 leading-relaxed">
               Modifying global parameters can affect platform stability and financial reporting. Proceed with caution.
             </p>
             <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-100 h-10 rounded-xl text-xs font-bold">
               Purge System Cache
             </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

