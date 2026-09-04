"use client"

import * as React from "react"
import { 
  Ticket, Plus, Search, Edit2, Trash2, Calendar, CheckCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle, ArrowRight, Loader2, AlertCircle, ShoppingBag, Scissors, Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  getAdminPromoCodes, createPromoCode, updatePromoCode, deletePromoCode 
} from "@/lib/actions/promo"

type PromoCode = {
  id: string
  code: string
  discount_type: "percentage" | "flat"
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  current_uses: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  applies_to: "all" | "products" | "bookings"
  created_at: string
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = React.useState<PromoCode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  
  // Modal states
  const [showModal, setShowModal] = React.useState(false)
  const [editId, setEditId] = React.useState<string | null>(null)
  
  // Form states
  const [formCode, setFormCode] = React.useState("")
  const [formType, setFormType] = React.useState<"percentage" | "flat">("percentage")
  const [formValue, setFormValue] = React.useState(0)
  const [formMinOrder, setFormMinOrder] = React.useState(0)
  const [formMaxUses, setFormMaxUses] = React.useState("")
  const [formValidFrom, setFormValidFrom] = React.useState("")
  const [formValidUntil, setFormValidUntil] = React.useState("")
  const [formActive, setFormActive] = React.useState(true)
  const [formAppliesTo, setFormAppliesTo] = React.useState<"all" | "products" | "bookings">("all")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminPromoCodes()
      setCodes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreate = () => {
    setEditId(null)
    setFormCode("")
    setFormType("percentage")
    setFormValue(0)
    setFormMinOrder(0)
    setFormMaxUses("")
    
    // Set default valid_from to current datetime local
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    setFormValidFrom(localISOTime)
    setFormValidUntil("")
    setFormActive(true)
    setFormAppliesTo("all")
    setErrorMessage(null)
    setShowModal(true)
  }

  const handleOpenEdit = (promo: PromoCode) => {
    setEditId(promo.id)
    setFormCode(promo.code)
    setFormType(promo.discount_type)
    setFormValue(Number(promo.discount_value))
    setFormMinOrder(Number(promo.min_order_amount))
    setFormMaxUses(promo.max_uses !== null ? promo.max_uses.toString() : "")
    
    // Format dates for input datetime-local
    const formatLocalDate = (isoString: string) => {
      const d = new Date(isoString)
      const tzoffset = d.getTimezoneOffset() * 60000
      return (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16)
    }
    
    setFormValidFrom(formatLocalDate(promo.valid_from))
    setFormValidUntil(promo.valid_until ? formatLocalDate(promo.valid_until) : "")
    setFormActive(promo.is_active)
    setFormAppliesTo(promo.applies_to)
    setErrorMessage(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCode.trim()) {
      setErrorMessage("Promo code string is required")
      return
    }
    if (formValue <= 0) {
      setErrorMessage("Discount value must be greater than zero")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const payload = {
      code: formCode,
      discount_type: formType,
      discount_value: formValue,
      min_order_amount: formMinOrder,
      max_uses: formMaxUses ? parseInt(formMaxUses, 10) : null,
      valid_from: new Date(formValidFrom).toISOString(),
      valid_until: formValidUntil ? new Date(formValidUntil).toISOString() : null,
      is_active: formActive,
      applies_to: formAppliesTo
    }

    try {
      let res
      if (editId) {
        res = await updatePromoCode(editId, payload)
      } else {
        res = await createPromoCode(payload)
      }

      if (res.success) {
        setShowModal(false)
        loadData()
      } else {
        setErrorMessage(res.error || "An error occurred")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code? This cannot be undone.")) return

    try {
      const res = await deletePromoCode(id)
      if (res.success) {
        loadData()
      } else {
        alert(res.error || "Failed to delete")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to delete")
    }
  }

  const handleToggleStatus = async (promo: PromoCode) => {
    try {
      const res = await updatePromoCode(promo.id, { is_active: !promo.is_active })
      if (res.success) {
        loadData()
      } else {
        alert(res.error || "Failed to toggle status")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (promo: PromoCode) => {
    if (!promo.valid_until) return false
    return new Date(promo.valid_until) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Promo & Discount Codes
          </h1>
          <p className="text-sm text-brand-gray-500">Create, manage, and monitor coupon codes for checkout and bookings.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-primary/10"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-gray-900">{codes.length}</p>
              <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-wide">Total Promo Codes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-gray-900">{codes.filter(c => c.is_active && !isExpired(c)).length}</p>
              <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-wide">Active Codes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-gray-900">{codes.filter(isExpired).length}</p>
              <p className="text-xs text-brand-gray-400 font-bold uppercase tracking-wide">Expired Codes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="bg-brand-gray-50/50 border-b p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold text-brand-gray-900">All Coupons</CardTitle>
              <CardDescription className="text-xs">Database search list of generated promo codes.</CardDescription>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
              <Input
                placeholder="Search by code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-brand-gray-200 rounded-xl bg-white text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-brand-gray-400">Loading coupons database...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-20">
              <Ticket className="w-12 h-12 text-brand-gray-300 mx-auto mb-3" />
              <p className="font-bold text-brand-gray-700">No promo codes found</p>
              <p className="text-xs text-brand-gray-400">Create a code to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-brand-gray-100 bg-brand-gray-50/30 text-[10px] font-bold uppercase tracking-wider text-brand-gray-400">
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-3">Discount</th>
                  <th className="py-4 px-3">Scope</th>
                  <th className="py-4 px-3">Min Order</th>
                  <th className="py-4 px-3">Usage</th>
                  <th className="py-4 px-3">Valid Dates</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-50">
                {filteredCodes.map((promo) => {
                  const expired = isExpired(promo)
                  const ScopeIcon = promo.applies_to === "products" ? ShoppingBag : promo.applies_to === "bookings" ? Scissors : Globe
                  const scopeLabel = promo.applies_to === "all" ? "All Shop & Bookings" : promo.applies_to === "products" ? "Products Shop" : "Service Bookings"

                  return (
                    <tr key={promo.id} className="hover:bg-brand-gray-50/50 text-sm text-brand-gray-600 transition-colors">
                      <td className="py-4 px-6 font-bold text-brand-gray-900 tracking-wider font-mono">
                        {promo.code}
                      </td>
                      <td className="py-4 px-3 font-semibold">
                        {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `৳${promo.discount_value}`}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-brand-gray-500 font-medium">
                          <ScopeIcon className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span>{scopeLabel}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-medium">
                        ৳{promo.min_order_amount}
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-semibold text-brand-gray-800">{promo.current_uses}</span>
                        <span className="text-brand-gray-400 text-xs"> / {promo.max_uses ?? "∞"}</span>
                      </td>
                      <td className="py-4 px-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="text-brand-gray-500">From: {new Date(promo.valid_from).toLocaleDateString()}</p>
                          <p className="text-brand-gray-400">
                            Until: {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : "Always active"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {expired ? (
                          <Badge className="bg-red-50 text-red-700 border-0 text-[10px] px-2 py-0.5">Expired</Badge>
                        ) : promo.is_active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] px-2 py-0.5">Active</Badge>
                        ) : (
                          <Badge className="bg-brand-gray-100 text-brand-gray-500 border-0 text-[10px] px-2 py-0.5">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(promo)}
                            title={promo.is_active ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              promo.is_active 
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200" 
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
                            }`}
                          >
                            {promo.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(promo)}
                            className="p-1.5 bg-brand-gray-50 hover:bg-brand-gray-100 border border-brand-gray-200 text-brand-gray-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand-gray-50/50 border-b p-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-brand-gray-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  {editId ? "Edit Promo Code" : "Create Promo Code"}
                </h3>
                <p className="text-xs text-brand-gray-400">Specify details for the discount coupon code.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-brand-gray-400 hover:text-brand-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Promo Code</label>
                  <Input
                    placeholder="E.g. SAVE20"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    className="rounded-xl font-mono tracking-wider h-11 border-brand-gray-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "percentage" | "flat")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-3 border border-brand-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Discount Value</label>
                  <Input
                    type="number"
                    value={formValue || ""}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="rounded-xl h-11 border-brand-gray-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Min Order Amount (৳)</label>
                  <Input
                    type="number"
                    value={formMinOrder || ""}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="rounded-xl h-11 border-brand-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Scope of Applicability</label>
                  <select
                    value={formAppliesTo}
                    onChange={(e) => setFormAppliesTo(e.target.value as "all" | "products" | "bookings")}
                    disabled={isSubmitting}
                    className="w-full h-11 px-3 border border-brand-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="all">All Shop & Bookings</option>
                    <option value="products">Products Only</option>
                    <option value="bookings">Service Bookings Only</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Max Uses Limit</label>
                  <Input
                    placeholder="Unlimited"
                    type="number"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-xl h-11 border-brand-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Valid From Date</label>
                  <Input
                    type="datetime-local"
                    value={formValidFrom}
                    onChange={(e) => setFormValidFrom(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-xl h-11 border-brand-gray-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide">Valid Until Date</label>
                  <Input
                    type="datetime-local"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    disabled={isSubmitting}
                    className="rounded-xl h-11 border-brand-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="activeToggle" className="text-xs font-bold text-brand-gray-700 select-none cursor-pointer">
                  Activate promo code immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl h-11 border-brand-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/95 text-white rounded-xl font-bold h-11 flex items-center justify-center gap-1.5 px-6 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Coupon"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
