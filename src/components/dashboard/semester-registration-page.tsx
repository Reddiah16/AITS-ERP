"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function SemesterRegistrationPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id
  const studentId = (session?.user as any)?.studentId
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [studentStats, setStudentStats] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      if (role === "student") {
        const statsRes = await fetch("/api/stats")
        if (statsRes.ok) {
          const d = await statsRes.json()
          setStudentStats(d)
        }
      } else {
        const res = await fetch("/api/academic/registrations")
        if (res.ok) {
          const d = await res.json()
          setRegistrations(d.registrations || [])
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!studentStats?.student) return
    try {
      const res = await fetch("/api/academic/register-semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentStats.student.id,
          semester: studentStats.student.semester + 1,
          academicYear: "2024-25"
        })
      })
      if (res.ok) {
        toast.success("Semester registration submitted successfully!")
        loadData()
      } else {
        toast.error("Failed to submit registration")
      }
    } catch { toast.error("Error submitting registration") }
  }

  const handleApprove = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/academic/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success(`Registration ${status} successfully`)
        loadData()
      }
    } catch { toast.error("Error approving registration") }
  }

  const isStudent = role === "student"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="size-6 text-[#1a3a6b]" /> Semester Registration
        </h2>
        <p className="text-sm text-gray-500 mt-1">Register for the upcoming semester and manage approval tracking</p>
      </div>

      {loading ? (
        <Card className="h-40 bg-gray-100 animate-pulse border-0" />
      ) : isStudent ? (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Registration Status</CardTitle>
            <CardDescription>Current Semester: Sem {studentStats?.student?.semester || 1}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#1a3a6b]/5 rounded-xl border border-[#1a3a6b]/10 flex items-center gap-3">
              <Clock className="size-5 text-[#1a3a6b]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Upcoming Semester: Sem {(studentStats?.student?.semester || 1) + 1}</p>
                <p className="text-xs text-gray-500">Submit your registration form to get approved for attending classes.</p>
              </div>
            </div>
            <Button onClick={handleRegister} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
              Submit Semester Registration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {registrations.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl">
              <CheckCircle className="size-12 mx-auto mb-3 opacity-20" />
              <p>No semester registrations pending approval</p>
            </div>
          ) : registrations.map(reg => (
            <Card key={reg.id} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{reg.student?.user?.name}</p>
                  <p className="text-xs text-gray-500">Roll: {reg.student?.rollNumber} · {reg.student?.department?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px]">Sem {reg.semester}</Badge>
                    <Badge className={reg.status === "approved" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                      {reg.status}
                    </Badge>
                  </div>
                </div>
                {reg.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleApprove(reg.id, "rejected")} className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    <Button size="sm" onClick={() => handleApprove(reg.id, "approved")} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">Approve</Button>
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
