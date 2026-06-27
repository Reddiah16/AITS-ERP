import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  // Allow all authenticated users to see departments (needed for registration form)
  const departments = await db.department.findMany({
    include: {
      _count: { select: { students: true, faculties: true, programs: true } },
      hod: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ departments })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin", "super_admin")
  if (error) return error

  const body = await req.json()
  const { name, code, description, hodId } = body

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
  }

  const department = await db.department.create({
    data: { name, code, description: description || null, hodId: hodId || null },
    include: {
      _count: { select: { students: true, faculties: true } },
      hod: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json({ department }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAuth("admin", "super_admin")
  if (error) return error

  const body = await req.json()
  const { id, hodId, name, description, isActive } = body

  if (!id) return NextResponse.json({ error: "Department ID required" }, { status: 400 })

  const updated = await db.department.update({
    where: { id },
    data: {
      ...(hodId !== undefined ? { hodId: hodId || null } : {}),
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
    include: {
      hod: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json({ department: updated })
}
