"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  UserCircle,
  GraduationCap,
  Building2,
  BookOpen,
  Mail,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Shield,
  Crown,
} from "lucide-react"

export function ProfilePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) {
          const data = await res.json()
          setProfileData(data)
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const student = profileData?.student
  const faculty = profileData?.faculty

  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-blue-100 text-blue-800 border-blue-200",
    hod: "bg-amber-100 text-amber-800 border-amber-200",
    faculty: "bg-green-100 text-green-800 border-green-200",
    student: "bg-sky-100 text-sky-800 border-sky-200",
  }

  const isFacultyOrHod = role === "faculty" || role === "hod"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-[#1a3a6b] to-[#1e4d8c] text-white">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <Avatar className="size-20 border-4 border-white/20">
              <AvatarFallback className="bg-[#f5a623] text-white text-xl font-bold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="text-sm text-blue-100">{userEmail}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge className={`text-xs capitalize ${roleColors[role]} border`} variant="outline">
                  {role === "hod" ? "Head of Department" : role.replace("_", " ")}
                </Badge>
                {student && (
                  <Badge className="bg-white/10 text-white border-0 text-xs">
                    {student.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Details */}
      {role === "student" && student && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-[#1a3a6b]">
                <GraduationCap className="size-4" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<BookOpen className="size-4" />} label="Roll Number" value={student.rollNumber || "N/A"} />
              <ProfileField icon={<Building2 className="size-4" />} label="Department" value={student.department?.name} />
              <ProfileField icon={<FileText className="size-4" />} label="Program" value={student.program?.name || "N/A"} />
              <ProfileField icon={<Calendar className="size-4" />} label="Semester / Year" value={`Semester ${student.semester} / Year ${student.year}`} />
              {student.batch && <ProfileField icon={<Calendar className="size-4" />} label="Batch" value={student.batch} />}
              {student.section && <ProfileField icon={<UserCircle className="size-4" />} label="Section" value={student.section} />}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-[#1a3a6b]">
                <UserCircle className="size-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<Mail className="size-4" />} label="Email Address" value={userEmail} />
              <ProfileField icon={<Phone className="size-4" />} label="Phone Number" value={student.phone || "N/A"} />
              <ProfileField icon={<MapPin className="size-4" />} label="Address" value={student.address || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Gender" value={student.gender || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Blood Group" value={student.bloodGroup || "N/A"} />
              {student.guardianName && (
                <ProfileField icon={<UserCircle className="size-4" />} label="Guardian" value={`${student.guardianName} ${student.guardianPhone ? `(${student.guardianPhone})` : ""}`} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Faculty or HOD Profile Details */}
      {isFacultyOrHod && faculty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-[#1a3a6b]">
                <GraduationCap className="size-4" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<BookOpen className="size-4" />} label="Employee ID" value={faculty.employeeId} />
              <ProfileField icon={<Building2 className="size-4" />} label="Department" value={faculty.department?.name} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Designation" value={faculty.designation || "N/A"} />
              <ProfileField icon={<BookOpen className="size-4" />} label="Specialization" value={faculty.specialization || "N/A"} />
              <ProfileField icon={<BookOpen className="size-4" />} label="Qualification" value={faculty.qualification || "N/A"} />
              <ProfileField icon={<Calendar className="size-4" />} label="Experience" value={`${faculty.experience} years`} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-[#1a3a6b]">
                <UserCircle className="size-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<Mail className="size-4" />} label="Email Address" value={userEmail} />
              <ProfileField icon={<Phone className="size-4" />} label="Phone Number" value={faculty.phone || "N/A"} />
              <ProfileField icon={<MapPin className="size-4" />} label="Address" value={faculty.address || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Gender" value={faculty.gender || "N/A"} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin or Super Admin Profile */}
      {(role === "admin" || role === "super_admin") && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#1a3a6b]">
              <Shield className="size-4" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField icon={<Mail className="size-4" />} label="Email Address" value={userEmail} />
            <ProfileField icon={<UserCircle className="size-4" />} label="System Role" value={role === "super_admin" ? "Super Administrator" : "Administrator"} />
            <ProfileField icon={<Calendar className="size-4" />} label="System Access Level" value="Full Administrative Control" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
