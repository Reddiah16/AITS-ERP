import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role
  const userId = (session.user as any).id

  try {
    if (role === "student") {
      const student = await db.student.findUnique({ where: { userId } })
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

      const [performance, placement, attendance] = await Promise.all([
        db.studentPrediction.findFirst({ where: { studentId: student.id }, orderBy: { predictionDate: "desc" } }),
        db.placementPrediction.findFirst({ where: { studentId: student.id }, orderBy: { predictionDate: "desc" } }),
        db.attendanceAnalytic.findFirst({ where: { studentId: student.id }, orderBy: { predictionDate: "desc" } }),
      ])

      return NextResponse.json({ performance, placement, attendance })
    }

    // For HOD / Faculty / Admin / Super Admin, return aggregated analytics and high-risk students list
    const [performanceList, placementList, attendanceList] = await Promise.all([
      db.studentPrediction.findMany({
        include: { student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } } },
        orderBy: { predictionDate: "desc" },
      }),
      db.placementPrediction.findMany({
        include: { student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } } },
        orderBy: { predictionDate: "desc" },
      }),
      db.attendanceAnalytic.findMany({
        include: { student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } } },
        orderBy: { predictionDate: "desc" },
      }),
    ])

    return NextResponse.json({
      performanceList,
      placementList,
      attendanceList,
      highRiskCount: performanceList.filter(p => p.performanceStatus === "Risk" || p.failureRiskPercent > 50).length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch AI analytics" }, { status: 500 })
  }
}
