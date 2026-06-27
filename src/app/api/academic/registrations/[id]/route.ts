import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAuth("super_admin", "admin", "hod")
  if (error) return error

  try {
    const { status } = await req.json()
    const registration = await db.semesterRegistration.update({
      where: { id: params.id },
      data: { status }
    })
    return NextResponse.json({ registration })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 })
  }
}
