"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, X, Clock, MapPin, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function AcademicCalendarPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "", type: "academic_start" })

  useEffect(() => { loadEvents() }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/academic/calendar")
      if (res.ok) {
        const d = await res.json()
        setEvents(d.events || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/academic/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Calendar event created!")
        setShowAddEvent(false)
        loadEvents()
      } else {
        toast.error("Failed to save event")
      }
    } catch { toast.error("Error creating event") }
  }

  const canManage = ["super_admin", "admin"].includes(role)

  const typeColors: Record<string, string> = {
    academic_start: "bg-blue-100 text-blue-700 border-blue-200",
    exam: "bg-red-100 text-red-700 border-red-200",
    holiday: "bg-amber-100 text-amber-700 border-amber-200",
    festival: "bg-purple-100 text-purple-700 border-purple-200",
    event: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="size-6 text-[#1a3a6b]" /> Academic Calendar
          </h2>
          <p className="text-sm text-gray-500 mt-1">Calendar events and scheduling for AITS Rajampet</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAddEvent(!showAddEvent)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Event
          </Button>
        )}
      </div>

      {showAddEvent && (
        <Card className="border border-[#1a3a6b]/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Add Calendar Event</CardTitle>
              <button onClick={() => setShowAddEvent(false)}><X className="size-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-sm">Event Title *</Label><Input className="mt-1 h-10" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required /></div>
              <div>
                <Label className="text-sm">Event Type</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                  <option value="academic_start">Academic Semester Start</option>
                  <option value="exam">Examinations Schedule</option>
                  <option value="holiday">Official Holiday</option>
                  <option value="festival">Festival Break</option>
                  <option value="event">College Event / Symposium</option>
                </select>
              </div>
              <div><Label className="text-sm">Start Date *</Label><Input type="date" className="mt-1 h-10" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} required /></div>
              <div><Label className="text-sm">End Date *</Label><Input type="date" className="mt-1 h-10" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} required /></div>
              <div className="md:col-span-2"><Label className="text-sm">Description</Label><Input className="mt-1 h-10" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Save Event</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Card key={i} className="h-20 bg-gray-100 animate-pulse border-0" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="size-12 mx-auto mb-3 opacity-20" />
          <p>No academic calendar events configured yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <Card key={event.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                    <Clock className="size-5 text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{event.description || "No description provided"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-[10px] capitalize ${typeColors[event.type] || "bg-gray-100 text-gray-600"}`}>
                        {event.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} 
                        {event.startDate !== event.endDate && ` — ${new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
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
