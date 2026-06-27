"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCheck, CheckCircle, XCircle, Clock, Search, Filter, Save, Users } from "lucide-react"
import { toast } from "sonner"

export function AttendancePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [attendance, setAttendance] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [markingMode, setMarkingMode] = useState(false)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [attRes, subRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/subjects"),
      ])
      if (attRes.ok) setAttendance((await attRes.json()).attendance || [])
      if (subRes.ok) setSubjects((await subRes.json()).subjects || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const loadStudentsForSubject = async (subjectId: string) => {
    if (!subjectId) return
    try {
      const sub = subjects.find(s => s.id === subjectId)
      if (!sub) return
      const res = await fetch(`/api/students?departmentId=${sub.departmentId}`)
      if (res.ok) {
        const data = await res.json()
        const studs = data.students || []
        setStudents(studs)
        // Initialize all as present
        const map: Record<string, string> = {}
        studs.forEach((s: any) => { map[s.id] = "present" })
        setAttendanceMap(map)
      }
    } catch { /* ignore */ }
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    if (subjectId && canMarkAttendance) {
      loadStudentsForSubject(subjectId)
    }
  }

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedDate) {
      toast.error("Please select subject and date")
      return
    }
    setSaving(true)
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status }))
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, subjectId: selectedSubject, date: selectedDate }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        loadData()
        setMarkingMode(false)
      } else {
        toast.error("Failed to save attendance")
      }
    } catch { toast.error("Error saving attendance") }
    finally { setSaving(false) }
  }

  const canMarkAttendance = ["super_admin", "admin", "hod", "faculty"].includes(role)
  const isStudent = role === "student"

  // Calculate summary
  const totalPresent = attendance.filter(a => a.status === "present").length
  const totalAbsent = attendance.filter(a => a.status === "absent").length
  const totalLate = attendance.filter(a => a.status === "late").length
  const total = attendance.length

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage student attendance</p>
        </div>
        {canMarkAttendance && (
          <Button
            onClick={() => setMarkingMode(!markingMode)}
            className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white"
          >
            <CalendarCheck className="size-4 mr-2" />
            {markingMode ? "View Records" : "Mark Attendance"}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {!isStudent && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Present", value: totalPresent, icon: <CheckCircle className="size-5" />, color: "green" },
            { label: "Absent", value: totalAbsent, icon: <XCircle className="size-5" />, color: "red" },
            { label: "Late", value: totalLate, icon: <Clock className="size-5" />, color: "amber" },
          ].map(card => (
            <Card key={card.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${card.color}-100`}>
                    <span className={`text-${card.color}-600`}>{card.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Subject</Label>
              <select
                className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                value={selectedSubject}
                onChange={e => handleSubjectChange(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Date</Label>
              <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-9 text-sm" />
            </div>
            {markingMode && (
              <div className="flex items-end">
                <Button onClick={saveAttendance} disabled={saving} className="w-full bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white h-9">
                  <Save className="size-4 mr-2" />
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Mode */}
      {markingMode && selectedSubject && students.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" />Mark Attendance — {subjects.find(s => s.id === selectedSubject)?.name}
              <Badge variant="secondary">{selectedDate}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={() => {
                const map: Record<string, string> = {}
                students.forEach(s => { map[s.id] = "present" })
                setAttendanceMap(map)
              }} className="text-green-700 border-green-200">All Present</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const map: Record<string, string> = {}
                students.forEach(s => { map[s.id] = "absent" })
                setAttendanceMap(map)
              }} className="text-red-700 border-red-200">All Absent</Button>
            </div>
            <div className="space-y-2">
              {students.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-xs font-bold text-[#1a3a6b]">
                      {student.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.user?.name}</p>
                      <p className="text-xs text-gray-400">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {["present", "absent", "late"].map(status => (
                      <button
                        key={status}
                        onClick={() => setAttendanceMap(m => ({ ...m, [student.id]: status }))}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          attendanceMap[student.id] === status
                            ? status === "present" ? "bg-green-500 text-white" : status === "absent" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      {!markingMode && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CalendarCheck className="size-10 mx-auto mb-3 opacity-30" />
                <p>No attendance records found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendance.slice(0, 20).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${record.status === "present" ? "bg-green-500" : record.status === "absent" ? "bg-red-500" : "bg-amber-500"}`} />
                      <div>
                        {!isStudent && <p className="text-sm font-medium">{record.student?.user?.name}</p>}
                        <p className="text-sm font-medium">{record.subject?.name}</p>
                        <p className="text-xs text-gray-400">{new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <Badge className={
                      record.status === "present" ? "bg-green-100 text-green-700 border-green-200" :
                      record.status === "absent" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    }>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
