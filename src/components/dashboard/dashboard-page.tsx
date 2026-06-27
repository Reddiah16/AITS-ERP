"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  GraduationCap, Users, Building2, UserCog, TrendingUp, BookOpen,
  Bell, AlertTriangle, ClipboardList, CalendarCheck, Award, Crown, Megaphone, Briefcase
} from "lucide-react"
import { useAppStore } from "@/store/app-store"

export function DashboardPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) setStats(await res.json())
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  if (loading) return <DashboardSkeleton />

  if ((role === "super_admin" || role === "admin") && stats) return <AdminDashboard stats={stats} role={role} />
  if (role === "hod" && stats) return <HodDashboard stats={stats} />
  if (role === "faculty" && stats) return <FacultyDashboard stats={stats} />
  if (role === "student" && stats) return <StudentDashboard stats={stats} />

  return <div className="p-6"><p className="text-gray-500">Unable to load dashboard data.</p></div>
}

function AdminDashboard({ stats, role }: { stats: any; role: string }) {
  const { setCurrentPage } = useAppStore()
  const statCards = [
    { title: "Total Students", value: stats.totalStudents, sub: `${stats.activeStudents} active`, icon: <GraduationCap className="size-5" />, color: "blue", page: "students" },
    { title: "Total Faculty", value: stats.totalFaculty, sub: "All departments", icon: <Users className="size-5" />, color: "green", page: "faculty" },
    { title: "Departments", value: stats.totalDepartments, sub: `${stats.totalPrograms} programs`, icon: <Building2 className="size-5" />, color: "amber", page: "departments" },
    { title: "Total Users", value: stats.totalUsers, sub: "System accounts", icon: <UserCog className="size-5" />, color: "purple", page: "users" },
  ]
  if (stats.pendingApprovals > 0) {
    statCards.push({ title: "Pending Approvals", value: stats.pendingApprovals, sub: "Require action", icon: <AlertTriangle className="size-5" />, color: "red", page: "users" })
  }

  const colorMap: Record<string, any> = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100", border: "border-blue-200" },
    green: { bg: "bg-green-50", text: "text-green-700", iconBg: "bg-green-100", border: "border-green-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100", border: "border-amber-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", iconBg: "bg-purple-100", border: "border-purple-200" },
    red: { bg: "bg-red-50", text: "text-red-700", iconBg: "bg-red-100", border: "border-red-200" },
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {role === "super_admin" ? "Super Admin" : "Admin"} Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">AITS Rajampet ERP — Overview</p>
        </div>
        <Badge className={role === "super_admin" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-100 text-blue-800 border-blue-200"}>
          {role === "super_admin" ? "Super Admin" : "Admin"}
        </Badge>
      </div>

      {stats.pendingApprovals > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="size-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{stats.pendingApprovals} account(s) pending approval</p>
            <p className="text-xs text-amber-600">Faculty/HOD registrations require your approval</p>
          </div>
          <Button size="sm" onClick={() => setCurrentPage("users")} className="bg-amber-600 hover:bg-amber-700 text-white">Review</Button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = colorMap[card.color]
          return (
            <Card key={card.title}
              className={`border cursor-pointer hover:shadow-md transition-all ${colors.border} ${colors.bg}`}
              onClick={() => setCurrentPage(card.page as any)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium ${colors.text}`}>{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                    <span className={colors.text}>{card.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-[#1a3a6b]" />Students by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.studentsByDept?.map((dept: any) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate mr-2">{dept.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="bg-[#1a3a6b] h-2 rounded-full" style={{ width: `${Math.max(5, (dept.count / Math.max(...stats.studentsByDept.map((d: any) => d.count), 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-[#f5a623]" />Faculty by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.facultyByDept?.map((dept: any) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate mr-2">{dept.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="bg-[#f5a623] h-2 rounded-full" style={{ width: `${Math.max(5, (dept.count / Math.max(...stats.facultyByDept.map((d: any) => d.count), 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.recentStudents?.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Enrollments</CardTitle>
            <CardDescription>Latest students added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentStudents.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center">
                      <GraduationCap className="size-4 text-[#1a3a6b]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{s.department?.name}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function HodDashboard({ stats }: { stats: any }) {
  const { setCurrentPage } = useAppStore()
  const dept = stats.department

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HOD Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">{dept?.name} Department</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Crown className="size-3 mr-1" />Head of Department</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Students", value: stats.totalStudents, icon: <GraduationCap className="size-5" />, color: "blue", page: "students" },
          { label: "Faculty", value: stats.totalFaculty, icon: <Users className="size-5" />, color: "green", page: "faculty" },
          { label: "Subjects", value: stats.totalSubjects, icon: <BookOpen className="size-5" />, color: "purple", page: "subjects" },
          { label: "Attendance %", value: `${stats.attendancePercent}%`, icon: <CalendarCheck className="size-5" />, color: "amber", page: "attendance" },
        ].map(card => (
          <Card key={card.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => setCurrentPage(card.page as any)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1a3a6b]/10">
                  <span className="text-[#1a3a6b]">{card.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dept?.faculties?.slice(0, 5).map((f: any) => (
                <div key={f.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                      {f.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{f.user?.name}</p>
                      <p className="text-xs text-gray-400">{f.designation || "Faculty"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{f.subjects?.length || 0} subjects</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subjects Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dept?.subjects?.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-gray-400">Sem {s.semester} · {s.credits} credits</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{s.code}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FacultyDashboard({ stats }: { stats: any }) {
  const { setCurrentPage } = useAppStore()
  const faculty = stats.faculty

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {faculty?.user?.name || "Faculty"}</h2>
          <p className="text-sm text-gray-500 mt-1">{faculty?.department?.name} · {faculty?.designation || "Faculty"}</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">Faculty</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Subjects", value: faculty?.subjects?.length || 0, icon: <BookOpen className="size-5" />, page: "subjects" },
          { label: "Dept Students", value: stats.departmentStudents, icon: <GraduationCap className="size-5" />, page: "students" },
          { label: "Dept Faculty", value: stats.departmentFaculty, icon: <Users className="size-5" />, page: "faculty" },
          { label: "Unread Alerts", value: stats.unreadNotifications, icon: <Bell className="size-5" />, page: "notifications" },
        ].map(card => (
          <Card key={card.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => setCurrentPage(card.page as any)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1a3a6b]/10">
                  <span className="text-[#1a3a6b]">{card.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faculty?.subjects?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-gray-400">Sem {s.semester} · {s.credits} credits</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCurrentPage("attendance")}>Attendance</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCurrentPage("marks")}>Marks</Button>
                  </div>
                </div>
              ))}
              {(!faculty?.subjects || faculty.subjects.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No subjects assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Employee ID", value: faculty?.employeeId },
                { label: "Department", value: faculty?.department?.name },
                { label: "Designation", value: faculty?.designation || "N/A" },
                { label: "Specialization", value: faculty?.specialization || "N/A" },
                { label: "Qualification", value: faculty?.qualification || "N/A" },
                { label: "Experience", value: faculty?.experience ? `${faculty.experience} yrs` : "N/A" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-medium text-gray-900 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentDashboard({ stats }: { stats: any }) {
  const { setCurrentPage } = useAppStore()
  const student = stats.student

  const attendanceColor = stats.attendancePercent >= 75 ? "text-green-600" : stats.attendancePercent >= 60 ? "text-amber-600" : "text-red-600"
  const attendanceBg = stats.attendancePercent >= 75 ? "bg-green-500" : stats.attendancePercent >= 60 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {student?.user?.name || "Student"}</h2>
          <p className="text-sm text-gray-500 mt-1">{student?.rollNumber} · {student?.department?.name}</p>
        </div>
        <Badge className="bg-sky-100 text-sky-800 border-sky-200">Student</Badge>
      </div>

      {stats.attendancePercent < 75 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="size-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Your attendance is {stats.attendancePercent}% — below the 75% requirement. You may be ineligible for exams.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Semester", value: student?.semester, icon: <BookOpen className="size-5" />, page: "results" },
          { label: "Attendance", value: `${stats.attendancePercent}%`, icon: <CalendarCheck className="size-5" />, page: "attendance" },
          { label: "Notifications", value: stats.unreadNotifications, icon: <Bell className="size-5" />, page: "notifications" },
          { label: "Circulars", value: stats.circulars?.length || 0, icon: <Megaphone className="size-5" />, page: "circulars" },
        ].map(card => (
          <Card key={card.label} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => setCurrentPage(card.page as any)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${card.label === "Attendance" ? attendanceColor : "text-gray-900"}`}>{card.value}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1a3a6b]/10">
                  <span className="text-[#1a3a6b]">{card.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="size-4 text-[#1a3a6b]" />Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Overall Attendance</span>
                  <span className={`font-bold ${attendanceColor}`}>{stats.attendancePercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`${attendanceBg} h-3 rounded-full transition-all`} style={{ width: `${Math.min(stats.attendancePercent, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{stats.presentClasses} present</span>
                  <span>{stats.totalClasses} total</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage("attendance")} className="w-full border-[#1a3a6b]/30 text-[#1a3a6b]">
              View Detailed Attendance →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="size-4 text-[#f5a623]" />Recent Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.marks?.slice(0, 4).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{m.subject?.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{m.examType.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{m.marks}/{m.maxMarks}</p>
                    <p className={`text-xs ${(m.marks / m.maxMarks) >= 0.6 ? "text-green-500" : "text-red-500"}`}>
                      {Math.round((m.marks / m.maxMarks) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              {(!stats.marks || stats.marks.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No marks recorded yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Academic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: "Roll Number", value: student?.rollNumber },
              { label: "Department", value: student?.department?.name },
              { label: "Program", value: student?.program?.name || "N/A" },
              { label: "Batch", value: student?.batch || "N/A" },
              { label: "Semester", value: student?.semester },
              { label: "Year", value: student?.year },
              { label: "Section", value: student?.section || "N/A" },
              { label: "Status", value: student?.status },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
