import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET() {
  const settings = await db.siteSetting.findMany()
  const settingsMap: Record<string, string> = {}
  for (const s of settings) {
    settingsMap[s.key] = s.value
  }
  return NextResponse.json({ settings, settingsMap })
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAuth("admin", "super_admin")
  if (error) return error

  const body = await req.json()
  const data = body.settings || body // support both formats

  const updates = Object.entries(data).map(([key, value]) =>
    db.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  )

  await Promise.all(updates)
  return NextResponse.json({ message: "Settings updated successfully" })
}
