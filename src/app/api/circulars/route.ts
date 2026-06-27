import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as any).role

  try {
    const where: any = { isActive: true }
    if (role === "student") {
      where.OR = [{ targetRole: null }, { targetRole: "student" }]
    } else if (role === "faculty") {
      where.OR = [{ targetRole: null }, { targetRole: "faculty" }]
    } else if (role === "hod") {
      where.OR = [{ targetRole: null }, { targetRole: "hod" }, { targetRole: "faculty" }]
    }

    const circulars = await db.circular.findMany({
      where,
      include: { issuedBy: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ circulars })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch circulars" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id

  if (!["super_admin", "admin", "hod"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, content, type, targetRole, fileUrl } = body
    if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 })

    const circular = await db.circular.create({
      data: { title, content, type: type || "general", targetRole: targetRole || null, fileUrl: fileUrl || null, issuedById: userId },
    })

    await db.auditLog.create({
      data: { userId, action: "CREATE", entity: "Circular", entityId: circular.id, details: JSON.stringify({ title }) },
    })

    return NextResponse.json({ circular })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create circular" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await db.circular.update({ where: { id }, data: { isActive: false } })
    await db.auditLog.create({ data: { userId, action: "DELETE", entity: "Circular", entityId: id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete circular" }, { status: 500 })
  }
}
