import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  try {
    const images = await db.galleryImage.findMany({
      where: {
        category: category && category !== "all" ? category : undefined,
        isActive: true
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { title, description, imageUrl, category, departmentId } = await req.json()
    const image = await db.galleryImage.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        departmentId
      }
    })
    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload image record" }, { status: 500 })
  }
}
