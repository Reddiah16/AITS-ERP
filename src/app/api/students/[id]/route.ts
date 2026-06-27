import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin", "faculty")
  if (error) return error

  const { id } = await params
  const student = await db.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, username: true, avatar: true } },
      department: { select: { id: true, name: true, code: true } },
      program: { select: { id: true, name: true, code: true } },
      documents: true,
    },
  })
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })
  return NextResponse.json(student)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const data: any = {}
  const studentFields = ["departmentId", "programId", "semester", "year", "phone", "address", "gender", "bloodGroup", "guardianName", "guardianPhone", "status"]
  for (const field of studentFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  if (body.dob) data.dob = new Date(body.dob)

  const student = await db.student.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, username: true } },
      department: { select: { id: true, name: true, code: true } },
      program: { select: { id: true, name: true, code: true } },
    },
  })

  if (body.name) {
    await db.user.update({ where: { id: student.userId }, data: { name: body.name, email: body.email } })
  }

  return NextResponse.json(student)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const student = await db.student.findUnique({ where: { id }, select: { userId: true } })
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })
  
  await db.student.delete({ where: { id } })
  await db.user.delete({ where: { id: student.userId } })
  
  return NextResponse.json({ message: "Student deleted" })
}
