import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth("admin", "faculty", "student")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const userId = (session?.user as any)?.id
  const role = (session?.user as any)?.role

  if (role === "admin") {
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        include: { _count: { select: { recipients: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.notification.count(),
    ])
    return NextResponse.json({ notifications, total, page, limit })
  }

  // For faculty/students - get their notifications
  const [recipients, total] = await Promise.all([
    db.notificationRecipient.findMany({
      where: { userId },
      include: { notification: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { notification: { createdAt: "desc" } },
    }),
    db.notificationRecipient.count({ where: { userId } }),
  ])

  return NextResponse.json({
    notifications: recipients.map(r => ({ ...r.notification, isRead: r.isRead, readAt: r.readAt })),
    total,
    page,
    limit,
  })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("admin")
  if (error) return error

  const body = await req.json()
  const { title, message, type, targetRole } = body

  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
  }

  const userId = (session?.user as any)?.id
  const notification = await db.notification.create({
    data: { title, message, type: type || "info", targetRole: targetRole || null, createdBy: userId },
  })

  // Assign to target users
  const users = targetRole
    ? await db.user.findMany({ where: { role: targetRole, isActive: true }, select: { id: true } })
    : await db.user.findMany({ where: { isActive: true }, select: { id: true } })

  await db.notificationRecipient.createMany({
    data: users.map(u => ({ notificationId: notification.id, userId: u.id })),
  })

  return NextResponse.json(notification, { status: 201 })
}
