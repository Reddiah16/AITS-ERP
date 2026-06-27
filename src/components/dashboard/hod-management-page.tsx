"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Building2, UserCheck } from "lucide-react"
import { toast } from "sonner"

export function HodManagementPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dRes, fRes] = await Promise.all([fetch("/api/departments"), fetch("/api/faculty")])
      if (dRes.ok) setDepartments((await dRes.json()).departments || [])
      if (fRes.ok) setFaculty((await fRes.json()).faculty || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const assignHod = async (departmentId: string, facultyId: string) => {
    setUpdating(departmentId)
    try {
      const res = await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: departmentId, hodId: facultyId || null }),
      })
      if (res.ok) { toast.success("HOD assigned successfully"); loadData() }
      else toast.error("Failed to assign HOD")
    } catch { toast.error("Error assigning HOD") }
    finally { setUpdating(null) }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">HOD Management</h2>
        <p className="text-sm text-gray-500 mt-1">Assign Heads of Department for each department</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-40 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => {
            const currentHod = dept.hod
            const deptFaculty = faculty.filter(f => f.departmentId === dept.id)

            return (
              <Card key={dept.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center shrink-0">
                      <Building2 className="size-5 text-[#1a3a6b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                      <p className="text-xs text-gray-400">{dept.code}</p>
                    </div>
                  </div>

                  {currentHod && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <Crown className="size-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{currentHod.user?.name}</p>
                        <p className="text-xs text-gray-400">Current HOD · {currentHod.designation}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assign HOD</p>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20"
                        defaultValue={dept.hodId || ""}
                        onChange={e => assignHod(dept.id, e.target.value)}
                        disabled={updating === dept.id}
                      >
                        <option value="">No HOD assigned</option>
                        {deptFaculty.map(f => (
                          <option key={f.id} value={f.id}>{f.user?.name} — {f.designation}</option>
                        ))}
                      </select>
                      {updating === dept.id && <div className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center"><div className="w-4 h-4 border-2 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
