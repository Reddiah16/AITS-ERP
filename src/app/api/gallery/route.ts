import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  try {
    const images = await db.galleryImage.findMany({
      where: { isActive: true, ...(category ? { category } : {}) },
      include: { department: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id
  if (!["super_admin", "admin", "hod"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const image = await db.galleryImage.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        category: body.category || "campus",
        departmentId: body.departmentId || null,
        uploadedById: userId,
      },
    })
    return NextResponse.json({ image })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}
