"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Megaphone, Plus, X, FileText, Calendar, Search } from "lucide-react"
import { toast } from "sonner"

const typeColors: Record<string, string> = {
  general: "bg-gray-100 text-gray-700",
  academic: "bg-blue-100 text-blue-700",
  exam: "bg-purple-100 text-purple-700",
  placement: "bg-green-100 text-green-700",
  event: "bg-amber-100 text-amber-700",
}

const targetLabels: Record<string, string> = {
  student: "Students",
  faculty: "Faculty",
  hod: "HODs",
  admin: "Admins",
}

export function CircularsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [circulars, setCirculars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [form, setForm] = useState({ title: "", content: "", type: "general", targetRole: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCirculars() }, [])

  const loadCirculars = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/circulars")
      if (res.ok) setCirculars((await res.json()).circulars || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const saveCircular = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/circulars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, targetRole: form.targetRole || null }),
      })
      if (res.ok) {
        toast.success("Circular issued successfully")
        setShowForm(false)
        setForm({ title: "", content: "", type: "general", targetRole: "" })
        loadCirculars()
      } else {
        toast.error("Failed to issue circular")
      }
    } catch { toast.error("Error issuing circular") }
    finally { setSaving(false) }
  }

  const canCreate = ["super_admin", "admin", "hod"].includes(role)

  const filtered = circulars.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.content.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || c.type === filterType
    return matchSearch && matchType
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Circulars</h2>
          <p className="text-sm text-gray-500 mt-1">Official notices and announcements</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Issue Circular
          </Button>
        )}
      </div>

      {/* New Circular Form */}
      {showForm && (
        <Card className="border border-[#1a3a6b]/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="size-4 text-[#1a3a6b]" />Issue New Circular
              </CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveCircular} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm">Title *</Label>
                  <Input className="mt-1 h-10" placeholder="Circular title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
                </div>
                <div>
                  <Label className="text-sm">Type</Label>
                  <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Examination</option>
                    <option value="placement">Placement</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Target Audience</Label>
                  <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.targetRole} onChange={e => setForm(f => ({...f, targetRole: e.target.value}))}>
                    <option value="">All (Everyone)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="hod">HODs Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm">Content *</Label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 min-h-[120px] resize-none"
                    placeholder="Circular content..."
                    value={form.content}
                    onChange={e => setForm(f => ({...f, content: e.target.value}))}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
                  {saving ? "Publishing..." : "Publish Circular"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search circulars..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="academic">Academic</option>
          <option value="exam">Exam</option>
          <option value="placement">Placement</option>
          <option value="event">Event</option>
        </select>
      </div>

      {/* Circulars List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-32 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="size-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No circulars found</p>
          <p className="text-sm mt-1">Check back later for announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((circular) => (
            <Card key={circular.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-[#1a3a6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{circular.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <Badge className={`text-xs border ${typeColors[circular.type] || "bg-gray-100 text-gray-700"}`}>
                          {circular.type}
                        </Badge>
                        {circular.targetRole && (
                          <Badge variant="outline" className="text-xs">
                            {targetLabels[circular.targetRole] || circular.targetRole}
                          </Badge>
                        )}
                        {!circular.targetRole && <Badge variant="outline" className="text-xs">All</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{circular.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>Issued by: <span className="font-medium text-gray-600">{circular.issuedBy?.name}</span></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(circular.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
