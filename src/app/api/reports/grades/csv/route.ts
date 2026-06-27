import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin", "hod")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const semester = searchParams.get("semester")

  try {
    const results = await db.semesterResult.findMany({
      where: {
        semester: semester ? parseInt(semester) : undefined
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    })

    let csv = "Student Name,Roll Number,Semester,SGPA,Status\n"
    for (const res of results) {
      csv += `"${res.student.user.name}",${res.student.rollNumber},${res.semester},${res.sgpa || 0.0},${res.status}\n`
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=gradesheet_sem_${semester || "all"}_${Date.now()}.csv`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to export grade sheet CSV" }, { status: 500 })
  }
}
