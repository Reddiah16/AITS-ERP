"use client"

import { useEffect, useState, useCallback } from "react"
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
  UserCog,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  UserX,
  ShieldAlert,
} from "lucide-react"

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "", role: "student",
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (roleFilter !== "all") params.set("role", roleFilter)

      const [usersRes, pendingRes] = await Promise.all([
        fetch(`/api/users?${params}`),
        fetch(`/api/users?pending=true`),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
        setTotal(data.users?.length || 0)
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingUsers(data.users || [])
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const body: any = { name: form.name, email: form.email, role: form.role }
        if (form.password) body.password = form.password
        const res = await fetch(`/api/users`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...body }),
        })
        if (res.ok) {
          toast.success("User updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchUsers()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update user")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, userRole: form.role }),
        })
        if (res.ok) {
          toast.success("User created successfully")
          setDialogOpen(false)
          resetForm()
          fetchUsers()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create user")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      })
      if (res.ok) {
        toast.success("Account approved successfully")
        fetchUsers()
      } else {
        toast.error("Failed to approve account")
      }
    } catch {
      toast.error("Error approving account")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        toast.error("Failed to delete user")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (user: any) => {
    setEditMode(true)
    setEditId(user.id)
    setForm({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      role: user.role || "student",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({ name: "", email: "", username: "", password: "", role: "student" })
    setEditMode(false)
    setEditId(null)
  }

  const toggleActive = async (user: any) => {
    try {
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, action: "toggle_active" }),
      })
      if (res.ok) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"} successfully`)
        fetchUsers()
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const totalPages = Math.ceil(total / limit)

  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-50 text-purple-700 border-purple-200",
    admin: "bg-blue-50 text-blue-700 border-blue-200",
    hod: "bg-amber-50 text-amber-700 border-amber-200",
    faculty: "bg-teal-50 text-teal-700 border-teal-200",
    student: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">{total} total users</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
              <Plus className="size-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="john.doe" disabled={editMode} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@aits.ac.in" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{editMode ? "Password (leave blank)" : "Password *"}</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <select
                    className="w-full h-10 mt-1 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                <Button className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white" onClick={handleSubmit}>
                  {editMode ? "Update User" : "Create User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <ShieldAlert className="size-4" /> Pending Approvals ({pendingUsers.length})
            </CardTitle>
            <CardDescription className="text-amber-700">Faculty & HOD accounts requiring administrator verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200 hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email} · {user.employeeId || "No Employee ID"}</p>
                    <Badge className={`mt-1.5 text-[10px] ${roleColors[user.role]}`}>{user.role}</Badge>
                  </div>
                  <Button size="sm" onClick={() => handleApprove(user.id)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5">
                    <CheckCircle className="size-3.5" /> Approve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, roll, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <UserCog className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username / Roll No.</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name}
                        {!u.isApproved && <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Pending Approval</span>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{u.rollNumber || u.username}</TableCell>
                      <TableCell className="text-sm text-gray-500">{u.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs capitalize ${roleColors[u.role] || ""}`} variant="outline">
                          {u.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(u)}>
                          <Badge className={`text-xs cursor-pointer ${u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`} variant="outline">
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(u)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-700" onClick={() => handleDelete(u.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
