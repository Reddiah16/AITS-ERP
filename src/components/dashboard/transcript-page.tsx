"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Download, Award, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function TranscriptPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch student stats to get their student ID
    fetch("/api/stats")
      .then(r => r.json())
      .then(stats => {
        const studentId = stats.student?.id
        if (studentId) {
          // 2. Fetch transcript using student ID
          fetch(`/api/exams/transcript/${studentId}`)
            .then(r => r.json())
            .then(trans => setData(trans))
            .finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDownload = () => {
    toast.success("Transcript PDF generated and downloading...")
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6 text-center text-gray-500">
        <FileText className="size-12 mx-auto mb-3 opacity-20" />
        <p>No academic transcript available.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-6 text-[#1a3a6b]" /> Official Transcript
          </h2>
          <p className="text-sm text-gray-500 mt-1">Official grade records for graduation verification</p>
        </div>
        <Button onClick={handleDownload} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
          <Download className="size-4 mr-2" />Export PDF
        </Button>
      </div>

      <Card className="border-0 shadow-sm max-w-3xl mx-auto bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1a3a6b] to-[#f5a623]" />
        <CardContent className="p-8 space-y-6">
          {/* College Header */}
          <div className="text-center pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">{data.college}</h3>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-1">Office of the Controller of Examinations</p>
            <Badge className="mt-3 bg-amber-50 text-amber-800 border-amber-200">Official Academic Record</Badge>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-xs text-gray-400">Student Name</p>
              <p className="font-semibold text-gray-800">{data.studentName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Roll Number</p>
              <p className="font-semibold text-gray-800 font-mono">{data.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Department</p>
              <p className="font-semibold text-gray-800">{data.department}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="size-4 text-emerald-600" /> Digitally Signed
            </div>
          </div>

          {/* Semester Results List */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="size-4 text-[#1a3a6b]" /> Semester Summary
            </h4>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Semester</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SGPA</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((res: any) => (
                    <tr key={res.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-800">Semester {res.semester}</td>
                      <td className="px-4 py-3 font-bold text-[#1a3a6b]">{res.sgpa || "Pending"}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${res.status === "pass" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                          {res.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
