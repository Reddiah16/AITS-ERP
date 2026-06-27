import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

type Role = "super_admin" | "admin" | "hod" | "faculty" | "student"

export async function requireAuth(...roles: Role[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null }
  }
  const userRole = (session.user as any).role as string
  if (roles.length > 0 && !roles.includes(userRole as Role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null }
  }
  return { error: null, session }
}
