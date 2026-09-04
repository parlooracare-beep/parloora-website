"use client"

import * as React from "react"
import Image from "next/image"
import { 
  Plus, Users, Edit, Trash2, Loader2, AlertCircle, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UserCheck, Shield, Check, X, Mail, Phone, Info
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getParlourByOwnerId } from "@/lib/actions/parlours"
import { getSellerServices } from "@/lib/actions/services"
import { 
  getStaffByParlour, 
  createStaff, 
  updateStaff, 
  deleteStaff 
} from "@/lib/actions/staff"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function SellerStaffPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staffList, setStaffList] = React.useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [services, setServices] = React.useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parlour, setParlour] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Modal / Drawer state
  const [isOpen, setIsOpen] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingStaff, setEditingStaff] = React.useState<any | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    title: "",
    bio: "",
    avatar_url: "",
    is_active: true,
    serviceIds: [] as string[]
  })

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const p = await getParlourByOwnerId(user.id)
      if (p) {
        setParlour(p)
        
        // Parallel load staff and services
        const [staffData, servicesData] = await Promise.all([
          getStaffByParlour(p.id),
          getSellerServices(p.id)
        ])
        
        setStaffList(staffData)
        setServices(servicesData)
      } else {
        setError("No parlour profile associated with this account. Please create a parlour profile first.")
      }
    } else {
      setError("Please log in to manage your staff.")
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const openAddModal = () => {
    setEditingStaff(null)
    setFormData({
      name: "",
      title: "",
      bio: "",
      avatar_url: "",
      is_active: true,
      serviceIds: []
    })
    setIsOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditModal = (staff: any) => {
    setEditingStaff(staff)
    setFormData({
      name: staff.name,
      title: staff.title,
      bio: staff.bio || "",
      avatar_url: staff.avatar_url || "",
      is_active: staff.is_active,
      serviceIds: staff.assignedServices || []
    })
    setIsOpen(true)
  }

  const handleToggleService = (serviceId: string) => {
    setFormData(prev => {
      const alreadySelected = prev.serviceIds.includes(serviceId)
      return {
        ...prev,
        serviceIds: alreadySelected
          ? prev.serviceIds.filter(id => id !== serviceId)
          : [...prev.serviceIds, serviceId]
      }
    })
  }

  const handleSelectAllServices = () => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.length === services.length 
        ? [] 
        : services.map(s => s.id)
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parlour) return

    if (!formData.name.trim()) {
      alert("Name is required")
      return
    }

    setIsSaving(true)
    try {
      if (editingStaff) {
        // Edit staff
        const res = await updateStaff(editingStaff.id, {
          name: formData.name,
          title: formData.title || "Specialist",
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          is_active: formData.is_active,
          serviceIds: formData.serviceIds
        })
        if (res.success) {
          await loadData()
          setIsOpen(false)
        } else {
          alert("Error: " + res.error)
        }
      } else {
        // Add staff
        const res = await createStaff({
          parlour_id: parlour.id,
          name: formData.name,
          title: formData.title || "Specialist",
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          is_active: formData.is_active,
          serviceIds: formData.serviceIds
        })
        if (res.success) {
          await loadData()
          setIsOpen(false)
        } else {
          alert("Error: " + res.error)
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("An unexpected error occurred: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member? All their scheduling references will be removed.")) return
    
    setLoading(true)
    const res = await deleteStaff(staffId)
    if (res.success) {
      setStaffList(prev => prev.filter(s => s.id !== staffId))
    } else {
      alert("Failed to delete staff member: " + res.error)
    }
    setLoading(false)
  }

  if (loading && staffList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Notice</h2>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900">Staff Members</h2>
          <p className="text-sm text-brand-gray-500 mt-1">Manage specialists, stylists, and therapists for your parlour.</p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Staff Member
        </Button>
      </div>

      {staffList.length === 0 ? (
        <Card className="border-dashed border-2 border-brand-gray-200 bg-brand-gray-50/50">
          <CardContent className="p-16 text-center">
            <Users className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-gray-900 mb-1">No staff members registered</h3>
            <p className="text-brand-gray-500 max-w-sm mx-auto mb-6">
              Register your stylists, wellness consultants, or therapists so customers can assign them during bookings.
            </p>
            <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Staff Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((member) => (
            <Card key={member.id} className="overflow-hidden border-brand-gray-100 hover:shadow-md transition-all group relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0 border border-brand-gray-100 overflow-hidden relative">
                    {member.avatar_url ? (
                      <Image src={member.avatar_url} alt={member.name} fill className="object-cover" />
                    ) : (
                      member.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  
                  {/* Profile info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-brand-gray-900 text-base line-clamp-1">{member.name}</h3>
                      <Badge className={cn("border-0 text-[10px] py-0.5", member.is_active ? "bg-emerald-500 text-white" : "bg-brand-gray-400 text-white")}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-primary mt-0.5">{member.title}</p>
                    <p className="text-xs text-brand-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {member.bio || "No professional biography added."}
                    </p>
                  </div>
                </div>

                {/* Assigned Services list */}
                <div className="mt-6 pt-4 border-t border-brand-gray-50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-brand-gray-400 font-bold uppercase tracking-wider">
                    <span>Assigned Services</span>
                    <span className="text-brand-gray-500 font-medium">({member.assignedServices?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    {member.assignedServices && member.assignedServices.length > 0 ? (
                      member.assignedServices.map((serviceId: string) => {
                        const service = services.find(s => s.id === serviceId)
                        if (!service) return null
                        return (
                          <Badge key={serviceId} variant="secondary" className="bg-brand-gray-100/70 text-brand-gray-700 border-0 text-[10px] font-medium">
                            {service.name}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-xs text-brand-gray-400 italic">No services assigned. Cannot be booked.</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-brand-gray-50">
                  <Button 
                    variant="outline" 
                    onClick={() => openEditModal(member)}
                    className="flex-1 rounded-xl border-brand-gray-200 hover:border-primary hover:text-primary transition-all text-xs h-9"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-brand-gray-400 hover:text-destructive hover:bg-destructive/5 w-9 h-9"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ ADD/EDIT STAFF MODAL ══════════ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-gray-900">
                  {editingStaff ? `Edit Specialist: ${editingStaff.name}` : "Add New Staff Specialist"}
                </h3>
                <p className="text-xs text-brand-gray-500 mt-1">Fill in details and link they services they perform.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 hover:bg-brand-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-brand-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Tasnim Rahman"
                    className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Professional Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Senior Hair Stylist, Therapist"
                    className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Professional Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share details about their expertise, certifications, and background..."
                  className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary min-h-[80px]"
                />
              </div>

              {/* Avatar URL & Active */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Avatar Photo URL</label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-3 bg-brand-gray-50 border border-brand-gray-100 rounded-xl h-[46px]">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider cursor-pointer">
                    Active Status
                  </label>
                </div>
              </div>

              {/* Service Assignment Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <label className="text-xs font-bold text-brand-gray-700 uppercase tracking-wider">Assign Service Specialties</label>
                  <button 
                    type="button" 
                    onClick={handleSelectAllServices} 
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {formData.serviceIds.length === services.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                {services.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>No services created yet. Please create a service first to assign it.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {services.map((service) => {
                      const isSelected = formData.serviceIds.includes(service.id)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleToggleService(service.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all",
                            isSelected 
                              ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                              : "border-brand-gray-100 bg-white text-brand-gray-600 hover:bg-brand-gray-50"
                          )}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-semibold">{service.name}</p>
                            <p className="text-[10px] text-brand-gray-400 font-normal truncate mt-0.5">{service.category}</p>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                            isSelected ? "bg-primary text-white" : "border border-brand-gray-200"
                          )}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t flex gap-3 justify-end bg-white">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-brand-gray-200 h-11 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 rounded-xl h-11 text-xs px-6 font-bold"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingStaff ? "Save Changes" : "Register Specialist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
