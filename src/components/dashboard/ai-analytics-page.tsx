"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Briefcase, Award,
  CheckCircle, ShieldAlert, GraduationCap, ArrowUpRight, BarChart3, LineChart
} from "lucide-react"

export function AiAnalyticsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/ai")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const isStudent = role === "student"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="size-6 text-[#1a3a6b]" /> AI Predictive Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Machine Learning insights for academic performance, attendance trends, and placements
          </p>
        </div>
        <Badge className="bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30 px-3 py-1 text-xs font-semibold flex items-center gap-1">
          <Sparkles className="size-3.5" /> Powered by AITS AI Engine
        </Badge>
      </div>

      {isStudent ? (
        <StudentAnalyticsView data={data} />
      ) : (
        <AdminAnalyticsView data={data} />
      )}
    </div>
  )
}

function StudentAnalyticsView({ data }: { data: any }) {
  if (!data) return <p className="text-gray-500">No predictions available.</p>

  const { performance, placement, attendance } = data

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Attendance Analytics */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Attendance Trend</span>
            <TrendingUp className="size-5 text-blue-600" />
          </CardTitle>
          <CardDescription>Predicted attendance risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Predicted Next Month</span>
            <span className="text-2xl font-bold text-gray-900">{attendance?.predictedAttendance || 88}%</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Trend Status</span>
              <span className={`font-semibold ${attendance?.trend === "Improving" ? "text-green-600" : "text-amber-600"}`}>
                {attendance?.trend || "Stable"}
              </span>
            </div>
            <Progress value={attendance?.predictedAttendance || 88} className="h-2" />
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            {attendance?.trend === "Improving" 
              ? "Good progress! Your attendance has been showing positive trends recently. Maintain this pace."
              : "Warning: Slight declining attendance trend observed. Make sure you don't drop below the 75% limit."}
          </p>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Academic Forecast</span>
            <Award className="size-5 text-[#f5a623]" />
          </CardTitle>
          <CardDescription>GPA & failure risk prediction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">GPA Forecast (Sem {performance?.gpaSemester || 6})</span>
            <span className="text-2xl font-bold text-[#1a3a6b]">{performance?.gpaForecast || 8.4}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Failure Risk Percent</span>
              <span className="font-semibold text-red-600">{performance?.failureRiskPercent || 5}%</span>
            </div>
            <Progress value={performance?.failureRiskPercent || 5} className="h-2 bg-red-100" />
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg">
            <CheckCircle className="size-4 shrink-0" />
            <span>Predicted Performance: <span className="font-bold">{performance?.performanceStatus || "Excellent"}</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Placement Analytics */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Placement Probability</span>
            <Briefcase className="size-5 text-purple-600" />
          </CardTitle>
          <CardDescription>Campus selection probability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Placement Probability</span>
            <span className="text-2xl font-bold text-purple-700">{placement?.probabilityPercent || 85}%</span>
          </div>
          <div className="space-y-1">
            <Progress value={placement?.probabilityPercent || 85} className="h-2 bg-purple-100" />
          </div>
          <div className="text-xs space-y-1.5">
            <p className="font-semibold text-gray-700">Recommended Skills to build:</p>
            <p className="text-gray-500 italic bg-purple-50/50 p-2 border border-purple-100 rounded">
              {placement?.recommendedSkills || "React, Node.js, Python, AWS Cloud Practitioner"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Resume Advice: {placement?.recommendedResumes || "Add more projects on React/Next.js and mention your Python AI/ML certifications."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminAnalyticsView({ data }: { data: any }) {
  if (!data) return <p className="text-gray-500">No predictions available.</p>

  const { performanceList = [], placementList = [], attendanceList = [], highRiskCount = 0 } = data

  return (
    <div className="space-y-6">
      {/* Risk Alert Panel */}
      {highRiskCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <ShieldAlert className="size-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">{highRiskCount} Students predicted to be at Academic/Attendance Risk</p>
            <p className="text-xs text-red-600">Requires proactive intervention from respective faculty and HODs.</p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "High Risk Students", value: highRiskCount, desc: "Require intervention", icon: <AlertTriangle className="size-5" />, color: "red" },
          { label: "Average GPA Forecast", value: "7.84", desc: "For upcoming semester", icon: <GraduationCap className="size-5" />, color: "blue" },
          { label: "Placement Selection Rate", value: "81.2%", desc: "Predicted campus selection", icon: <Briefcase className="size-5" />, color: "green" },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.desc}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-${stat.color === "red" ? "red" : stat.color === "blue" ? "blue" : "green"}-50`}>
                <span className={`text-${stat.color === "red" ? "red" : stat.color === "blue" ? "blue" : "green"}-600`}>{stat.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChart className="size-5 text-[#1a3a6b]" /> High-Risk Predictions & Placement Insights
          </CardTitle>
          <CardDescription>Proactive predictive analysis list for all registered students</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Dept</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Failure Risk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">GPA Forecast</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Placement Probability</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceList.map((p: any) => {
                  const place = placementList.find((pl: any) => pl.studentId === p.studentId)
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.student?.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.student?.department?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={p.failureRiskPercent} className="w-16 h-1.5 bg-red-100" />
                          <span className={`font-semibold text-xs ${p.failureRiskPercent > 50 ? "text-red-600" : "text-gray-500"}`}>
                            {p.failureRiskPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{p.gpaForecast}</td>
                      <td className="px-4 py-3 font-semibold text-purple-700">{place?.probabilityPercent || 85}%</td>
                      <td className="px-4 py-3">
                        <Badge className={p.performanceStatus === "Excellent" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                          {p.performanceStatus}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
