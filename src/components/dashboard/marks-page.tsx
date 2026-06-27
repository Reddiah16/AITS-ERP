"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardList, Plus, Save, Search } from "lucide-react"
import { toast } from "sonner"

export function MarksPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [marks, setMarks] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("mid1")
  const [entryMode, setEntryMode] = useState(false)
  const [marksEntry, setMarksEntry] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [marksRes, subRes] = await Promise.all([fetch("/api/marks"), fetch("/api/subjects")])
      if (marksRes.ok) setMarks((await marksRes.json()).marks || [])
      if (subRes.ok) setSubjects((await subRes.json()).subjects || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const loadStudentsForSubject = async (subjectId: string) => {
    if (!subjectId) return
    const sub = subjects.find(s => s.id === subjectId)
    if (!sub) return
    const res = await fetch(`/api/students?departmentId=${sub.departmentId}`)
    if (res.ok) {
      const data = await res.json()
      setStudents(data.students || [])
      const map: Record<string, string> = {}
      data.students?.forEach((s: any) => { map[s.id] = "" })
      setMarksEntry(map)
    }
  }

  const handleSubjectChange = (id: string) => {
    setSelectedSubject(id)
    if (id && canEnterMarks) loadStudentsForSubject(id)
  }

  const saveMarks = async () => {
    if (!selectedSubject) return toast.error("Select a subject first")
    setSaving(true)
    try {
      const entries = Object.entries(marksEntry).filter(([, v]) => v !== "")
      await Promise.all(entries.map(([studentId, m]) =>
        fetch("/api/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, subjectId: selectedSubject, examType: selectedExamType, marks: parseFloat(m), maxMarks: 30 }),
        })
      ))
      toast.success(`Marks saved for ${entries.length} students`)
      loadData()
      setEntryMode(false)
    } catch { toast.error("Failed to save marks") }
    finally { setSaving(false) }
  }

  const canEnterMarks = ["super_admin", "admin", "hod", "faculty"].includes(role)
  const isStudent = role === "student"

  const grouped: Record<string, any[]> = {}
  marks.forEach(m => {
    const key = m.subject?.name || "Unknown"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Internal Marks</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and view internal examination marks</p>
        </div>
        {canEnterMarks && (
          <Button onClick={() => setEntryMode(!entryMode)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />{entryMode ? "View Records" : "Enter Marks"}
          </Button>
        )}
      </div>

      {entryMode && (
        <Card className="border border-[#1a3a6b]/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="size-4 text-[#1a3a6b]" />Enter Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm">Subject</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={selectedSubject} onChange={e => handleSubjectChange(e.target.value)}>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm">Exam Type</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)}>
                  <option value="mid1">Mid-1</option>
                  <option value="mid2">Mid-2</option>
                  <option value="assignment">Assignment</option>
                  <option value="lab">Lab</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={saveMarks} disabled={saving} className="w-full bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white h-10">
                  <Save className="size-4 mr-2" />{saving ? "Saving..." : "Save Marks"}
                </Button>
              </div>
            </div>

            {students.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{student.user?.name}</p>
                      <p className="text-xs text-gray-400">{student.rollNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" min="0" max="30" placeholder="Marks"
                        className="w-24 h-8 text-sm text-center"
                        value={marksEntry[student.id] || ""}
                        onChange={e => setMarksEntry(m => ({...m, [student.id]: e.target.value}))}
                      />
                      <span className="text-xs text-gray-400">/ 30</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!entryMode && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-24 animate-pulse bg-gray-100" />)}
            </div>
          ) : marks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="size-12 mx-auto mb-3 opacity-20" />
              <p>No marks recorded yet</p>
            </div>
          ) : (
            Object.entries(grouped).map(([subjectName, subMarks]) => (
              <Card key={subjectName} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{subjectName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {!isStudent && <th className="text-left pb-2 text-xs text-gray-500 font-medium">Student</th>}
                          <th className="text-left pb-2 text-xs text-gray-500 font-medium">Exam</th>
                          <th className="text-right pb-2 text-xs text-gray-500 font-medium">Marks</th>
                          <th className="text-right pb-2 text-xs text-gray-500 font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subMarks.map(m => (
                          <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            {!isStudent && <td className="py-2 font-medium">{m.student?.user?.name}</td>}
                            <td className="py-2 capitalize text-gray-600">{m.examType.replace("_", " ")}</td>
                            <td className="py-2 text-right font-bold">{m.marks}/{m.maxMarks}</td>
                            <td className="py-2 text-right">
                              <span className={`text-xs font-medium ${(m.marks/m.maxMarks) >= 0.6 ? "text-green-600" : "text-red-600"}`}>
                                {Math.round((m.marks/m.maxMarks)*100)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
