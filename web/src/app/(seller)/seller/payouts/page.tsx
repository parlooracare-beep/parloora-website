"use client"

import * as React from "react"
import { 
  Wallet, ArrowDownToLine, Loader2, CheckCircle2, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  XCircle, Clock, ChevronRight, AlertCircle, RefreshCw 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getSellerAccruedBalance, createPayoutRequest } from "@/lib/actions/payouts"
import { createClient } from "@/lib/supabase/client"
import { cn, formatCurrency } from "@/lib/utils"

export default function SellerPayoutsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [balance, setBalance] = React.useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)

  const [withdrawAmount, setWithdrawAmount] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<"bkash" | "bank_transfer">("bkash")
  const [bkashNumber, setBkashNumber] = React.useState("")
  
  const [bankName, setBankName] = React.useState("")
  const [accountName, setAccountName] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [routingNumber, setRoutingNumber] = React.useState("")

  const [formError, setFormError] = React.useState<string | null>(null)
  const [formSuccess, setFormSuccess] = React.useState<string | null>(null)

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)
    
    try {
      // 1. Fetch balance metrics
      const balanceData = await getSellerAccruedBalance()
      setBalance(balanceData)

      // 2. Fetch payout history
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("payout_requests" as any)
          .select("*")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .order("created_at", { ascending: false }) as any
        setRequests(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    
    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setFormError("Please enter a valid amount greater than 0.")
      return
    }

    if (amount > (balance?.netBalance || 0)) {
      setFormError(`Insufficient balance. Available to withdraw is ৳${(balance?.netBalance || 0).toLocaleString()}.`)
      return
    }

    setSubmitting(true)

    let paymentDetails = {}
    if (paymentMethod === "bkash") {
      if (!bkashNumber || bkashNumber.trim().length < 11) {
        setFormError("Please enter a valid 11-digit bKash account number.")
        setSubmitting(false)
        return
      }
      paymentDetails = { bkashNumber }
    } else {
      if (!bankName || !accountName || !accountNumber) {
        setFormError("Please fill out all bank account fields.")
        setSubmitting(false)
        return
      }
      paymentDetails = { bankName, accountName, accountNumber, routingNumber }
    }

    try {
      const res = await createPayoutRequest({
        amount,
        paymentMethod,
        paymentDetails,
      })

      if (res.success) {
        setFormSuccess(`Withdrawal request for ৳${amount.toLocaleString()} submitted successfully!`)
        setWithdrawAmount("")
        setBkashNumber("")
        setBankName("")
        setAccountName("")
        setAccountNumber("")
        setRoutingNumber("")
        await loadData(true)
      } else {
        setFormError(res.error || "Failed to submit request.")
      }
    } catch (err) {
      console.error(err)
      setFormError("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-brand-gray-500 font-medium">Fetching earnings statement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Payouts & Withdrawals
          </h2>
          <p className="text-brand-gray-500 text-sm mt-0.5">Manage your accrued earnings, platform fees, and transfer payouts.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => loadData(true)} 
          disabled={refreshing}
          className="bg-white border-brand-gray-200 text-brand-gray-600 gap-2 h-10 rounded-xl hover:bg-brand-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing && "animate-spin"}`} />
          Refresh Statement
        </Button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-brand-gray-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Gross Earnings</span>
            <p className="text-2xl font-black text-brand-gray-900 mt-1">৳{(balance?.accruedGross || 0).toLocaleString()}</p>
            <p className="text-[10px] text-brand-gray-400 mt-2">All completed bookings</p>
          </CardContent>
        </Card>

        <Card className="border-brand-gray-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Platform Commissions</span>
            <p className="text-2xl font-black text-brand-gray-500 mt-1">৳{(balance?.commissionPaid || 0).toLocaleString()}</p>
            <p className="text-[10px] text-brand-gray-400 mt-2">Accrued platform fee deductions</p>
          </CardContent>
        </Card>

        <Card className="border-brand-gray-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <span className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">Withdrawn</span>
            <p className="text-2xl font-black text-[#880E4F] mt-1">৳{(balance?.withdrawn || 0).toLocaleString()}</p>
            <p className="text-[10px] text-brand-gray-400 mt-2">Paid out to your bank/bKash</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 rounded-2xl shadow-md">
          <CardContent className="p-6">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Net Available Balance</span>
            <p className="text-3xl font-black text-primary mt-1">৳{(balance?.netBalance || 0).toLocaleString()}</p>
            <p className="text-[10px] text-primary/70 mt-2">Available for immediate withdrawal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-5">
          <Card className="border-brand-gray-100 shadow-lg bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-brand-gray-950 text-white p-6">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-secondary" />
                Request Withdrawal
              </CardTitle>
              <CardDescription className="text-white/60 text-xs">Request payout to your preferred channel</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Withdrawal Amount (BDT)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-brand-gray-400 font-black">৳</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      required
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-8 h-12 rounded-xl border-brand-gray-100 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Payout Channel</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bkash")}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-bold text-center transition-all",
                        paymentMethod === "bkash"
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "border-brand-gray-100 bg-white text-brand-gray-600 hover:bg-brand-gray-50"
                      )}
                    >
                      bKash (MFS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-bold text-center transition-all",
                        paymentMethod === "bank_transfer"
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "border-brand-gray-100 bg-white text-brand-gray-600 hover:bg-brand-gray-50"
                      )}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === "bkash" ? (
                  <div className="space-y-2">
                    <Label htmlFor="bkashNo" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">bKash Account Number (Personal/Agent)</Label>
                    <Input
                      id="bkashNo"
                      placeholder="017XXXXXXXX"
                      required
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      className="h-12 rounded-xl border-brand-gray-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 border-t border-brand-gray-50">
                    <div className="space-y-2">
                      <Label htmlFor="bank" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Bank Name</Label>
                      <Input
                        id="bank"
                        placeholder="e.g. Dutch Bangla Bank"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="h-11 rounded-xl border-brand-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accName" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Account Holder Name</Label>
                      <Input
                        id="accName"
                        placeholder="e.g. John Doe"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="h-11 rounded-xl border-brand-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accNo" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Account Number</Label>
                      <Input
                        id="accNo"
                        placeholder="e.g. 120101XXXXXX"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="h-11 rounded-xl border-brand-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing" className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">Routing Number (Optional)</Label>
                      <Input
                        id="routing"
                        placeholder="e.g. 09526XXXX"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="h-11 rounded-xl border-brand-gray-100"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || (balance?.netBalance || 0) <= 0}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold mt-4"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-7">
          <Card className="border-brand-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-white border-b border-brand-gray-100 p-6">
              <CardTitle className="text-base font-bold text-brand-gray-900">Request History</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {requests.length === 0 ? (
                <div className="p-16 text-center text-brand-gray-400 flex flex-col items-center">
                  <Wallet className="w-12 h-12 text-brand-gray-200 mb-3" />
                  <p className="text-sm font-semibold">No payout requests yet.</p>
                  <p className="text-xs mt-1">Submit your first withdrawal request using the form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Submitted Date</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Destination</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-100">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-brand-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-semibold text-brand-gray-600">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 capitalize font-bold text-brand-gray-800">
                            {req.payment_method === "bkash" ? "bKash" : "Bank Transfer"}
                          </td>
                          <td className="px-6 py-4 text-xs text-brand-gray-500 max-w-[200px] truncate">
                            {req.payment_method === "bkash" 
                              ? req.payment_details?.bkashNumber 
                              : `${req.payment_details?.bankName} (A/C: ${req.payment_details?.accountNumber})`}
                          </td>
                          <td className="px-6 py-4 font-black text-brand-gray-900">
                            {formatCurrency(req.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge className={cn(
                              "border-0 text-[10px] uppercase font-bold px-2 py-0.5",
                              req.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                              req.status === "rejected" ? "bg-red-50 text-red-700" :
                              "bg-amber-50 text-amber-700"
                            )}>
                              {req.status}
                            </Badge>
                            {req.notes && (
                              <p className="text-[10px] text-brand-gray-400 mt-1 italic max-w-[150px] truncate ml-auto" title={req.notes}>
                                Note: {req.notes}
                              </p>
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
        </div>
      </div>
    </div>
  )
}
