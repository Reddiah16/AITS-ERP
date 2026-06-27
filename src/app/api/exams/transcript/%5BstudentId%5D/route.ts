import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  const { error } = await requireAuth("super_admin", "admin", "student")
  if (error) return error

  try {
    const student = await db.student.findUnique({
      where: { id: params.studentId },
      include: {
        user: { select: { name: true, rollNumber: true, email: true } },
        department: { select: { name: true } },
        semesterResults: { orderBy: { semester: "asc" } },
        internalMarks: { include: { subject: { select: { name: true, credits: true } } } }
      }
    })

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    return NextResponse.json({
      college: "Annamacharya Institute of Technology & Sciences, Rajampet",
      title: "Official Academic Transcript",
      studentName: student.user.name,
      rollNumber: student.rollNumber,
      department: student.department?.name,
      results: student.semesterResults,
      marks: student.internalMarks
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to compile academic transcript" }, { status: 500 })
  }
}
