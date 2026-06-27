import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const internships = await db.internship.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ internships })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch internships" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { title, companyName, description, duration, stipend, deadline } = await req.json()
    const internship = await db.internship.create({
      data: {
        title,
        companyName,
        description,
        duration,
        stipend,
        deadline: deadline ? new Date(deadline) : null
      }
    })
    return NextResponse.json({ internship }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create internship" }, { status: 500 })
  }
}
