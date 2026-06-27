import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, name: true, role: true, isActive: true, avatar: true, createdAt: true, updatedAt: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const { name, email, role, isActive, password } = body

  const data: any = {}
  if (name) data.name = name
  if (email) data.email = email
  if (role) data.role = role
  if (typeof isActive === "boolean") data.isActive = isActive
  if (password) data.password = await bcrypt.hash(password, 10)

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, username: true, email: true, name: true, role: true, isActive: true },
  })

  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ message: "User deleted" })
}
