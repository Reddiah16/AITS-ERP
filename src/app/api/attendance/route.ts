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
  const subjectId = searchParams.get("subjectId")
  const studentId = searchParams.get("studentId")
  const date = searchParams.get("date")

  try {
    let where: any = {}

    if (role === "student") {
      const student = await db.student.findUnique({ where: { userId } })
      if (student) where.studentId = student.id
    } else if (subjectId) {
      where.subjectId = subjectId
    }
    if (studentId) where.studentId = studentId
    if (date) {
      const d = new Date(date)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      where.date = { gte: d, lt: next }
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
        markedBy: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role
  const userId = (session.user as any).id

  if (!["super_admin", "admin", "hod", "faculty"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { records, subjectId, date } = body // records: [{studentId, status}]

    if (!records || !subjectId || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const faculty = await db.faculty.findUnique({ where: { userId } })
    const attendanceDate = new Date(date)

    const results = await Promise.allSettled(
      records.map((r: { studentId: string; status: string }) =>
        db.attendance.upsert({
          where: { studentId_subjectId_date: { studentId: r.studentId, subjectId, date: attendanceDate } },
          update: { status: r.status, markedById: faculty?.id },
          create: { studentId: r.studentId, subjectId, date: attendanceDate, status: r.status, markedById: faculty?.id },
        })
      )
    )

    const created = results.filter(r => r.status === "fulfilled").length
    return NextResponse.json({ success: true, message: `Attendance marked for ${created} students` })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 })
  }
}
