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
  Users,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

export function FacultyPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [faculties, setFaculties] = useState<any[]>([])
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
    employeeId: "", departmentId: "",
    designation: "", specialization: "", qualification: "",
    experience: "0", gender: "Male",
  })

  const fetchFaculties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (selectedDept !== "all") params.set("departmentId", selectedDept)

      const res = await fetch(`/api/faculty?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFaculties(data.faculties || [])
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
    fetchFaculties()
  }, [fetchFaculties])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const res = await fetch(`/api/faculty/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, email: form.email,
            departmentId: form.departmentId,
            designation: form.designation || null,
            specialization: form.specialization || null,
            qualification: form.qualification || null,
            experience: parseInt(form.experience) || 0,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Faculty updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchFaculties()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update faculty")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/faculty", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            experience: parseInt(form.experience) || 0,
            designation: form.designation || null,
            specialization: form.specialization || null,
            qualification: form.qualification || null,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Faculty created successfully")
          setDialogOpen(false)
          resetForm()
          fetchFaculties()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create faculty")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return
    try {
      const res = await fetch(`/api/faculty/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Faculty deleted successfully")
        fetchFaculties()
      } else {
        toast.error("Failed to delete faculty")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (faculty: any) => {
    setEditMode(true)
    setEditId(faculty.id)
    setForm({
      name: faculty.user?.name || "",
      email: faculty.user?.email || "",
      username: faculty.user?.username || "",
      password: "",
      employeeId: faculty.employeeId || "",
      departmentId: faculty.departmentId || "",
      designation: faculty.designation || "",
      specialization: faculty.specialization || "",
      qualification: faculty.qualification || "",
      experience: String(faculty.experience || 0),
      gender: faculty.gender || "Male",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({
      name: "", email: "", username: "", password: "",
      employeeId: "", departmentId: "",
      designation: "", specialization: "", qualification: "",
      experience: "0", gender: "Male",
    })
    setEditMode(false)
    setEditId(null)
  }

  const totalPages = Math.ceil(total / limit)
  const canManage = ["super_admin", "admin"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Directory</h2>
          <p className="text-sm text-gray-500">{total} total faculty members</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
                <Plus className="size-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Rajesh Sharma" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="dr.sharma@aits.ac.in" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="dr.sharma" disabled={editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>{editMode ? "Password (leave blank)" : "Password *"}</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee ID *</Label>
                    <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP001" disabled={editMode} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor" />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Machine Learning" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Qualification</Label>
                    <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. Ph.D" />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (yrs)</Label>
                    <Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
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
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                  <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white" onClick={handleSubmit}>
                    {editMode ? "Update Faculty" : "Create Faculty"}
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
                placeholder="Search by name, employee ID, or email..."
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
          ) : faculties.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No faculty found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculties.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{f.user?.name}</p>
                          <p className="text-xs text-gray-400">{f.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{f.employeeId}</TableCell>
                      <TableCell>{f.department?.name}</TableCell>
                      <TableCell>{f.designation || "—"}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs capitalize ${f.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`} variant="outline">
                          {f.status}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(f)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(f.id)}>
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
