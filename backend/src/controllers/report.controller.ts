import { Request, Response } from "express"
import { prisma } from "../config/db"

export const exportStudentRosterCSV = async (req: Request, res: Response) => {
  const { departmentId } = req.query
  try {
    const students = await prisma.student.findMany({
      where: {
        departmentId: departmentId ? String(departmentId) : undefined
      },
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } }
      }
    })

    // Construct CSV content
    let csv = "Roll Number,Name,Email,Department,Semester,Status\n"
    for (const student of students) {
      csv += `${student.rollNumber},"${student.user.name}",${student.user.email},"${student.department?.name || ""}",${student.semester},${student.status}\n`
    }

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=student_roster_${Date.now()}.csv`)
    return res.status(200).send(csv)
  } catch (error) {
    return res.status(500).json({ error: "Failed to compile student roster CSV" })
  }
}

export const exportGradeSheetCSV = async (req: Request, res: Response) => {
  const { semester } = req.query
  try {
    const results = await prisma.semesterResult.findMany({
      where: {
        semester: semester ? parseInt(String(semester)) : undefined
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

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=gradesheet_sem_${semester || "all"}_${Date.now()}.csv`)
    return res.status(200).send(csv)
  } catch (error) {
    return res.status(500).json({ error: "Failed to export grade sheet CSV" })
  }
}
