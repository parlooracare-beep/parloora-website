"use client"

import * as React from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Wallet, CheckCircle2, XCircle, Clock, Search, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter, Loader2, AlertCircle, Eye, CornerDownRight 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getAdminPayoutRequests, updatePayoutStatus } from "@/lib/actions/payouts"
import { cn, formatCurrency } from "@/lib/utils"

export default function AdminPayoutsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"all" | "pending" | "approved" | "rejected">("all")

  // Action states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeRequest, setActiveRequest] = React.useState<any | null>(null)
  const [actionType, setActionType] = React.useState<"approve" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = React.useState("")
  const [updating, setUpdating] = React.useState(false)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await getAdminPayoutRequests()
      setRequests(data || [])
    } catch (err) {
      console.error("Failed to load payout requests:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadRequests()
  }, [])

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest || !actionType) return

    setUpdating(true)
    try {
      const targetStatus = actionType === "approve" ? "approved" : "rejected"
      const res = await updatePayoutStatus(activeRequest.id, targetStatus, adminNotes)
      
      if (res.success) {
        setActiveRequest(null)
        setActionType(null)
        setAdminNotes("")
        await loadRequests()
      } else {
        alert("Action failed: " + res.error)
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred.")
    } finally {
      setUpdating(false)
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.parlourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.sellerEmail && r.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      
    const matchesFilter = filterStatus === "all" || r.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Payout & Withdrawal Requests
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Review, approve or reject seller balance withdrawals and cash transfers.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter tabs */}
          <div className="flex bg-brand-gray-100 p-1 rounded-xl text-xs font-semibold mr-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg capitalize transition-all",
                  filterStatus === s 
                    ? "bg-white text-brand-gray-900 shadow-sm" 
                    : "text-brand-gray-500 hover:text-brand-gray-800"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search seller, parlour..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Request Board Table */}
      <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-0 bg-white">
          {filteredRequests.length === 0 ? (
            <div className="p-16 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Wallet className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p className="font-semibold text-sm">No withdrawal requests found.</p>
              <p className="text-xs mt-1">When sellers request payouts, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold border-b border-brand-gray-100">
                  <tr>
                    <th className="px-6 py-4">Seller Details</th>
                    <th className="px-6 py-4">Parlour</th>
                    <th className="px-6 py-4">Method & Info</th>
                    <th className="px-6 py-4">Request Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-brand-gray-50/50 transition-colors bg-white">
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-gray-900">{req.sellerName}</p>
                        <p className="text-xs text-brand-gray-400 font-medium">{req.sellerEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-brand-gray-700">
                        {req.parlourName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-xs uppercase bg-brand-gray-100 px-2 py-0.5 rounded text-brand-gray-600">
                          {req.paymentMethod === "bkash" ? "bKash" : "Bank Transfer"}
                        </span>
                        <div className="text-xs text-brand-gray-500 mt-1.5 font-mono max-w-[220px] truncate">
                          {req.paymentMethod === "bkash" ? (
                            <span>A/C: {req.paymentDetails?.bkashNumber}</span>
                          ) : (
                            <div>
                              <p className="truncate font-semibold">{req.paymentDetails?.bankName}</p>
                              <p className="truncate">A/C: {req.paymentDetails?.accountNumber}</p>
                              <p className="text-[10px] opacity-75">Holder: {req.paymentDetails?.accountName}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-brand-gray-400 font-semibold">
                        {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-black text-brand-gray-950 text-base">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn(
                          "border-0 text-[10px] uppercase font-black px-2.5 py-1",
                          req.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                          req.status === "rejected" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        )}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveRequest(req)
                                setActionType("approve")
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 h-8 text-xs font-bold"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveRequest(req)
                                setActionType("reject")
                              }}
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-3 h-8 text-xs font-bold"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-brand-gray-400 font-medium italic max-w-[150px] truncate ml-auto">
                            {req.notes ? `"${req.notes}"` : "Processed"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Decision Modal */}
      {activeRequest && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-brand-gray-950 text-white p-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                {actionType === "approve" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="capitalize">{actionType} Payout Request</span>
              </CardTitle>
              <CardDescription className="text-white/60 text-xs">
                Confirming payout of {formatCurrency(activeRequest.amount)} to {activeRequest.sellerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleActionSubmit} className="space-y-6">
                <div className="space-y-3 p-4 bg-brand-gray-50 border rounded-2xl text-xs text-brand-gray-600">
                  <div className="flex justify-between">
                    <span className="font-bold">Parlour:</span>
                    <span className="font-semibold text-brand-gray-900">{activeRequest.parlourName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Method:</span>
                    <span className="font-semibold text-brand-gray-950 uppercase">{activeRequest.paymentMethod}</span>
                  </div>
                  <div className="border-t border-brand-gray-200/60 pt-2">
                    <span className="font-bold">Payout details:</span>
                    <p className="mt-1 font-mono text-[10px] break-all bg-white p-2 border rounded-lg">
                      {activeRequest.paymentMethod === "bkash" ? (
                        `bKash Mobile: ${activeRequest.paymentDetails?.bkashNumber}`
                      ) : (
                        `Bank: ${activeRequest.paymentDetails?.bankName}\nAccount Name: ${activeRequest.paymentDetails?.accountName}\nAccount No: ${activeRequest.paymentDetails?.accountNumber}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Transaction Notes / Reference</Label>
                  <textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={actionType === "approve" ? "e.g. Sent via bKash TrxID: DX912..." : "e.g. Account number is invalid."}
                    className="w-full rounded-xl border-brand-gray-200 text-sm p-3 focus:ring-primary focus:border-primary min-h-[80px]"
                    required={actionType === "reject"} // Notes are mandatory for rejection
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updating}
                    onClick={() => {
                      setActiveRequest(null)
                      setActionType(null)
                      setAdminNotes("")
                    }}
                    className="flex-1 h-12 rounded-xl border-brand-gray-200 text-brand-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className={cn(
                      "flex-1 h-12 text-white rounded-xl font-bold",
                      actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      actionType === "approve" ? "Approve Payout" : "Reject Request"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
