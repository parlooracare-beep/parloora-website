"use client"

import * as React from "react"
import { 
  LayoutTemplate, ArrowUp, ArrowDown, Eye, EyeOff, Loader2, Save, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  HelpCircle, Sparkles, RefreshCw, Layers
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { getHomepageSections, updateHomepageSections, PageSection } from "@/lib/actions/page-builder"
import { cn } from "@/lib/utils"

export default function AdminPageBuilder() {
  const [sections, setSections] = React.useState<PageSection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const loadSections = async () => {
    setLoading(true)
    const data = await getHomepageSections()
    setSections(data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadSections()
  }, [])

  const handleToggleVisibility = (id: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, visible: !section.visible } : section
      )
    )
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setSections(prev => {
      const newSections = [...prev]
      const temp = newSections[index]
      newSections[index] = newSections[index - 1]
      newSections[index - 1] = temp
      return newSections
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return
    setSections(prev => {
      const newSections = [...prev]
      const temp = newSections[index]
      newSections[index] = newSections[index + 1]
      newSections[index + 1] = temp
      return newSections
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateHomepageSections(sections)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert("Failed to save homepage layout configuration: " + res.error)
    }
    setIsSaving(false)
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset homepage layout to factory defaults?")) return
    const defaults: PageSection[] = [
      { id: "hero", name: "Hero Banner", visible: true },
      { id: "recommended", name: "Recommended Parlours", visible: true },
      { id: "near-you", name: "Near You Map Section", visible: true },
      { id: "categories", name: "Service Categories", visible: true },
      { id: "steps", name: "How It Works Steps", visible: true },
      { id: "shop", name: "Shop Highlights", visible: true },
      { id: "cta", name: "CTA Banner", visible: true }
    ]
    setSections(defaults)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-purple-600" />
            Homepage Builder
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Reorder homepage sections and manage their visibility dynamically.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            className="border-brand-gray-250 hover:bg-brand-gray-50 h-10 px-3 rounded-xl font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Reset Defaults
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-brand-gray-900 text-white hover:bg-brand-gray-800 h-10 rounded-xl px-4 font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving..." : "Save Layout"}</span>
          </Button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Homepage layout configuration successfully updated! These changes will reflect on the live site instantly.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-brand-gray-200 shadow-sm bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-brand-gray-900">Configure Sections Sequence</CardTitle>
              <CardDescription>Use Up/Down arrows to change the layout sequence. Use visibility switches to toggle section rendering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {sections.map((section, index) => (
                <div 
                  key={section.id} 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-2xl transition-all bg-white",
                    section.visible 
                      ? "border-brand-gray-250 hover:border-brand-gray-300" 
                      : "border-brand-gray-200 bg-brand-gray-50/50 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-gray-50 border border-brand-gray-150 flex items-center justify-center text-xs font-bold text-brand-gray-500 shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-gray-950 flex items-center gap-2">
                        {section.name}
                        {!section.visible && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 text-[9px] py-0 px-1.5 h-4 uppercase font-bold">
                            Hidden
                          </Badge>
                        )}
                      </p>
                      <p className="text-[10px] text-brand-gray-400 font-medium">section ID: {section.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-brand-gray-200 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        className="h-8 w-8 p-0 rounded-none hover:bg-brand-gray-50 text-brand-gray-600 disabled:opacity-30 border-r border-brand-gray-200"
                        onClick={() => handleMoveUp(index)}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === sections.length - 1}
                        className="h-8 w-8 p-0 rounded-none hover:bg-brand-gray-50 text-brand-gray-600 disabled:opacity-30"
                        onClick={() => handleMoveDown(index)}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Visibility toggle switch */}
                    <div className="flex items-center gap-1.5 bg-brand-gray-50 px-3 py-1.5 rounded-xl border border-brand-gray-200 shrink-0">
                      {section.visible ? (
                        <Eye className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-brand-gray-400" />
                      )}
                      <Switch 
                        checked={section.visible} 
                        onCheckedChange={() => handleToggleVisibility(section.id)}
                        className="scale-90"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar mockup/preview */}
        <div className="lg:col-span-1">
          <Card className="border-brand-gray-200 shadow-sm bg-white rounded-3xl sticky top-6">
            <CardHeader className="border-b border-brand-gray-100">
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" /> Homepage Blueprint
              </CardTitle>
              <CardDescription>Live layout sequence visualization.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="border border-brand-gray-200 rounded-3xl bg-brand-gray-50/50 p-4 space-y-2 relative overflow-hidden min-h-[300px]">
                {/* Header Mockup */}
                <div className="bg-white border border-brand-gray-150 p-2.5 rounded-xl flex items-center justify-between shadow-sm mb-4">
                  <div className="w-16 h-3 bg-brand-gray-200 rounded-full" />
                  <div className="flex gap-1.5">
                    <div className="w-6 h-2 bg-brand-gray-100 rounded-full" />
                    <div className="w-6 h-2 bg-brand-gray-100 rounded-full" />
                  </div>
                </div>

                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                {sections.map((section, idx) => {
                  if (!section.visible) return null
                  return (
                    <div 
                      key={section.id} 
                      className={cn(
                        "p-3 rounded-2xl flex flex-col justify-center text-center relative shadow-sm border border-brand-gray-200 transition-all font-black text-[10px] uppercase tracking-widest",
                        section.id === "hero" ? "bg-purple-950 text-white min-h-[50px] border-none" :
                        section.id === "recommended" ? "bg-amber-50 text-amber-800" :
                        section.id === "near-you" ? "bg-sky-50 text-sky-800" :
                        section.id === "categories" ? "bg-emerald-50 text-emerald-800" :
                        section.id === "steps" ? "bg-pink-50 text-pink-800" :
                        section.id === "shop" ? "bg-indigo-50 text-indigo-800" : "bg-rose-50 text-rose-800"
                      )}
                    >
                      <span>{section.name}</span>
                    </div>
                  )
                })}

                {/* Footer Mockup */}
                <div className="bg-brand-gray-800 p-3 rounded-2xl flex items-center justify-center text-[8px] font-bold text-white/50 mt-4 border-none">
                  Footer Settings
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
