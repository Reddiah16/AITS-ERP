import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role
  if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const filterRole = searchParams.get("role")
  const search = searchParams.get("search")
  const pending = searchParams.get("pending") === "true"

  try {
    const where: any = {}
    if (filterRole) where.role = filterRole
    if (pending) where.isApproved = false
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
        { rollNumber: { contains: search } },
        { employeeId: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true, username: true, email: true, name: true, role: true,
        isActive: true, isApproved: true, phone: true, rollNumber: true,
        employeeId: true, createdAt: true,
        student: { select: { rollNumber: true, semester: true, department: { select: { name: true } } } },
        faculty: { select: { designation: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { username, email, password, name, userRole } = body
    if (!username || !email || !password || !name || !userRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await db.user.create({
      data: { username, email, password: hashedPassword, name, role: userRole, isActive: true, isApproved: true },
    })

    return NextResponse.json({ user: { id: user.id, username: user.username, email: user.email, name: user.name, role: user.role } })
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { id, action } = body

    if (action === "approve") {
      await db.user.update({ where: { id }, data: { isApproved: true } })
      await db.auditLog.create({ data: { userId, action: "UPDATE", entity: "User", entityId: id, details: JSON.stringify({ action: "approved" }) } })
      return NextResponse.json({ success: true, message: "User approved" })
    }

    if (action === "toggle_active") {
      const user = await db.user.findUnique({ where: { id } })
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      await db.user.update({ where: { id }, data: { isActive: !user.isActive } })
      return NextResponse.json({ success: true })
    }

    if (action === "change_role") {
      // Only super_admin can change roles
      if (role !== "super_admin") return NextResponse.json({ error: "Only Super Admin can change roles" }, { status: 403 })
      await db.user.update({ where: { id }, data: { role: body.newRole } })
      return NextResponse.json({ success: true })
    }

    const { name, phone } = body
    await db.user.update({ where: { id }, data: { name, phone } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
