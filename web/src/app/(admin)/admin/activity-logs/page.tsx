"use client"

import * as React from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ShieldAlert, Search, Filter, Loader2, Clock, User, Globe, Terminal, Activity 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAdminActivityLogs } from "@/lib/actions/admin"
import { cn } from "@/lib/utils"

export default function AdminActivityLogsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<string>("all")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedLog, setSelectedLog] = React.useState<any>(null)

  const loadLogs = async () => {
    setLoading(true)
    const data = await getAdminActivityLogs()
    setLogs(data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const desc = log.description?.toLowerCase() || ""
    const userEmail = log.users?.email?.toLowerCase() || ""
    const userName = log.users?.display_name?.toLowerCase() || ""
    const action = log.action_type?.toLowerCase() || ""
    
    const matchesSearch = desc.includes(searchTerm.toLowerCase()) || 
                          userEmail.includes(searchTerm.toLowerCase()) || 
                          userName.includes(searchTerm.toLowerCase()) ||
                          action.includes(searchTerm.toLowerCase())

    const matchesActionType = activeFilter === "all" || log.action_type === activeFilter
    return matchesSearch && matchesActionType
  })

  // Get unique action types for filtering options
  const uniqueActionTypes = Array.from(new Set(logs.map(l => l.action_type)))

  const getActionBadgeStyles = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes("DELETE")) return "bg-red-50 text-red-700 border-red-200"
    if (act.includes("CREATE") || act.includes("UPLOAD")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (act.includes("UPDATE") || act.includes("EDIT")) return "bg-blue-50 text-blue-700 border-blue-200"
    return "bg-brand-gray-50 text-brand-gray-750 border-brand-gray-200"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-brand-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-650" />
            Security Audit Logs
          </h2>
          <p className="text-brand-gray-500 text-sm mt-1">Real-time ledger tracking platform configuration updates, blog releases, and file changes.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <Input 
              placeholder="Search descriptions, admin..." 
              className="pl-9 h-10 bg-white border-brand-gray-200 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={loadLogs} 
            className="border-brand-gray-250 bg-white hover:bg-brand-gray-50 h-10 px-3 rounded-xl font-bold text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Options bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-brand-gray-200 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl border transition-all shrink-0",
            activeFilter === "all" 
              ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
              : "bg-white text-brand-gray-500 border-brand-gray-200 hover:text-brand-gray-800"
          )}
        >
          All Activities
        </button>
        {uniqueActionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl border transition-all shrink-0 capitalize",
              activeFilter === type 
                ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                : "bg-white text-brand-gray-500 border-brand-gray-200 hover:text-brand-gray-800"
            )}
          >
            {type.toLowerCase().replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card className="border-brand-gray-200 shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="pb-4 border-b border-brand-gray-100 flex flex-row items-center justify-between bg-white">
              <CardTitle className="text-base font-bold text-brand-gray-900">Audit Trail Logs</CardTitle>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold">
                Total Traced: {logs.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-brand-gray-500 flex flex-col items-center bg-white">
                  <Activity className="w-12 h-12 text-brand-gray-300 mb-3" />
                  <p>No activity logs found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-brand-gray-50 text-brand-gray-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-100 bg-white">
                      {filteredLogs.map((log) => (
                        <tr 
                          key={log.id} 
                          className="hover:bg-brand-gray-50 transition-colors bg-white cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-brand-gray-100 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-brand-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-brand-gray-900">{log.users?.display_name || "System"}</p>
                                <p className="text-[10px] text-brand-gray-400 font-medium">{log.users?.email || "cron/webhook"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn("uppercase text-[9px] font-bold border py-0.5", getActionBadgeStyles(log.action_type))}>
                              {log.action_type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-brand-gray-700 font-semibold line-clamp-2 max-w-xs">{log.description}</p>
                          </td>
                          <td className="px-6 py-4 text-brand-gray-500 text-xs font-semibold whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-gray-400" />
                              {new Date(log.created_at).toLocaleString()}
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
        </div>

        {/* Sidebar Log Details */}
        <div className="lg:col-span-1">
          <Card className="border-brand-gray-200 shadow-sm bg-white rounded-3xl sticky top-6">
            <CardHeader className="border-b border-brand-gray-100">
              <CardTitle className="text-base font-bold text-brand-gray-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-600" /> Log Metadata
              </CardTitle>
              <CardDescription>Select an event to view security header properties.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {selectedLog ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Event Unique ID</p>
                    <p className="text-xs font-mono bg-brand-gray-50 p-2 rounded-xl border border-brand-gray-150 break-all">{selectedLog.id}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Actor Display Name</p>
                    <p className="text-xs font-bold text-brand-gray-800">{selectedLog.users?.display_name || "System"}</p>
                    <p className="text-[10px] text-brand-gray-400">{selectedLog.users?.email || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Action Traced</p>
                    <Badge variant="outline" className={cn("uppercase text-[9px] font-bold border", getActionBadgeStyles(selectedLog.action_type))}>
                      {selectedLog.action_type}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Action Description</p>
                    <p className="text-xs font-semibold text-brand-gray-700 leading-relaxed">{selectedLog.description}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">IP Address</p>
                    <div className="flex items-center gap-1 text-xs font-semibold text-brand-gray-700">
                      <Globe className="w-4 h-4 text-brand-gray-400" />
                      <span>{selectedLog.ip_address || "127.0.0.1"}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-brand-gray-100">
                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">User Agent Client</p>
                    <p className="text-[10px] text-brand-gray-500 font-mono bg-brand-gray-50 p-2 rounded-xl border border-brand-gray-150 leading-normal break-all">
                      {selectedLog.user_agent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AdminDashboard"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-brand-gray-400 flex flex-col items-center">
                  <Activity className="w-8 h-8 text-brand-gray-300 mb-2" />
                  <p className="text-xs">No audit log currently selected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
