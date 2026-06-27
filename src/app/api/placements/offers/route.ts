import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { studentId, driveId, fileUrl, ctc } = await req.json()
    const offer = await db.offerLetter.create({
      data: {
        studentId,
        driveId,
        fileUrl,
        ctc,
        status: "issued"
      }
    })
    return NextResponse.json({ offer }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to issue offer letter" }, { status: 500 })
  }
}
