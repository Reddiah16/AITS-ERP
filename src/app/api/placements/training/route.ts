import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const programs = await db.trainingProgram.findMany({
      orderBy: { startDate: "asc" }
    })
    return NextResponse.json({ programs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve training programs" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { title, description, startDate, endDate, trainer } = await req.json()
    const program = await db.trainingProgram.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        trainer
      }
    })
    return NextResponse.json({ program }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create training program" }, { status: 500 })
  }
}
