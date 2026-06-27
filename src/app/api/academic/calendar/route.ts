import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const events = await db.academicCalendarEvent.findMany({
      orderBy: { startDate: "asc" }
    })
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve calendar events" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { title, description, startDate, endDate, type } = await req.json()
    const event = await db.academicCalendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type
      }
    })
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}
