"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Plus, X, Search, Edit } from "lucide-react"
import { toast } from "sonner"

export function SubjectsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [subjects, setSubjects] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState("")
  const [filterSem, setFilterSem] = useState("")
  const [form, setForm] = useState({ name: "", code: "", credits: "3", semester: "1", departmentId: "", facultyId: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [subRes, deptRes, facRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/departments"),
        fetch("/api/faculty"),
      ])
      if (subRes.ok) setSubjects((await subRes.json()).subjects || [])
      if (deptRes.ok) setDepartments((await deptRes.json()).departments || [])
      if (facRes.ok) setFaculty((await facRes.json()).faculty || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const saveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, credits: parseInt(form.credits), semester: parseInt(form.semester), facultyId: form.facultyId || null }),
      })
      if (res.ok) {
        toast.success("Subject added successfully")
        setShowForm(false)
        setForm({ name: "", code: "", credits: "3", semester: "1", departmentId: "", facultyId: "" })
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to add subject")
      }
    } catch { toast.error("Error saving subject") }
    finally { setSaving(false) }
  }

  const canCreate = ["super_admin", "admin", "hod"].includes(role)

  const filtered = subjects.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    const matchDept = !filterDept || s.departmentId === filterDept
    const matchSem = !filterSem || s.semester === parseInt(filterSem)
    return matchSearch && matchDept && matchSem
  })

  // Group by semester
  const bySemester: Record<number, any[]> = {}
  filtered.forEach(s => {
    if (!bySemester[s.semester]) bySemester[s.semester] = []
    bySemester[s.semester].push(s)
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
          <p className="text-sm text-gray-500 mt-1">{subjects.length} subjects across all departments</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <Plus className="size-4 mr-2" />Add Subject
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border border-[#1a3a6b]/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add New Subject</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="size-4" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Subject Name *</Label>
                <Input className="mt-1 h-10" placeholder="e.g. Data Structures" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div>
                <Label className="text-sm">Subject Code *</Label>
                <Input className="mt-1 h-10" placeholder="e.g. CSE301" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} required />
              </div>
              <div>
                <Label className="text-sm">Department *</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.departmentId} onChange={e => setForm(f => ({...f, departmentId: e.target.value}))} required>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm">Assigned Faculty</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.facultyId} onChange={e => setForm(f => ({...f, facultyId: e.target.value}))}>
                  <option value="">Select faculty</option>
                  {faculty.filter(f => !form.departmentId || f.departmentId === form.departmentId).map(f => <option key={f.id} value={f.id}>{f.user?.name} ({f.designation})</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm">Semester</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.semester} onChange={e => setForm(f => ({...f, semester: e.target.value}))}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm">Credits</Label>
                <select className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none" value={form.credits} onChange={e => setForm(f => ({...f, credits: e.target.value}))}>
                  {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c} Credits</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
                  {saving ? "Saving..." : "Add Subject"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
        <select className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-36 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="size-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No subjects found</p>
        </div>
      ) : (
        Object.entries(bySemester).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([sem, subs]) => (
          <div key={sem}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Semester {sem}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subs.map(subject => (
                <Card key={subject.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                        <BookOpen className="size-4 text-[#1a3a6b]" />
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{subject.code}</Badge>
                        <Badge className="text-xs bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30">{subject.credits}cr</Badge>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{subject.name}</h4>
                    <p className="text-xs text-gray-500">{subject.department?.name}</p>
                    {subject.faculty && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                          {subject.faculty?.user?.name?.[0]}
                        </div>
                        <span className="text-xs text-gray-500">{subject.faculty?.user?.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
