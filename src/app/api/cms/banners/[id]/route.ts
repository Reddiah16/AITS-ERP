import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  const body = await req.json()

  const data: any = {}
  if (body.title !== undefined) data.title = body.title
  if (body.subtitle !== undefined) data.subtitle = body.subtitle
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.order !== undefined) data.order = body.order

  const banner = await db.heroBanner.update({ where: { id }, data })
  return NextResponse.json(banner)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { id } = await params
  await db.heroBanner.delete({ where: { id } })
  return NextResponse.json({ message: "Banner deleted" })
}
