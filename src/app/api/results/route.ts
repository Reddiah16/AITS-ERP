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
    let where: any = {}
    if (role === "student") {
      const student = await db.student.findUnique({ where: { userId } })
      if (student) where.studentId = student.id
    }

    const results = await db.semesterResult.findMany({
      where,
      include: { student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } } },
      orderBy: { semester: "desc" },
    })

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { studentId, semester, gpa, sgpa, totalCredits, status } = body

    const result = await db.semesterResult.upsert({
      where: { studentId_semester: { studentId, semester } },
      update: { gpa, sgpa, totalCredits, status, publishedAt: new Date() },
      create: { studentId, semester, gpa, sgpa, totalCredits: totalCredits || 0, status: status || "pending", publishedAt: new Date() },
    })

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 })
  }
}
