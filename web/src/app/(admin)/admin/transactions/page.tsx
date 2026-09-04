"use client"

import * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Receipt, Search, Filter, Loader2, Calendar, User, Store, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminTransactions } from "@/lib/actions/admin"
import { cn, formatCurrency } from "@/lib/utils"

export default function AdminTransactionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAdminTransactions()
      setTransactions(data)
      setLoading(false)
    }
    load()
  }, [])

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.parlour_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Receipt className="w-6 h-6 text-emerald-600" />
            Transaction History
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Monitor all platform bookings and financial activity.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search transaction, parlour..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-emerald-500"
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
          <CardTitle className="text-base font-bold text-brand-gray-900">Platform Bookings</CardTitle>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Total Volume: {formatCurrency(transactions.reduce((sum, t) => sum + (t.amount || 0), 0))}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
              <Receipt className="w-12 h-12 text-brand-gray-300 mb-3" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Parlour</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-100 bg-white">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-brand-gray-50 transition-colors bg-white">
                      <td className="px-6 py-4 font-mono text-xs text-brand-gray-500">
                        {txn.id.substring(0, 12).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="font-medium text-brand-gray-900">{txn.customer_name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-brand-gray-400" />
                          <span className="text-brand-gray-700">{txn.parlour_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-brand-gray-900 font-medium">{txn.service_name}</p>
                        <p className="text-[10px] text-brand-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {new Date(txn.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-gray-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold border-0",
                          txn.status?.toLowerCase() === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                          txn.status?.toLowerCase() === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {txn.status}
                        </Badge>
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
  )
}
