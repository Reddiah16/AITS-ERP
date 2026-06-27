"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CalendarRange, Plus, X, Search, Clock } from "lucide-react"
import { toast } from "sonner"

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function TimetablePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [slots, setSlots] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedSem, setSelectedSem] = useState("3")
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [form, setForm] = useState({
    dayOfWeek: "Monday", startTime: "09:00", endTime: "09:50",
    subjectId: "", facultyId: "", classroom: "LH-101", section: "A", semester: "3", departmentId: ""
  })

  const loadTimetable = useCallback(async () => {
    if (selectedDept === "all") return
    setLoading(true)
    try {
      const res = await fetch(`/api/academic/timetable?departmentId=${selectedDept}&semester=${selectedSem}`)
      if (res.ok) {
        const d = await res.json()
        setSlots(d.slots || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [selectedDept, selectedSem])

  const loadData = useCallback(async () => {
    try {
      const [deptRes, subRes, facRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/subjects"),
        fetch("/api/faculty?limit=100")
      ])
      if (deptRes.ok) {
        const d = await deptRes.json()
        const depts = d.departments || []
        setDepartments(depts)
        if (depts.length > 0 && selectedDept === "all") {
          setSelectedDept(depts[0].id)
        }
      }
      if (subRes.ok) {
        const s = await subRes.json()
        setSubjects(s.subjects || [])
      }
      if (facRes.ok) {
        const f = await facRes.json()
        setFaculty(f.faculties || [])
      }
    } catch { /* ignore */ }
  }, [selectedDept])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { loadTimetable() }, [selectedDept, selectedSem, loadTimetable])

  const saveSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/academic/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, departmentId: selectedDept }),
      })
      if (res.ok) {
        toast.success("Timetable slot created!")
        setShowAddSlot(false)
        loadTimetable()
      } else {
        toast.error("Failed to create slot")
      }
    } catch { toast.error("Error creating slot") }
  }

  const canManage = ["super_admin", "admin", "hod"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarRange className="size-6 text-[#1a3a6b]" /> Timetable Scheduling
          </h2>
          <p className="text-sm text-gray-500 mt-1">Class timetables, timetabling, and subject mapping</p>
        </div>
        {canManage && selectedDept !== "all" && (
          <Button onClick={() => setShowAddSlot(!showAddSlot)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Class Slot
          </Button>
        )}
      </div>

      {showAddSlot && (
        <Card className="border border-[#1a3a6b]/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Add Timetable Class Slot</CardTitle>
              <button onClick={() => setShowAddSlot(false)}><X className="size-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Weekday</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.dayOfWeek} onChange={e => setForm(f => ({...f, dayOfWeek: e.target.value}))}>
                  {weekdays.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><Label className="text-sm">Start Time</Label><Input type="time" className="mt-1 h-10" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} required /></div>
              <div><Label className="text-sm">End Time</Label><Input type="time" className="mt-1 h-10" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} required /></div>
              <div>
                <Label className="text-sm">Subject</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.subjectId} onChange={e => setForm(f => ({...f, subjectId: e.target.value}))} required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm">Assigned Faculty</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={form.facultyId} onChange={e => setForm(f => ({...f, facultyId: e.target.value}))} required>
                  <option value="">Select Faculty</option>
                  {faculty.map(f => <option key={f.id} value={f.id}>{f.user?.name}</option>)}
                </select>
              </div>
              <div><Label className="text-sm">Classroom / Lab</Label><Input className="mt-1 h-10" value={form.classroom} onChange={e => setForm(f => ({...f, classroom: e.target.value}))} /></div>
              <div><Label className="text-sm">Section</Label><Input className="mt-1 h-10" value={form.section} onChange={e => setForm(f => ({...f, section: e.target.value.toUpperCase()}))} /></div>
              <div><Label className="text-sm">Semester</Label><Input type="number" min="1" max="8" className="mt-1 h-10" value={form.semester} onChange={e => setForm(f => ({...f, semester: e.target.value}))} /></div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddSlot(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Save Slot</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Select Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="text-xs text-gray-500 font-medium">Department</Label>
          <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
            <option value="all">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="w-32">
          <Label className="text-xs text-gray-500 font-medium">Semester</Label>
          <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Clock className="size-12 mx-auto mb-3 opacity-20" />
          <p>No slots scheduled for this department/semester</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map(slot => (
            <Card key={slot.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-xs">{slot.dayOfWeek}</Badge>
                    <p className="font-semibold text-gray-900 mt-1">{slot.subject?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{slot.subject?.code}</p>
                  </div>
                  {slot.classroom && <Badge className="bg-[#1a3a6b]/10 text-[#1a3a6b] border-0 text-xs">{slot.classroom}</Badge>}
                </div>
                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-50">
                  <p>Faculty: <span className="font-medium text-gray-700">{slot.faculty?.user?.name}</span></p>
                  <p>Time: <span className="font-medium text-gray-700">{slot.startTime} — {slot.endTime}</span></p>
                  <p>Section: <span className="font-medium text-gray-700">{slot.section || "N/A"}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
