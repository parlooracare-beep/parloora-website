"use client"

import * as React from "react"
import Image from "next/image"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Scissors, Search, Filter, Loader2, Store, Clock, Tag, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminServices, updateAdminService, createAdminService, deleteAdminEntity } from "@/lib/actions/admin"
import { cn, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Textarea } from "@/components/ui/textarea"

export default function AdminServicesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [services, setServices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedService, setSelectedService] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (service: any) => {
    setSelectedService(service)
    setEditData({ ...service })
    setIsEditing(false)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedService(null)
    setEditData({
      name: "",
      price: "",
      category: "Hair & Styling",
      duration: "30 mins",
      description: "",
      gender: "unisex",
      is_active: true
    })
    setIsEditing(true)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    if (isCreating) {
      const res = await createAdminService({
        name: editData.name,
        price: parseFloat(editData.price || 0),
        category: editData.category,
        duration: editData.duration,
        description: editData.description,
        gender: editData.gender,
        is_active: true
      })
      if (res.success && res.data) {
        setServices([res.data, ...services])
        setIsModalOpen(false)
      } else {
        alert("Failed to create service: " + (res.error || "Please run database SQL first."))
      }
    } else {
      if (!selectedService?.id) return
      const res = await updateAdminService(selectedService.id, {
        name: editData.name,
        price: parseFloat(editData.price || 0),
        category: editData.category,
        duration: editData.duration,
        description: editData.description
      })
      if (res.success) {
        setServices(services.map(s => s.id === selectedService.id ? { ...s, ...editData } : s))
        setSelectedService({ ...selectedService, ...editData })
        setIsEditing(false)
      } else {
        alert("Failed to save changes")
      }
    }
    setIsSaving(false)
  }

  const handleDeleteService = async () => {
    if (!selectedService?.id) return
    if (!confirm("Are you sure you want to delete this service from the platform?")) return
    setIsSaving(true)
    const res = await deleteAdminEntity("services", selectedService.id)
    if (res.success) {
      setServices(services.filter(s => s.id !== selectedService.id))
      setIsModalOpen(false)
    } else {
      alert("Failed to delete service: " + res.error)
    }
    setIsSaving(false)
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminServices()
      setServices(data)
      setLoading(false)
    }
    load()
  }, [])


  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.parlours?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-purple-600" />
            Service Management
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Review and manage all services offered across the platform.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search service, category..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white border-brand-gray-200 hover:bg-brand-gray-50 h-10 px-3 mr-2">
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filter</span>
          </Button>
          <Button variant="default" className="bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 flex items-center" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-base font-bold text-brand-gray-900">Platform Services</CardTitle>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
            Total Services: {services.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Scissors className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No services found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Service Info</th>
                    <th className="px-6 py-4">Parlour</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                   {filteredServices.map((service) => (
                    <tr 
                      key={service.id} 
                      className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                      onClick={() => handleViewDetails(service)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {service.image ? (
                              <Image src={service.image} alt={service.name} fill className="object-cover" />
                            ) : (
                              <Scissors className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-gray-900">{service.name}</p>
                            <div className="flex items-center gap-1 text-[10px] text-brand-gray-400 font-medium mt-0.5">
                              <Clock className="w-3 h-3" />
                              {service.duration || '30'} mins
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                          <Store className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-sm">{service.parlours?.name || 'Unknown Parlour'}</span>
                        </div>
                        <p className="text-[10px] text-brand-gray-400 ml-5">{service.parlours?.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-brand-gray-50 text-brand-gray-600 border-brand-gray-200 capitalize py-0 h-5">
                          {service.category || 'General'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-gray-900">
                          {formatCurrency(service.price)}
                        </div>
                        {service.discount_price && (
                          <p className="text-[10px] text-emerald-600 font-medium">Promo: {formatCurrency(service.discount_price)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Badge variant="outline" className={cn(
                            "uppercase text-[10px] font-bold border-0",
                            service.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          )}>
                            {service.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                            <Tag className="w-3 h-3 text-brand-gray-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-32 bg-purple-600 relative">
            {selectedService?.image && (
              <Image src={selectedService.image} alt="" fill className="object-cover opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Scissors className="w-12 h-12 text-white/50" />
            </div>
          </div>
          <div className="px-6 pb-8 -mt-10 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Service Name</Label>
                    <Input 
                      value={editData?.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Price</Label>
                      <Input 
                        type="number"
                        value={editData?.price} 
                        onChange={e => setEditData({...editData, price: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-brand-gray-400">Duration (mins)</Label>
                      <Input 
                        value={editData?.duration} 
                        onChange={e => setEditData({...editData, duration: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-brand-gray-400">Category</Label>
                    <Input 
                      value={editData?.category} 
                      onChange={e => setEditData({...editData, category: e.target.value})} 
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-xl font-bold text-brand-gray-900">{selectedService?.name}</DialogTitle>
                      <p className="text-sm text-brand-gray-500 mt-1 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        {selectedService?.parlours?.name}
                      </p>
                    </div>
                    <Badge className="bg-purple-600 text-white border-0">
                      {formatCurrency(selectedService?.price)}
                    </Badge>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-brand-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Category</p>
                      <p className="text-sm font-semibold text-brand-gray-700">{selectedService?.category || 'General'}</p>
                    </div>
                    <div className="p-3 bg-brand-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Duration</p>
                      <p className="text-sm font-semibold text-brand-gray-700">{selectedService?.duration || '30'} Minutes</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase mb-2">Description</p>
                    <p className="text-sm text-brand-gray-600 leading-relaxed">
                      {selectedService?.description || 'No description provided for this service.'}
                    </p>
                  </div>
                </>
              )}

                <div className="mt-8 pt-6 border-t border-brand-gray-100 flex gap-3">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                      </Button>
                      <Button variant="destructive" className="flex-1 rounded-xl bg-red-600 hover:bg-red-700" onClick={handleDeleteService} disabled={isSaving}>
                        Delete Service
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>
                        Close
                      </Button>
                      <Button className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700" onClick={() => setIsEditing(true)}>
                        Edit Service
                      </Button>
                    </>
                  )}
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
