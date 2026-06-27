import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin", "faculty")
  if (error) return error

  const { id } = await params
  const department = await db.department.findUnique({
    where: { id },
    include: {
      _count: { select: { students: true, faculties: true, programs: true } },
      hod: { include: { user: { select: { name: true } } } },
      faculties: { include: { user: { select: { name: true, email: true } } } },
      students: { include: { user: { select: { name: true, email: true } } } },
      programs: true,
    },
  })
  if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 })
  return NextResponse.json(department)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const data: any = {}
  if (body.name) data.name = body.name
  if (body.code) data.code = body.code
  if (body.description !== undefined) data.description = body.description
  if (body.hodId !== undefined) data.hodId = body.hodId || null
  if (body.isActive !== undefined) data.isActive = body.isActive

  const department = await db.department.update({
    where: { id },
    data,
    include: {
      _count: { select: { students: true, faculties: true } },
      hod: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(department)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  await db.department.delete({ where: { id } })
  return NextResponse.json({ message: "Department deleted" })
}
