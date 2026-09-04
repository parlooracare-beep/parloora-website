"use client"

import * as React from "react"
import { Users, Search, Filter, Loader2, Mail, Phone, Calendar, Store, ArrowRight, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "@/lib/actions/admin"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminSellersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sellers, setSellers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminUsers()
      // Filter for sellers only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sellersOnly = data.filter((u: any) => u.role === "Seller")
      setSellers(sellersOnly)
      setLoading(false)
    }
    load()
  }, [])

  const filteredSellers = sellers.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (u.phone || "").includes(searchTerm) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSeller, setSelectedSeller] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (seller: any) => {
    setSelectedSeller(seller)
    setEditData({ ...seller })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedSeller?.id) return
    setIsSaving(true)
    const res = await updateAdminUser(selectedSeller.id, {
      display_name: editData.name, // The UI uses .name but DB uses .display_name
      email: editData.email,
      phone: editData.phone
    })
    if (res.success) {
      setSellers(sellers.map(s => s.id === selectedSeller.id ? { ...s, ...editData } : s))
      setSelectedSeller({ ...selectedSeller, ...editData })
      setIsEditing(false)
    } else {
      alert("Failed to save changes: " + res.error)
    }
    setIsSaving(false)
  }

  const handleDeleteSeller = async () => {
    if (!selectedSeller?.id) return
    if (!confirm(`Are you sure you want to completely remove seller ${selectedSeller.name}? This action cannot be undone.`)) return
    
    setIsSaving(true)
    const res = await deleteAdminUser(selectedSeller.id)
    if (res.success) {
      setSellers(sellers.filter(s => s.id !== selectedSeller.id))
      setIsModalOpen(false)
    } else {
      alert("Failed to delete seller: " + res.error)
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-600" />
            Seller Management
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Manage platform partners and their business accounts.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search sellers..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-purple-500"
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
          <CardTitle className="text-base font-bold text-brand-gray-900">Active & Pending Sellers</CardTitle>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
            Total Partners: {sellers.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredSellers.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Users className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No sellers found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Join Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100">
                  {filteredSellers.map((seller, i) => (
                    <tr key={seller.id || i} className="hover:bg-brand-gray-50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-bold shrink-0 shadow-sm border border-purple-50">
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-gray-900">{seller.name}</p>
                            <p className="text-[10px] text-brand-gray-400 font-mono mt-0.5 uppercase tracking-wider">{seller.id.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-brand-gray-400" />
                            <span className="text-sm">{seller.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-brand-gray-500">
                            <Mail className="w-3.5 h-3.5 text-brand-gray-300" />
                            <span className="text-xs truncate max-w-[150px]">{seller.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-sm">{new Date(seller.joined_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link href="/admin/parlours">
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 font-semibold gap-1">
                            Business Info <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(seller)}
                          className="text-brand-gray-500 hover:text-brand-gray-900 hover:bg-brand-gray-50 font-semibold"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 w-full" />
          <div className="px-6 pb-8 -mt-12 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-3xl font-bold text-purple-700">
                    {selectedSeller?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                {isEditing ? (
                  <div className="w-full space-y-2 mt-2">
                    <Input 
                      value={editData?.name} 
                      onChange={e => setEditData({...editData, name: e.target.value})} 
                      className="text-center font-bold text-xl h-10"
                      placeholder="Full Name"
                    />
                    <p className="text-brand-gray-500 text-center text-[10px] flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      Verified Seller Partner
                    </p>
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-2xl font-bold text-brand-gray-900">{selectedSeller?.name}</DialogTitle>
                    <p className="text-brand-gray-500 flex items-center gap-1.5 mt-1 text-sm">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      Verified Seller Partner
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                    <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider mb-1">Partner ID</p>
                    <p className="text-[10px] font-mono text-brand-gray-600 truncate">{selectedSeller?.id}</p>
                  </div>
                  <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                    <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider mb-1">Since</p>
                    <p className="text-xs font-semibold text-brand-gray-900">
                      {selectedSeller && new Date(selectedSeller.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest px-1">Contact Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 hover:bg-brand-gray-50 rounded-xl transition-colors group border border-transparent hover:border-brand-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-brand-gray-400 font-medium uppercase">Email Address</p>
                        {isEditing ? (
                          <Input 
                            value={editData?.email} 
                            onChange={e => setEditData({...editData, email: e.target.value})} 
                            className="h-8 mt-1 text-sm px-2"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-brand-gray-900">{selectedSeller?.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 hover:bg-brand-gray-50 rounded-xl transition-colors group border border-transparent hover:border-brand-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-brand-gray-400 font-medium uppercase">Direct Phone</p>
                        {isEditing ? (
                          <Input 
                            value={editData?.phone} 
                            onChange={e => setEditData({...editData, phone: e.target.value})} 
                            className="h-8 mt-1 text-sm px-2"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-brand-gray-900">{selectedSeller?.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
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
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDeleteSeller} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Delete
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditing(true)}>
                        Edit Info
                      </Button>
                      <Link href="/admin/parlours" className="flex-1">
                        <Button className="w-full rounded-xl bg-purple-600 hover:bg-purple-700">
                          Parlours
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
