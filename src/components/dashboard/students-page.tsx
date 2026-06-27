"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus,
  Search,
  GraduationCap,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

export function StudentsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [students, setStudents] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "",
    rollNumber: "", enrollmentNo: "", departmentId: "", programId: "",
    semester: "1", year: "1", section: "A", batch: "2022-2026", phone: "", gender: "Male",
  })

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (selectedDept !== "all") params.set("departmentId", selectedDept)

      const res = await fetch(`/api/students?${params}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
        setTotal(data.total || 0)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedDept])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.departments || [])
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const res = await fetch(`/api/students/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, email: form.email,
            departmentId: form.departmentId,
            semester: parseInt(form.semester),
            year: parseInt(form.year),
            section: form.section || null,
            batch: form.batch || null,
            phone: form.phone || null,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Student updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchStudents()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update student")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            semester: parseInt(form.semester),
            year: parseInt(form.year),
            phone: form.phone || null,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Student created successfully")
          setDialogOpen(false)
          resetForm()
          fetchStudents()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create student")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Student deleted successfully")
        fetchStudents()
      } else {
        toast.error("Failed to delete student")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (student: any) => {
    setEditMode(true)
    setEditId(student.id)
    setForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      username: student.user?.username || "",
      password: "",
      rollNumber: student.rollNumber || "",
      enrollmentNo: student.enrollmentNo || "",
      departmentId: student.departmentId || "",
      programId: student.programId || "",
      semester: String(student.semester || 1),
      year: String(student.year || 1),
      section: student.section || "A",
      batch: student.batch || "2022-2026",
      phone: student.phone || "",
      gender: student.gender || "Male",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({
      name: "", email: "", username: "", password: "",
      rollNumber: "", enrollmentNo: "", departmentId: "", programId: "",
      semester: "1", year: "1", section: "A", batch: "2022-2026", phone: "", gender: "Male",
    })
    setEditMode(false)
    setEditId(null)
  }

  const totalPages = Math.ceil(total / limit)
  const canManage = ["super_admin", "admin"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Directory</h2>
          <p className="text-sm text-gray-500">{total} total students</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
                <Plus className="size-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@aits.ac.in" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username (optional)</Label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="john.doe" disabled={editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>{editMode ? "Password (leave blank)" : "Password *"}</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Roll Number *</Label>
                    <Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value.toUpperCase() })} placeholder="e.g. 22B21A0501" disabled={editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <select
                      className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm"
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <select
                      className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm"
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={String(s)}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <select
                      className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                    >
                      {[1,2,3,4].map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value.toUpperCase() })} placeholder="A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="2022-2026" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                  <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white" onClick={handleSubmit}>
                    {editMode ? "Update Student" : "Create Student"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, roll number, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm w-full sm:w-[200px]"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1) }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester / Batch</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{s.user?.name}</p>
                          <p className="text-xs text-gray-400">{s.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{s.rollNumber || s.enrollmentNo}</TableCell>
                      <TableCell>{s.department?.name}</TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="secondary" className="text-xs">Sem {s.semester}</Badge>
                          {s.batch && <span className="text-xs text-gray-400 ml-2">{s.batch}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs capitalize ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`} variant="outline">
                          {s.status}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(s)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
