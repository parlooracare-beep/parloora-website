"use client"

import * as React from "react"
import Image from "next/image"
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Store, Search, Filter, Loader2, MapPin, CheckCircle2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle, AlertCircle, Phone, Mail, User, Info, Calendar, Globe, Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminParlours, updateParlourStatus, updateAdminParlour } from "@/lib/actions/admin"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminParloursPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parlours, setParlours] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedParlour, setSelectedParlour] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (parlour: any) => {
    setSelectedParlour(parlour)
    setEditData({ ...parlour })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedParlour?.id) return
    setIsSaving(true)
    const res = await updateAdminParlour(selectedParlour.id, {
      name: editData.name,
      address: editData.address,
      city: editData.city,
      type: editData.type
    })
    if (res.success) {
      setParlours(parlours.map(p => p.id === selectedParlour.id ? { ...p, ...editData } : p))
      setSelectedParlour({ ...selectedParlour, ...editData })
      setIsEditing(false)
    } else {
      alert("Failed to save changes")
    }
    setIsSaving(false)
  }

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminParlours()
      setParlours(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    const res = await updateParlourStatus(id, newStatus)
    if (res.success) {
      setParlours(parlours.map(p => p.id === id ? { ...p, status: newStatus } : p))
    } else {
      alert("Failed to update status")
    }
    setUpdatingId(null)
  }

  const filteredParlours = parlours.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Store className="w-6 h-6 text-amber-500" />
            Parlour Moderation
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Review and approve new parlour registrations.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search parlours..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="bg-white border-brand-gray-200 hover:bg-brand-gray-50 h-10 px-3">
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filter</span>
          </Button>
        </div>
      </div>

      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
          <CardTitle className="text-base font-bold text-brand-gray-900">All Parlours</CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-brand-gray-100 text-brand-gray-700 border-brand-gray-200 hover:bg-brand-gray-200">
              Total: {parlours.length}
            </Badge>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
              Pending: {parlours.filter(p => p.status?.toLowerCase() === 'pending').length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredParlours.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Store className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No parlours found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Parlour Info</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Stats</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                  {filteredParlours.map((parlour) => (
                    <tr key={parlour.id} className="hover:bg-brand-gray-50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-gray-100 border border-brand-gray-200 overflow-hidden shrink-0 relative">
                            {parlour.image ? (
                              <Image src={parlour.image} alt={parlour.name} fill className="object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-brand-gray-400 m-2.5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-gray-900">{parlour.name}</p>
                            <Badge variant="outline" className={cn(
                              "uppercase text-[9px] font-bold border-0 mt-1",
                              parlour.status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              parlour.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {parlour.status || 'unknown'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-brand-gray-400" />
                            <span className="text-xs truncate max-w-[150px]">{parlour.owner_email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-brand-gray-500">
                            <Phone className="w-3.5 h-3.5 text-brand-gray-300" />
                            <span className="text-[10px]">{parlour.owner_phone || parlour.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-600">
                          <MapPin className="w-4 h-4 text-brand-gray-400 shrink-0" />
                          <span className="text-sm truncate max-w-[120px]">
                            {parlour.city}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-brand-gray-500">
                          <p><span className="font-semibold text-brand-gray-700">{parlour.total_bookings || 0}</span> Bookings</p>
                          <p className="mt-0.5">Rating: <span className="font-semibold text-amber-600">{parlour.rating || 'N/A'}</span></p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(parlour)}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold"
                          >
                            <Info className="w-3.5 h-3.5 mr-1" />
                            Details
                          </Button>
                          
                          {parlour.status?.toLowerCase() === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs px-3"
                              disabled={updatingId === parlour.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(parlour.id, 'Active')
                              }}
                            >
                              {updatingId === parlour.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
                            </Button>
                          )}
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

      {/* Parlour Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-32 relative bg-brand-gray-900 overflow-hidden">
             {selectedParlour?.image ? (
               <Image src={selectedParlour.image} alt={selectedParlour.name} fill className="object-cover opacity-60" />
             ) : (
               <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80" />
             )}
             <div className="absolute inset-0 flex items-center justify-center">
               <Store className="w-12 h-12 text-white/50" />
             </div>
          </div>
          
          <div className="px-6 pb-8 -mt-16 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-2xl mb-4 overflow-hidden border-4 border-white relative">
                {selectedParlour?.image ? (
                  <Image src={selectedParlour.image} alt={selectedParlour.name} fill className="object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-700">
                    {selectedParlour?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                {isEditing ? (
                  <div className="w-full space-y-2 mt-4 px-4">
                    <Input 
                      value={editData?.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      className="text-center font-bold text-xl"
                    />
                    <select
                      value={editData?.type}
                      onChange={e => setEditData({...editData, type: e.target.value})}
                      className="w-full rounded-lg border border-brand-gray-200 h-9 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-2"
                    >
                      <option value="Man">Man</option>
                      <option value="Woman">Woman</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-2xl font-bold text-brand-gray-900">{selectedParlour?.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                        {selectedParlour?.type}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "uppercase text-[10px] font-bold border-0",
                        selectedParlour?.status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        selectedParlour?.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {selectedParlour?.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" /> Owner Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-brand-gray-900">{selectedParlour?.owner_name || 'Owner Name'}</p>
                    <div className="flex items-center gap-2 text-brand-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-xs">{selectedParlour?.owner_email}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location
                  </h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input 
                        value={editData?.address} 
                        onChange={e => setEditData({...editData, address: e.target.value})} 
                        placeholder="Street Address"
                      />
                      <Input 
                        value={editData?.city} 
                        onChange={e => setEditData({...editData, city: e.target.value})} 
                        placeholder="City"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-brand-gray-700 leading-relaxed">
                      {selectedParlour?.address || 'Address not provided'}
                      <br />
                      <span className="font-bold">{selectedParlour?.city}</span>
                    </p>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-3 h-3" /> Business Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Bookings</p>
                      <p className="text-lg font-bold text-brand-gray-900">{selectedParlour?.total_bookings || 0}</p>
                    </div>
                    <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                      <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Rating</p>
                      <p className="text-lg font-bold text-amber-600">{selectedParlour?.rating || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Availability
                  </h4>
                  <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs text-indigo-700 font-medium">Verified Registration</span>
                  </div>
                  {selectedParlour?.website && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600 hover:underline">
                      <Globe className="w-3.5 h-3.5" />
                      <a href={selectedParlour.website} target="_blank" className="text-xs">Visit Website</a>
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-gray-100 flex gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  {selectedParlour?.status?.toLowerCase() === 'pending' ? (
                    <Button 
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        handleUpdateStatus(selectedParlour.id, 'Active');
                        setIsModalOpen(false);
                      }}
                    >
                      Approve Parlour
                    </Button>
                  ) : selectedParlour?.status?.toLowerCase() === 'active' ? (
                    <Button 
                      variant="destructive" 
                      className="flex-1 rounded-xl"
                      onClick={() => {
                        handleUpdateStatus(selectedParlour.id, 'Suspended');
                        setIsModalOpen(false);
                      }}
                    >
                      Suspend Account
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => {
                        handleUpdateStatus(selectedParlour.id, 'Active');
                        setIsModalOpen(false);
                      }}
                    >
                      Unsuspend
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
