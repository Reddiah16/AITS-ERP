"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus,
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="size-4 text-cyan-500" />,
  warning: <AlertTriangle className="size-4 text-amber-500" />,
  urgent: <AlertCircle className="size-4 text-red-500" />,
  event: <Calendar className="size-4 text-emerald-500" />,
}

const typeColors: Record<string, string> = {
  info: "bg-cyan-50 border-cyan-200",
  warning: "bg-amber-50 border-amber-200",
  urgent: "bg-red-50 border-red-200",
  event: "bg-emerald-50 border-emerald-200",
}

const typeBadgeColors: Record<string, string> = {
  info: "bg-cyan-50 text-cyan-700 border-cyan-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
  event: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export function NotificationsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: "", message: "", type: "info", targetRole: "all",
  })

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setTotal(data.total)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          targetRole: form.targetRole === "all" ? null : form.targetRole,
        }),
      })
      if (res.ok) {
        toast.success("Notification sent successfully")
        setDialogOpen(false)
        setForm({ title: "", message: "", type: "info", targetRole: "all" })
        fetchNotifications()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send notification")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
      fetchNotifications()
    } catch {
      // Ignore
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">{total} notifications</p>
        </div>
        {role === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="size-4" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send New Notification</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Notification message..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target</Label>
                    <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
                    Send Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Bell className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`border shadow-sm transition-colors cursor-pointer ${typeColors[n.type] || "border-gray-200"} ${!n.isRead ? "border-l-4" : ""}`}
              onClick={() => {
                if (!n.isRead && role !== "admin") markAsRead(n.id)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {typeIcons[n.type] || <Bell className="size-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{n.title}</h3>
                      <Badge className={`text-[10px] ${typeBadgeColors[n.type] || ""}`} variant="outline">
                        {n.type}
                      </Badge>
                      {n.targetRole && (
                        <Badge variant="secondary" className="text-[10px]">
                          {n.targetRole}
                        </Badge>
                      )}
                      {!n.isRead && role !== "admin" && (
                        <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200" variant="outline">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      {role === "admin" && n._count?.recipients && (
                        <p className="text-xs text-gray-400">
                          <Check className="size-3 inline mr-1" />
                          {n._count.recipients} recipients
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
