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

  try {
    let where: any = {}
    if (role === "student") {
      const student = await db.student.findUnique({ where: { userId } })
      if (student) where.studentId = student.id
    }
    if (subjectId) where.subjectId = subjectId
    if (studentId) where.studentId = studentId

    const marks = await db.internalMark.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
        enteredBy: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ marks })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (!["super_admin", "admin", "hod", "faculty"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { studentId, subjectId, examType, marks, maxMarks } = body
    if (!studentId || !subjectId || !examType || marks === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const faculty = await db.faculty.findUnique({ where: { userId } })

    const mark = await db.internalMark.upsert({
      where: { studentId_subjectId_examType: { studentId, subjectId, examType } },
      update: { marks, maxMarks: maxMarks || 30, enteredById: faculty?.id },
      create: { studentId, subjectId, examType, marks, maxMarks: maxMarks || 30, enteredById: faculty?.id },
    })

    return NextResponse.json({ mark })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 })
  }
}
