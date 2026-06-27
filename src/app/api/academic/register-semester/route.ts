import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("student")
  if (error) return error

  try {
    const { studentId, semester, academicYear } = await req.json()
    const registration = await db.semesterRegistration.create({
      data: {
        studentId,
        semester: parseInt(semester),
        academicYear,
        status: "pending"
      }
    })
    return NextResponse.json({ registration }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit semester registration" }, { status: 500 })
  }
}
