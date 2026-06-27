import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("admin", "faculty", "student")
  if (error) return error

  const { id } = await params
  const userId = (session?.user as any)?.id

  await db.notificationRecipient.updateMany({
    where: { notificationId: id, userId },
    data: { isRead: true, readAt: new Date() },
  })

  return NextResponse.json({ message: "Marked as read" })
}
