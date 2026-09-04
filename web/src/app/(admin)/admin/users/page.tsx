"use client"

import * as React from "react"
import { Users, Search, Filter, Loader2, ShieldCheck, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "@/lib/actions/admin"
import {
  Dialog,
  DialogContent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminUsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminUsers()
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (u.phone || "").includes(searchTerm) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setEditData({ ...user })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedUser?.id) return
    setIsSaving(true)
    const res = await updateAdminUser(selectedUser.id, {
      display_name: editData.name,
      email: editData.email,
      phone: editData.phone,
      role: editData.role
    })
    if (res.success) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editData } : u))
      setSelectedUser({ ...selectedUser, ...editData })
      setIsEditing(false)
    } else {
      alert("Failed to save changes: " + res.error)
    }
    setIsSaving(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) return
    if (!confirm(`Are you sure you want to completely remove ${selectedUser.name}? This action cannot be undone.`)) return
    
    setIsSaving(true)
    const res = await deleteAdminUser(selectedUser.id)
    if (res.success) {
      setUsers(users.filter(u => u.id !== selectedUser.id))
      setIsModalOpen(false)
    } else {
      alert("Failed to delete user: " + res.error)
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
            <Users className="w-6 h-6 text-indigo-600" />
            User Management
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">View and manage registered platform users.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-indigo-500"
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
          <CardTitle className="text-base font-bold text-brand-gray-900">Registered Users</CardTitle>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Total: {users.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Users className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No users found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100">
                  {filteredUsers.map((user, i) => (
                    <tr key={user.id || i} className="hover:bg-brand-gray-50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 shadow-sm border border-indigo-50">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-gray-900">{user.name}</p>
                            <p className="text-[10px] text-brand-gray-400 font-mono mt-0.5 uppercase tracking-wider">{user.id.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-gray-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-brand-gray-400" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-brand-gray-500">
                            <Mail className="w-3.5 h-3.5 text-brand-gray-300" />
                            <span className="text-xs truncate max-w-[150px]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`
                          ${user.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            user.role === 'Seller' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                            'bg-blue-50 text-blue-700 border-blue-200'}
                          capitalize font-medium
                        `}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-brand-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-sm">{new Date(user.joined_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(user)}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold"
                        >
                          View Details
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
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 w-full" />
          <div className="px-6 pb-8 -mt-12 relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-3xl font-bold text-indigo-700">
                    {selectedUser?.name?.charAt(0).toUpperCase()}
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
                    <select 
                      value={editData?.role}
                      onChange={e => setEditData({...editData, role: e.target.value})}
                      className="w-full rounded-lg border border-brand-gray-200 h-9 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-2"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Seller">Seller</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <DialogTitle className="text-2xl font-bold text-brand-gray-900">{selectedUser?.name}</DialogTitle>
                    <p className="text-brand-gray-500 flex items-center gap-1.5 mt-1 text-sm font-medium">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      {selectedUser?.role} Account
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                    <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider mb-1">User ID</p>
                    <p className="text-[10px] font-mono text-brand-gray-600 truncate">{selectedUser?.id}</p>
                  </div>
                  <div className="p-3 bg-brand-gray-50 rounded-xl border border-brand-gray-100">
                    <p className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider mb-1">Member Since</p>
                    <p className="text-xs font-semibold text-brand-gray-900">
                      {selectedUser && new Date(selectedUser.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest px-1">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 hover:bg-brand-gray-50 rounded-xl transition-colors group border border-transparent hover:border-brand-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
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
                          <p className="text-sm font-semibold text-brand-gray-900">{selectedUser?.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 hover:bg-brand-gray-50 rounded-xl transition-colors group border border-transparent hover:border-brand-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-brand-gray-400 font-medium uppercase">Phone Number</p>
                        {isEditing ? (
                          <Input 
                            value={editData?.phone} 
                            onChange={e => setEditData({...editData, phone: e.target.value})} 
                            className="h-8 mt-1 text-sm px-2"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-brand-gray-900">{selectedUser?.phone}</p>
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
                        className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDeleteUser} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Delete User
                      </Button>
                      <Button className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsEditing(true)}>
                        Edit User
                      </Button>
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
