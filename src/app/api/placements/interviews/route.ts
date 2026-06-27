import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { studentId, driveId, date, mode, location } = await req.json()
    const interview = await db.interviewSchedule.create({
      data: {
        studentId,
        driveId,
        date: new Date(date),
        mode,
        location
      }
    })
    return NextResponse.json({ interview }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 })
  }
}
