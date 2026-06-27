"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Building2,
} from "lucide-react"

export function ReportsPage() {
  const [reportType, setReportType] = useState("overview")
  const [departmentId, setDepartmentId] = useState("all")
  const [departments, setDepartments] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const generateReport = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (reportType !== "overview") params.set("type", reportType)
      if (departmentId !== "all") params.set("departmentId", departmentId)

      const res = await fetch(`/api/reports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      }
    } catch {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }, [reportType, departmentId])

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (reportType !== "overview") params.set("type", reportType)
      if (departmentId !== "all") params.set("departmentId", departmentId)
      params.set("format", "csv")

      const res = await fetch(`/api/reports?${params}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}_report.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Report downloaded")
      }
    } catch {
      toast.error("Failed to download report")
    }
  }

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const reportTypes = [
    { value: "overview", label: "Overview", icon: <BarChart3 className="size-4" /> },
    { value: "student", label: "Students", icon: <GraduationCap className="size-4" /> },
    { value: "faculty", label: "Faculty", icon: <Users className="size-4" /> },
    { value: "department", label: "Departments", icon: <Building2 className="size-4" /> },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500">Generate and download various reports</p>
      </div>

      {/* Report Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        {t.icon}
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={downloadCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      {loading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : reportData ? (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-emerald-600" />
              {reportTypes.find(t => t.value === reportType)?.label} Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.summary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-emerald-50">
                    <p className="text-xs text-gray-500">Total Students</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.summary.totalStudents}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-50">
                    <p className="text-xs text-gray-500">Total Faculty</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.summary.totalFaculty}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-50">
                    <p className="text-xs text-gray-500">Departments</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.summary.totalDepartments}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xs text-gray-500">Programs</p>
                    <p className="text-xl font-bold text-gray-900">{reportData.summary.totalPrograms}</p>
                  </div>
                </div>

                {reportData.summary.studentsByDepartment && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Students by Department</h4>
                    {reportData.summary.studentsByDepartment.map((dept: any) => (
                      <div key={dept.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">{dept.name} ({dept.code})</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{
                                width: `${Math.max(10, (dept._count.students / Math.max(...reportData.summary.studentsByDepartment.map((d: any) => d._count.students), 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-6 text-right">{dept._count.students}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {reportData.students && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-2 font-medium text-gray-500">Enrollment No</th>
                      <th className="text-left py-2 font-medium text-gray-500">Department</th>
                      <th className="text-left py-2 font-medium text-gray-500">Program</th>
                      <th className="text-left py-2 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.students.map((s: any) => (
                      <tr key={s.id} className="border-b border-gray-50">
                        <td className="py-2">{s.user?.name}</td>
                        <td className="py-2 font-mono">{s.enrollmentNo}</td>
                        <td className="py-2">{s.department?.name}</td>
                        <td className="py-2">{s.program?.name || "—"}</td>
                        <td className="py-2">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.faculties && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-2 font-medium text-gray-500">Employee ID</th>
                      <th className="text-left py-2 font-medium text-gray-500">Department</th>
                      <th className="text-left py-2 font-medium text-gray-500">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.faculties.map((f: any) => (
                      <tr key={f.id} className="border-b border-gray-50">
                        <td className="py-2">{f.user?.name}</td>
                        <td className="py-2 font-mono">{f.employeeId}</td>
                        <td className="py-2">{f.department?.name}</td>
                        <td className="py-2">{f.designation || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportData.departments && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-2 font-medium text-gray-500">Code</th>
                      <th className="text-left py-2 font-medium text-gray-500">Students</th>
                      <th className="text-left py-2 font-medium text-gray-500">Faculty</th>
                      <th className="text-left py-2 font-medium text-gray-500">HOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.departments.map((d: any) => (
                      <tr key={d.id} className="border-b border-gray-50">
                        <td className="py-2">{d.name}</td>
                        <td className="py-2 font-mono">{d.code}</td>
                        <td className="py-2">{d._count?.students || 0}</td>
                        <td className="py-2">{d._count?.faculties || 0}</td>
                        <td className="py-2">{d.hod?.user?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <BarChart3 className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Select a report type and generate</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
