import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin", "faculty")
  if (error) return error

  const { id } = await params
  const faculty = await db.faculty.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, username: true, avatar: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  })
  if (!faculty) return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
  return NextResponse.json(faculty)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const data: any = {}
  const facultyFields = ["departmentId", "designation", "specialization", "qualification", "experience", "phone", "address", "gender", "status"]
  for (const field of facultyFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  if (body.dob) data.dob = new Date(body.dob)

  const faculty = await db.faculty.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  })

  if (body.name) {
    await db.user.update({ where: { id: faculty.userId }, data: { name: body.name, email: body.email } })
  }

  return NextResponse.json(faculty)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const faculty = await db.faculty.findUnique({ where: { id }, select: { userId: true } })
  if (!faculty) return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
  
  await db.faculty.delete({ where: { id } })
  await db.user.delete({ where: { id: faculty.userId } })
  
  return NextResponse.json({ message: "Faculty deleted" })
}
