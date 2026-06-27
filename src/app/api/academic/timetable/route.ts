import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")
  const semester = searchParams.get("semester")
  const section = searchParams.get("section")

  try {
    const slots = await db.timetableSlot.findMany({
      where: {
        departmentId: departmentId && departmentId !== "all" ? departmentId : undefined,
        semester: semester ? parseInt(semester) : undefined,
        section: section || undefined
      },
      include: {
        subject: { select: { name: true, code: true } },
        faculty: { include: { user: { select: { name: true } } } }
      },
      orderBy: { startTime: "asc" }
    })
    return NextResponse.json({ slots })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve timetable slots" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin", "hod")
  if (error) return error

  try {
    const { dayOfWeek, startTime, endTime, subjectId, facultyId, classroom, section, semester, departmentId } = await req.json()
    const slot = await db.timetableSlot.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        subjectId,
        facultyId,
        classroom,
        section,
        semester: parseInt(semester),
        departmentId
      }
    })
    return NextResponse.json({ slot }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create timetable slot" }, { status: 500 })
  }
}
