import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin", "hod")
  if (error) return error

  try {
    const registrations = await db.semesterRegistration.findMany({
      include: {
        student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } }
      }
    })
    return NextResponse.json({ registrations })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
