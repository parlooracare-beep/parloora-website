"use client"

import * as React from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Paintbrush, Sparkles, Check, Type, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  RotateCcw, Sliders, Layout, CheckCircle2, 
  Loader2, AlertCircle, Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  ThemeSettings, 
  getThemeSettings, 
  updateThemeSettings 
} from "@/lib/actions/site"

const COLOR_PRESETS = [
  { name: "Royal Purple & Rose Gold", primary: "#4B1E6D", secondary: "#E6B7A9", label: "Classic Parloora" },
  { name: "Midnight Teal & Emerald", primary: "#0F766E", secondary: "#34D399", label: "Organic Spa" },
  { name: "Sunset Crimson & Velvet", primary: "#881337", secondary: "#F43F5E", label: "Luxury Glam" },
  { name: "Deep Charcoal & Gold", primary: "#1E293B", secondary: "#E2E8F0", label: "Minimal Chic" },
]

const FONTS = [
  { name: "Inter", value: "Inter", desc: "Clean & modern sans-serif" },
  { name: "Playfair Display", value: "Playfair Display", desc: "Elegant serif for beauty" },
  { name: "Outfit", value: "Outfit", desc: "High premium brand aesthetic" },
  { name: "DM Sans", value: "DM Sans", desc: "Warm and cozy geometric" },
]

export function ThemeCustomizer() {
  const [theme, setTheme] = React.useState<ThemeSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      const data = await getThemeSettings()
      setTheme(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleApplyPreset = (primary: string, secondary: string) => {
    if (!theme) return
    setTheme({
      ...theme,
      primary_color: primary,
      secondary_color: secondary
    })
  }

  const handleSave = async () => {
    if (!theme) return
    setIsSaving(true)
    setError(null)
    const res = await updateThemeSettings(theme)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Proactively trigger css variables update on page for active session
      const root = document.documentElement
      root.style.setProperty('--primary', theme.primary_color)
      root.style.setProperty('--secondary', theme.secondary_color)
      root.style.setProperty('--radius', theme.border_radius)
    } else {
      setError(res.error || "Failed to update theme")
    }
    setIsSaving(false)
  }

  if (loading || !theme) {
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-brand-gray-100 rounded-3xl">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-brand-gray-500 font-bold">Loading Customizer...</span>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="border-brand-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-brand-gray-50/50 border-b border-brand-gray-100">
            <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-primary" /> Brand Aesthetics & Layout
            </CardTitle>
            <CardDescription>Customize global platform styling, brand identities, and visual micro-details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Presets */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-brand-gray-400 uppercase tracking-widest">Brand Color Presets</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {COLOR_PRESETS.map((preset) => {
                  const isActive = theme.primary_color === preset.primary && theme.secondary_color === preset.secondary
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.primary, preset.secondary)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isActive 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                          : "border-brand-gray-100 hover:bg-brand-gray-50"
                      }`}
                    >
                      <div className="flex -space-x-1.5 shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.primary }} />
                        <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.secondary }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-gray-800 line-clamp-1">{preset.name}</p>
                        <p className="text-[9px] text-brand-gray-400 font-bold uppercase tracking-wider">{preset.label}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid sm:grid-cols-2 gap-6 border-t border-brand-gray-50 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Primary Color</Label>
                <div className="flex gap-2.5">
                  <div className="relative w-11 h-11 rounded-xl border border-brand-gray-200 overflow-hidden shrink-0 shadow-inner">
                    <input 
                      type="color" 
                      value={theme.primary_color} 
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      className="absolute inset-0 w-full h-full scale-150 cursor-pointer" 
                    />
                  </div>
                  <Input 
                    value={theme.primary_color} 
                    onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                    className="rounded-xl font-mono uppercase text-xs tracking-wider" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Secondary Color</Label>
                <div className="flex gap-2.5">
                  <div className="relative w-11 h-11 rounded-xl border border-brand-gray-200 overflow-hidden shrink-0 shadow-inner">
                    <input 
                      type="color" 
                      value={theme.secondary_color} 
                      onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                      className="absolute inset-0 w-full h-full scale-150 cursor-pointer" 
                    />
                  </div>
                  <Input 
                    value={theme.secondary_color} 
                    onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                    className="rounded-xl font-mono uppercase text-xs tracking-wider" 
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 border-t border-brand-gray-50 pt-4">
              <Label className="text-xs font-black text-brand-gray-400 uppercase tracking-widest">Typography / Brand Font</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {FONTS.map((font) => {
                  const isActive = theme.font_family === font.value
                  return (
                    <button
                      key={font.value}
                      onClick={() => setTheme({ ...theme, font_family: font.value })}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        isActive 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                          : "border-brand-gray-100 hover:bg-brand-gray-50"
                      }`}
                    >
                      <Type className="w-5 h-5 text-brand-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-gray-800" style={{ fontFamily: font.value }}>{font.name}</p>
                        <p className="text-[10px] text-brand-gray-400 font-medium leading-none mt-0.5">{font.desc}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Micro Layout details */}
            <div className="space-y-4 border-t border-brand-gray-50 pt-4">
              <Label className="text-xs font-black text-brand-gray-400 uppercase tracking-widest">Animations & Advanced Stylings</Label>
              
              <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-brand-gray-900">Premium Glassmorphism Effect</p>
                  <p className="text-xs text-brand-gray-500">Enable frosted glass effects on cards and modals.</p>
                </div>
                <Switch 
                  checked={theme.glassmorphism_enabled} 
                  onCheckedChange={(checked) => setTheme({ ...theme, glassmorphism_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-2xl border border-brand-gray-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-brand-gray-900">Interactive Animations</p>
                  <p className="text-xs text-brand-gray-500">Enable smooth micro-animations and page transitions.</p>
                </div>
                <Switch 
                  checked={theme.animations_enabled} 
                  onCheckedChange={(checked) => setTheme({ ...theme, animations_enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">Border Radius (Rounded corners)</Label>
                  <span className="text-xs font-bold text-brand-gray-600 bg-brand-gray-100 px-2 py-0.5 rounded-full">{theme.border_radius}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["0px", "0.375rem", "0.75rem", "1.25rem"].map((r) => {
                    const labelMap: Record<string, string> = { "0px": "Sharp", "0.375rem": "Sleek", "0.75rem": "Balanced", "1.25rem": "Organic" }
                    const isActive = theme.border_radius === r
                    return (
                      <button
                        key={r}
                        onClick={() => setTheme({ ...theme, border_radius: r })}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                          isActive 
                            ? "bg-brand-gray-900 border-brand-gray-900 text-white shadow-sm" 
                            : "bg-white border-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-50"
                        }`}
                      >
                        {labelMap[r]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="w-full bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-12 rounded-2xl font-black text-sm shadow-xl shadow-brand-gray-200 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                {isSaving ? "Saving Aesthetics..." : "Apply & Deploy Design Customizations"}
              </Button>
              
              {success && (
                <p className="text-xs text-center text-emerald-600 font-bold flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-bottom-1">
                  <CheckCircle2 className="w-4 h-4" /> System aesthetics compiled and deployed in real-time
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Mockup Preview Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="sticky top-20">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4.5 h-4.5 text-brand-gray-400" />
            <span className="text-xs font-bold text-brand-gray-500 uppercase tracking-widest">Live Visual Mockup Preview</span>
          </div>

          {/* Customer Portal Mockup Frame */}
          <div className="w-full bg-brand-gray-950 p-2.5 rounded-[2.5rem] shadow-2xl border border-brand-gray-800 overflow-hidden relative group">
            {/* Lighter overlay reflection */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />
            
            <div className="bg-white rounded-[2rem] overflow-hidden min-h-[460px] flex flex-col font-sans transition-all duration-300 relative">
              
              {/* Header mockup */}
              <div className="px-4 py-3.5 border-b border-brand-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all shadow-md" style={{ backgroundColor: theme.primary_color }}>
                    P
                  </div>
                  <span className="font-black text-xs text-brand-gray-900 tracking-tight">Parloora</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-2 rounded bg-brand-gray-100" />
                  <div className="w-5 h-2 rounded bg-brand-gray-100" />
                  <div 
                    className="w-11 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white px-1 shadow-sm transition-all"
                    style={{ backgroundColor: theme.primary_color, borderRadius: theme.border_radius }}
                  >
                    Book Now
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col p-4 relative" style={{ fontFamily: theme.font_family }}>
                
                {/* Hero Box inside Mockup */}
                <div 
                  className="p-5 rounded-2xl text-center text-white relative overflow-hidden transition-all duration-300 shadow-md"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${theme.primary_color} 0%, ${theme.primary_color}dd 50%, ${theme.secondary_color}dd 100%)`,
                    borderRadius: theme.border_radius
                  }}
                >
                  {/* Decorative blur inside mockup */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                  
                  <span className="inline-block text-[7px] font-black uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-full mb-2">
                    #1 Marketplace
                  </span>
                  <h3 className="text-sm font-black leading-tight tracking-tight mb-1">
                    Book Selfcare in Seconds
                  </h3>
                  <p className="text-[8px] text-white/80 max-w-xs mx-auto mb-3">
                    Discover premium beauty parlours & spas near you instantly.
                  </p>

                  <div className="bg-white p-1 rounded-lg flex items-center gap-1 shadow-md max-w-xs mx-auto">
                    <div className="w-2.5 h-2.5 rounded bg-brand-gray-100 shrink-0" />
                    <span className="text-[7px] text-brand-gray-400 font-bold text-left flex-1">Search services...</span>
                    <div 
                      className="w-8 h-3.5 flex items-center justify-center text-[7px] font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.primary_color, borderRadius: `calc(${theme.border_radius} / 2)` }}
                    >
                      Search
                    </div>
                  </div>
                </div>

                {/* Service Categories mock */}
                <div className="mt-4">
                  <p className="text-[9px] font-black text-brand-gray-800 mb-2 uppercase tracking-wide">Popular Services</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Hair Styling", icon: "💇‍♀️" },
                      { name: "Organic Facial", icon: "✨" },
                      { name: "Nail Art", icon: "💅" }
                    ].map((s, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 border border-brand-gray-100 text-center flex flex-col items-center gap-1 transition-all ${
                          theme.glassmorphism_enabled ? "bg-white/40 backdrop-blur-sm" : "bg-white"
                        }`}
                        style={{ borderRadius: theme.border_radius }}
                      >
                        <span className="text-xs">{s.icon}</span>
                        <span className="text-[8px] font-bold text-brand-gray-800 line-clamp-1">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action card mockup */}
                <div 
                  className={`mt-4 p-3 border border-brand-gray-100 flex items-center justify-between transition-all ${
                    theme.glassmorphism_enabled ? "bg-white/40 backdrop-blur-sm shadow-sm" : "bg-white shadow-xs"
                  }`}
                  style={{ borderRadius: theme.border_radius }}
                >
                  <div>
                    <p className="text-[9px] font-black text-brand-gray-800">Ready to Glow Up?</p>
                    <p className="text-[7px] text-brand-gray-400">Claim ৳500 reward on registration.</p>
                  </div>
                  <div 
                    className="w-12 h-4 flex items-center justify-center text-[8px] font-black text-white shadow-md transition-all cursor-pointer"
                    style={{ backgroundColor: theme.primary_color, borderRadius: `calc(${theme.border_radius} / 1.5)` }}
                  >
                    Claim Reward
                  </div>
                </div>

              </div>

              {/* Footer mockup */}
              <div className="bg-brand-gray-900 p-4 text-center text-white/50 text-[6px] border-t border-brand-gray-800 mt-4">
                <p className="font-bold text-white/80 text-[7px] mb-1">© 2026 Parloora Ltd.</p>
                <p className="max-w-[180px] mx-auto text-brand-gray-400">Bangladesh's dynamic beauty & personal wellness booking marketplace.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
