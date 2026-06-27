import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [companies, drives] = await Promise.all([
      db.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      db.placementDrive.findMany({
        include: { company: true, _count: { select: { applications: true } } },
        orderBy: { driveDate: "desc" },
      }),
    ])
    return NextResponse.json({ companies, drives })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch placement data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  const userId = (session.user as any).id

  try {
    const body = await req.json()
    const { type } = body

    if (type === "apply") {
      // Student applies for a drive
      const student = await db.student.findUnique({ where: { userId } })
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

      const app = await db.placementApplication.upsert({
        where: { studentId_driveId: { studentId: student.id, driveId: body.driveId } },
        update: {},
        create: { studentId: student.id, driveId: body.driveId, resumeUrl: body.resumeUrl },
      })
      return NextResponse.json({ application: app })
    }

    if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    if (type === "company") {
      const company = await db.company.create({ data: { name: body.name, industry: body.industry, website: body.website } })
      return NextResponse.json({ company })
    }

    if (type === "drive") {
      const drive = await db.placementDrive.create({
        data: {
          companyId: body.companyId, title: body.title, description: body.description,
          driveDate: new Date(body.driveDate), eligibility: body.eligibility,
          ctcOffered: body.ctcOffered, location: body.location, status: body.status || "upcoming",
        },
      })
      return NextResponse.json({ drive })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
