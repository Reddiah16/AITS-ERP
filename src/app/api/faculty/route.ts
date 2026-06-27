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

  const where: any = {}
  if (departmentId) where.departmentId = departmentId
  if (search) {
    where.OR = [
      { employeeId: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ]
  }

  const [faculties, total] = await Promise.all([
    db.faculty.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, username: true, avatar: true, isApproved: true, role: true } },
        department: { select: { id: true, name: true, code: true } },
        subjects: { select: { id: true, name: true, code: true, semester: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.faculty.count({ where }),
  ])

  return NextResponse.json({ faculty: faculties, faculties, total, page, limit })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const body = await req.json()
  const { username, email, password, name, employeeId, departmentId, designation, specialization, qualification, experience, phone, address, dob, gender } = body

  if (!username || !email || !password || !name || !employeeId || !departmentId) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
  }

  const bcrypt = (await import("bcryptjs")).default
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: { username, email, password: hashedPassword, name, role: "faculty", isApproved: true, isActive: true },
  })

  const faculty = await db.faculty.create({
    data: {
      userId: user.id,
      employeeId,
      departmentId,
      designation: designation || null,
      specialization: specialization || null,
      qualification: qualification || null,
      experience: experience || 0,
      phone: phone || null,
      address: address || null,
      dob: dob ? new Date(dob) : null,
      gender: gender || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  })

  return NextResponse.json(faculty, { status: 201 })
}
