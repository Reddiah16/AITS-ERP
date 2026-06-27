"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, GraduationCap, Download, FileSpreadsheet } from "lucide-react"

export function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/results").then(r => r.json()).then(d => setResults(d.results || [])).finally(() => setLoading(false))
  }, [])

  const handleExportCSV = () => {
    window.open("/api/reports/grades/csv?semester=all", "_blank")
  }

  const getGpaColor = (gpa: number) => gpa >= 8 ? "text-green-600" : gpa >= 6 ? "text-blue-600" : gpa >= 5 ? "text-amber-600" : "text-red-600"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="size-6 text-[#1a3a6b]" /> Results & GPA
          </h2>
          <p className="text-sm text-gray-500 mt-1">Semester-wise academic performance and grade records</p>
        </div>
        {results.length > 0 && (
          <Button onClick={handleExportCSV} className="bg-[#1a3a6b] hover:bg-[#1e4d8c] text-white">
            <FileSpreadsheet className="size-4 mr-2" /> Export Excel/CSV
          </Button>
        )}
      </div>
      {loading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Card key={i} className="border-0 shadow-sm h-24 animate-pulse bg-gray-100" />)}</div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Award className="size-12 mx-auto mb-3 opacity-20" />
          <p>No results published yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(r => (
            <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Semester {r.semester}</p>
                    <p className="font-semibold text-gray-900">{r.student?.user?.name}</p>
                    <p className="text-xs text-gray-400">{r.student?.department?.name}</p>
                  </div>
                  <Badge className={r.status === "pass" ? "bg-green-100 text-green-700" : r.status === "fail" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}>
                    {r.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${r.gpa ? getGpaColor(r.gpa) : "text-gray-400"}`}>{r.gpa?.toFixed(2) || "—"}</p>
                    <p className="text-xs text-gray-400 font-medium">CGPA</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${r.sgpa ? getGpaColor(r.sgpa) : "text-gray-400"}`}>{r.sgpa?.toFixed(2) || "—"}</p>
                    <p className="text-xs text-gray-400 font-medium">SGPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{r.totalCredits}</p>
                    <p className="text-xs text-gray-400 font-medium">Credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

