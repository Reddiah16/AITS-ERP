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
  const departmentId = searchParams.get("departmentId")
  const semester = searchParams.get("semester")

  try {
    let where: any = { isActive: true }
    if (departmentId) where.departmentId = departmentId
    if (semester) where.semester = parseInt(semester)

    // HOD sees only their department's subjects
    if (role === "hod") {
      const faculty = await db.faculty.findUnique({ where: { userId }, include: { department: true } })
      if (faculty) where.departmentId = faculty.departmentId
    }
    // Faculty sees subjects they teach
    if (role === "faculty") {
      const faculty = await db.faculty.findUnique({ where: { userId } })
      if (faculty) where.facultyId = faculty.id
    }

    const subjects = await db.subject.findMany({
      where,
      include: {
        department: { select: { name: true, code: true } },
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { attendance: true } },
      },
      orderBy: [{ semester: "asc" }, { name: "asc" }],
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (!["super_admin", "admin", "hod"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { name, code, credits, semester, departmentId, facultyId } = body
    if (!name || !code || !departmentId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    const existing = await db.subject.findUnique({ where: { code } })
    if (existing) return NextResponse.json({ error: "Subject code already exists" }, { status: 409 })

    const subject = await db.subject.create({
      data: { name, code, credits: credits || 3, semester: semester || 1, departmentId, facultyId: facultyId || null },
    })
    return NextResponse.json({ subject })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}
