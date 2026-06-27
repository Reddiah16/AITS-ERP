import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin", "hod")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")

  try {
    const students = await db.student.findMany({
      where: {
        departmentId: departmentId && departmentId !== "all" ? departmentId : undefined
      },
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } }
      }
    })

    let csv = "Roll Number,Name,Email,Department,Semester,Status\n"
    for (const student of students) {
      csv += `${student.rollNumber},"${student.user.name}",${student.user.email},"${student.department?.name || ""}",${student.semester},${student.status}\n`
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=student_roster_${Date.now()}.csv`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to compile student roster CSV" }, { status: 500 })
  }
}
