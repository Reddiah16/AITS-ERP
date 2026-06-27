import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("admin", "super_admin", "hod", "faculty")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status")
  const semester = searchParams.get("semester")
  const batch = searchParams.get("batch")

  const where: any = {}
  if (departmentId) where.departmentId = departmentId
  if (status) where.status = status
  if (semester) where.semester = parseInt(semester)
  if (batch) where.batch = batch
  if (search) {
    where.OR = [
      { enrollmentNo: { contains: search } },
      { rollNumber: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ]
  }

  const [students, total] = await Promise.all([
    db.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, username: true, avatar: true } },
        department: { select: { id: true, name: true, code: true } },
        program: { select: { id: true, name: true, code: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.student.count({ where }),
  ])

  return NextResponse.json({ students, total, page, limit })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin", "super_admin")
  if (error) return error

  const body = await req.json()
  const { username, email, password, name, rollNumber, enrollmentNo, departmentId, programId, semester, year, section, batch, phone, address, dob, gender, bloodGroup, guardianName, guardianPhone } = body

  if (!email || !password || !name || !departmentId) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
  }

  const rn = rollNumber || enrollmentNo || email.split("@")[0]
  const uname = username || rn

  const bcrypt = (await import("bcryptjs")).default
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: { username: uname, email, password: hashedPassword, name, role: "student", rollNumber: rn, isApproved: true, isActive: true },
  })

  const student = await db.student.create({
    data: {
      userId: user.id,
      rollNumber: rn,
      enrollmentNo: enrollmentNo || rn,
      departmentId,
      programId: programId || null,
      semester: semester || 1,
      year: year || 1,
      section: section || null,
      batch: batch || null,
      phone: phone || null,
      address: address || null,
      dob: dob ? new Date(dob) : null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      guardianName: guardianName || null,
      guardianPhone: guardianPhone || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
      department: { select: { id: true, name: true, code: true } },
      program: { select: { id: true, name: true, code: true } },
    },
  })

  return NextResponse.json(student, { status: 201 })
}
