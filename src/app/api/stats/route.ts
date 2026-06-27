import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const role = (session.user as any).role
  const userId = (session.user as any).id

  try {
    // Super Admin / Admin stats
    if (role === "super_admin" || role === "admin") {
      const [totalStudents, activeStudents, totalFaculty, totalDepartments, totalPrograms, totalUsers,
        pendingApprovals, studentsByDept, facultyByDept, recentStudents, recentNotifications] = await Promise.all([
        db.student.count(),
        db.student.count({ where: { status: "active" } }),
        db.faculty.count(),
        db.department.count({ where: { isActive: true } }),
        db.program.count(),
        db.user.count({ where: { isActive: true } }),
        db.user.count({ where: { isApproved: false, isActive: true } }),
        db.department.findMany({
          select: { name: true, _count: { select: { students: true } } },
          where: { isActive: true },
        }),
        db.department.findMany({
          select: { name: true, _count: { select: { faculties: true } } },
          where: { isActive: true },
        }),
        db.student.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } }, department: { select: { name: true } } },
        }),
        db.notification.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, type: true, createdAt: true },
        }),
      ])

      return NextResponse.json({
        totalStudents, activeStudents, totalFaculty, totalDepartments, totalPrograms, totalUsers, pendingApprovals,
        studentsByDept: studentsByDept.map(d => ({ name: d.name, count: d._count.students })),
        facultyByDept: facultyByDept.map(d => ({ name: d.name, count: d._count.faculties })),
        recentStudents, recentNotifications,
      })
    }

    // HOD stats
    if (role === "hod") {
      const faculty = await db.faculty.findUnique({
        where: { userId },
        include: { department: { include: { students: { include: { user: true } }, faculties: { include: { user: true } }, subjects: true } } },
      })
      if (!faculty) return NextResponse.json({ error: "HOD profile not found" }, { status: 404 })

      const dept = faculty.department
      const totalAttendance = await db.attendance.count({ where: { subject: { departmentId: dept.id } } })
      const presentAttendance = await db.attendance.count({ where: { subject: { departmentId: dept.id }, status: "present" } })

      return NextResponse.json({
        faculty,
        department: dept,
        totalStudents: dept.students.length,
        totalFaculty: dept.faculties.length,
        totalSubjects: dept.subjects.length,
        attendancePercent: totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0,
        unreadNotifications: 0,
      })
    }

    // Faculty stats
    if (role === "faculty") {
      const faculty = await db.faculty.findUnique({
        where: { userId },
        include: {
          user: true,
          department: true,
          subjects: true,
        },
      })
      if (!faculty) return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 })

      const departmentStudents = await db.student.count({ where: { departmentId: faculty.departmentId } })
      const departmentFaculty = await db.faculty.count({ where: { departmentId: faculty.departmentId } })
      const unreadNotifications = await db.notificationRecipient.count({ where: { userId, isRead: false } })
      const recentAttendance = await db.attendance.findMany({
        take: 5,
        where: { markedById: faculty.id },
        orderBy: { createdAt: "desc" },
        include: { student: { include: { user: true } }, subject: true },
      })

      return NextResponse.json({ faculty, departmentStudents, departmentFaculty, unreadNotifications, recentAttendance })
    }

    // Student stats
    if (role === "student") {
      const student = await db.student.findUnique({
        where: { userId },
        include: {
          user: true,
          department: true,
          program: true,
        },
      })
      if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 })

      const unreadNotifications = await db.notificationRecipient.count({ where: { userId, isRead: false } })

      // Attendance stats
      const totalClasses = await db.attendance.count({ where: { studentId: student.id } })
      const presentClasses = await db.attendance.count({ where: { studentId: student.id, status: "present" } })
      const attendancePercent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

      // Marks
      const marks = await db.internalMark.findMany({
        where: { studentId: student.id },
        include: { subject: true },
      })

      // Active circulars
      const circulars = await db.circular.findMany({
        take: 3,
        where: { isActive: true, OR: [{ targetRole: null }, { targetRole: "student" }] },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ student, unreadNotifications, attendancePercent, totalClasses, presentClasses, marks, circulars })
    }

    return NextResponse.json({ error: "Unknown role" }, { status: 400 })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
