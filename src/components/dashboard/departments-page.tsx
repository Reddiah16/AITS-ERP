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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Crown,
} from "lucide-react"

export function DepartmentsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [departments, setDepartments] = useState<any[]>([])
  const [faculties, setFaculties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", code: "", description: "", hodId: "",
  })

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/departments")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.departments || [])
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFaculties = useCallback(async () => {
    try {
      const res = await fetch("/api/faculty?limit=100")
      if (res.ok) {
        const data = await res.json()
        setFaculties(data.faculties || [])
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
    fetchFaculties()
  }, [fetchDepartments, fetchFaculties])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const res = await fetch(`/api/departments/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            description: form.description || null,
            hodId: form.hodId || null,
          }),
        })
        if (res.ok) {
          toast.success("Department updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchDepartments()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update department")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            description: form.description || null,
            hodId: form.hodId || null,
          }),
        })
        if (res.ok) {
          toast.success("Department created successfully")
          setDialogOpen(false)
          resetForm()
          fetchDepartments()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create department")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Department deleted successfully")
        fetchDepartments()
      } else {
        toast.error("Failed to delete department")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (dept: any) => {
    setEditMode(true)
    setEditId(dept.id)
    setForm({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
      hodId: dept.hodId || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({ name: "", code: "", description: "", hodId: "" })
    setEditMode(false)
    setEditId(null)
  }

  const canManage = ["super_admin", "admin"].includes(role)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">{departments.length} academic departments</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
                <Plus className="size-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{editMode ? "Edit Department" : "Add New Department"}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. CSE" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Department description..." />
                </div>
                <div className="space-y-2">
                  <Label>Head of Department</Label>
                  <select
                    className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm"
                    value={form.hodId}
                    onChange={(e) => setForm({ ...form, hodId: e.target.value })}
                  >
                    <option value="">Select HOD</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>{f.user?.name} ({f.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                  <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white" onClick={handleSubmit}>
                    {editMode ? "Update Department" : "Create Department"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#1a3a6b]/10">
                      <Building2 className="size-5 text-[#1a3a6b]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">{dept.name}</CardTitle>
                      <Badge className="text-xs bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30 mt-1">{dept.code}</Badge>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => handleEdit(dept)}>
                        <Pencil className="size-3 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(dept.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {dept.description && (
                  <CardDescription className="mb-4 text-xs text-gray-500 line-clamp-2">{dept.description}</CardDescription>
                )}
                <div className="grid grid-cols-3 gap-2 text-center mt-3">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <GraduationCap className="size-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{dept._count?.students || 0}</p>
                    <p className="text-[10px] text-gray-400">Students</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Users className="size-4 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{dept._count?.faculties || 0}</p>
                    <p className="text-[10px] text-gray-400">Faculty</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <BookOpen className="size-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{dept._count?.programs || 0}</p>
                    <p className="text-[10px] text-gray-400">Programs</p>
                  </div>
                </div>
                {dept.hod && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <Crown className="size-3.5 text-amber-500 shrink-0" />
                    <span>HOD: <span className="font-semibold text-gray-700">{dept.hod.user?.name}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
