"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createService } from "@/lib/actions/services"
import { getParlourByOwnerId } from "@/lib/actions/parlours"
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

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [parlourId, setParlourId] = React.useState<string | null>(null)
  const [initLoading, setInitLoading] = React.useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const p = await getParlourByOwnerId(user.id)
        if (p) {
          setParlourId(p.id)
        } else {
          setError("No parlour profile found. Please complete your parlour setup first.")
        }
      } else {
        setError("You must be logged in as a seller.")
      }
      setInitLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parlourId) return
    setLoading(true)
    setError(null)

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

    const res = await createService({
      parlour_id: parlourId,
      name: name.trim(),
      category: finalCategory,
      duration: duration.trim() || null,
      price: priceNum,
      description: description.trim() || null,
      is_active: isActive,
      image: imageUrl.trim() || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => router.push("/seller/services"), 1200)
    } else {
      setError(res.error || "Failed to create service. Please try again.")
    }
    setLoading(false)
  }

  if (initLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/seller/services"
        className="flex items-center gap-2 text-sm text-brand-gray-500 hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      <Card className="border-brand-gray-100 shadow-sm">
        <CardHeader className="pb-4 border-b border-brand-gray-50">
          <CardTitle className="text-xl font-bold text-brand-gray-900">Add New Service</CardTitle>
          <p className="text-sm text-brand-gray-500">Fill in the details below to list a new service for your parlour.</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Name */}
            <div>
              <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Classic Haircut, Bridal Makeup"
                className="rounded-xl border-brand-gray-200"
                required
                disabled={loading || success}
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      category === cat
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-brand-gray-600 border-brand-gray-200 hover:border-primary/50"
                    }`}
                    disabled={loading || success}
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
                  className="rounded-xl border-brand-gray-200 mt-3"
                  disabled={loading || success}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">
                  Price (৳) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="500"
                  className="rounded-xl border-brand-gray-200"
                  required
                  disabled={loading || success}
                />
              </div>
              {/* Duration */}
              <div>
                <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">Duration</Label>
                <Input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 30 mins, 1 hr"
                  className="rounded-xl border-brand-gray-200"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">Image URL</Label>
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="rounded-xl border-brand-gray-200"
                disabled={loading || success}
              />
              <p className="text-[10px] text-brand-gray-400 mt-1 ml-1">Optional: Link to a photo of this service.</p>
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-semibold text-brand-gray-600 mb-1.5 block">Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what's included in this service, techniques used, etc."
                className="rounded-xl border-brand-gray-200 resize-none min-h-[90px]"
                disabled={loading || success}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-brand-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-brand-gray-800">Active Listing</p>
                <p className="text-xs text-brand-gray-500">Customers can see and book this service</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={loading || success}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || success || !parlourId}
              className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11 font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? "Creating Service..." : "Create Service"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
