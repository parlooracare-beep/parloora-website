"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateService, deleteService } from "@/lib/actions/services"
import { createClient } from "@/lib/supabase/client"

const CATEGORIES = [
  "Hair & Styling",
  "Makeup & Beauty",
  "Skincare & Facials",
  "Nail Art",
  "Waxing & Threading",
  "Massage & Spa",
  "Bridal Package",
  "Other",
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  
  const [loading, setLoading] = React.useState(false)
  const [initLoading, setInitLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  // Form state
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState(CATEGORIES[0])
  const [customCategory, setCustomCategory] = React.useState("")
  const [duration, setDuration] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [imageUrl, setImageUrl] = React.useState("")

  React.useEffect(() => {
    async function loadService() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError("You must be logged in.")
          setInitLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", serviceId)
          .single()

        if (error || !data) {
          setError("Service not found.")
        } else {
          setName(data.name)
          if (CATEGORIES.includes(data.category || "")) {
            setCategory(data.category || CATEGORIES[0])
          } else {
            setCategory("Other")
            setCustomCategory(data.category || "")
          }
          setDuration(data.duration || "")
          setPrice(data.price.toString())
          setDescription(data.description || "")
          setIsActive(data.is_active !== false)
          setImageUrl(data.image || "")
        }
      } catch (err) {
        console.error("Error loading service:", err)
        setError("Failed to load service details.")
      } finally {
        setInitLoading(false)
      }
    }
    loadService()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const finalCategory = category === "Other" ? customCategory.trim() : category
    const priceNum = parseFloat(price)

    if (!name.trim()) {
      setError("Service name is required.")
      setLoading(false)
      return
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.")
      setLoading(false)
      return
    }

    const res = await updateService(serviceId, {
      name: name.trim(),
      category: finalCategory,
      duration: duration.trim() || null,
      price: priceNum,
      description: description.trim() || null,
      is_active: isActive,
      image: imageUrl.trim() || null,
    })

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(res.error || "Failed to update service.")
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service?")) return
    setLoading(true)
    const res = await deleteService(serviceId)
    if (res.success) {
      router.push("/seller/services")
    } else {
      setError("Failed to delete service.")
      setLoading(false)
    }
  }

  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error === "Service not found.") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-gray-300 mx-auto" />
        <h2 className="text-2xl font-bold text-brand-gray-900">Service Not Found</h2>
        <p className="text-brand-gray-500 text-lg">The service you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Link href="/seller/services">
          <Button variant="outline" className="rounded-xl mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/seller/services"
          className="flex items-center gap-2 text-sm text-brand-gray-500 hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-brand-gray-400 hover:text-destructive hover:bg-destructive/5 font-bold"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Service
        </Button>
      </div>

      <Card className="border-brand-gray-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-brand-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-brand-gray-900">Edit Service</CardTitle>
            <p className="text-sm text-brand-gray-500">Update your service details and pricing.</p>
          </div>
          {success && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">
                  Service Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Classic Haircut"
                  className="rounded-xl border-brand-gray-200 h-11"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        category === cat
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-primary/50"
                      }`}
                      disabled={loading}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {category === "Other" && (
                  <Input
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="rounded-xl border-brand-gray-200 mt-3 h-11"
                    disabled={loading}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">
                    Price (৳) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="500"
                    className="rounded-xl border-brand-gray-200 h-11"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">Duration</Label>
                  <Input
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 30 mins"
                    className="rounded-xl border-brand-gray-200 h-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="rounded-xl border-brand-gray-200 h-11"
                  disabled={loading}
                />
                <p className="text-[10px] text-brand-gray-400 mt-1.5 ml-1">Paste a URL for the service photo.</p>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-gray-600 uppercase tracking-wider mb-1.5 block">Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Service description..."
                  className="rounded-xl border-brand-gray-200 resize-none min-h-[100px]"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                <div>
                  <p className="text-sm font-bold text-brand-gray-800">Active Listing</p>
                  <p className="text-xs text-brand-gray-500">Visible to customers</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold text-base shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
