import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET() {
  const banners = await db.heroBanner.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const body = await req.json()
  const { title, subtitle, imageUrl, isActive, order } = body

  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Title and imageUrl are required" }, { status: 400 })
  }

  const banner = await db.heroBanner.create({
    data: { title, subtitle: subtitle || null, imageUrl, isActive: isActive ?? true, order: order || 0 },
  })

  return NextResponse.json(banner, { status: 201 })
}
