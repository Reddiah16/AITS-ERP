"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Search } from "lucide-react"

const actionColors: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  CREATE: "bg-blue-100 text-blue-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  VIEW: "bg-purple-100 text-purple-700",
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterAction, setFilterAction] = useState("")

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/audit-logs")
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotal(data.total || 0)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = logs.filter(l => {
    const matchSearch = !search || (l.user?.name?.toLowerCase().includes(search.toLowerCase()) || l.entity?.toLowerCase().includes(search.toLowerCase()))
    const matchAction = !filterAction || l.action === filterAction
    return matchSearch && matchAction
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500 mt-1">{total} total audit events</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search by user or entity..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="">All Actions</option>
          {["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW"].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShieldCheck className="size-10 mx-auto mb-3 opacity-20" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{log.user?.name || "System"}</p>
                          <p className="text-xs text-gray-400 capitalize">{log.user?.role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.entity}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">{log.details || "—"}</td>
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
