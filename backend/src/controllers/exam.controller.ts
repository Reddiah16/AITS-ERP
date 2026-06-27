import { Request, Response } from "express"
import { prisma } from "../config/db"

// Internal Marks
export const submitInternalMarks = async (req: Request, res: Response) => {
  const { studentId, subjectId, examType, marks, maxMarks, enteredById } = req.body
  try {
    const mark = await prisma.internalMark.upsert({
      where: {
        studentId_subjectId_examType: { studentId, subjectId, examType }
      },
      update: { marks: parseFloat(marks), maxMarks: parseFloat(maxMarks) },
      create: { studentId, subjectId, examType, marks: parseFloat(marks), maxMarks: parseFloat(maxMarks), enteredById }
    })
    return res.json({ mark })
  } catch (error) {
    return res.status(500).json({ error: "Failed to record internal marks" })
  }
}

// Semester Results & GPA/CGPA Calculations
export const publishSemesterResult = async (req: Request, res: Response) => {
  const { studentId, semester, gpa, sgpa, status } = req.body
  try {
    // 1. Save results
    const result = await prisma.semesterResult.upsert({
      where: {
        studentId_semester: { studentId, semester: parseInt(semester) }
      },
      update: { gpa: parseFloat(gpa), sgpa: parseFloat(sgpa), status },
      create: { studentId, semester: parseInt(semester), gpa: parseFloat(gpa), sgpa: parseFloat(sgpa), status }
    })

    // 2. Auto CGPA Calculation
    const allResults = await prisma.semesterResult.findMany({
      where: { studentId }
    })
    const validSgpas = allResults.filter(r => r.sgpa !== null).map(r => r.sgpa as number)
    const cgpa = validSgpas.length > 0 ? (validSgpas.reduce((a, b) => a + b, 0) / validSgpas.length) : null

    // Update student's CGPA or status if needed (we can return cgpa to the client)
    return res.json({ result, cgpa: cgpa ? parseFloat(cgpa.toFixed(2)) : null })
  } catch (error) {
    return res.status(500).json({ error: "Failed to publish semester results" })
  }
}

// Hall Ticket
export const generateHallTicket = async (req: Request, res: Response) => {
  const { studentId, semester, examMonth } = req.body
  try {
    const ticket = await prisma.hallTicket.upsert({
      where: {
        studentId_semester_examMonth: { studentId, semester: parseInt(semester), examMonth }
      },
      update: { isGenerated: true, generatedAt: new Date() },
      create: { studentId, semester: parseInt(semester), examMonth, isGenerated: true, generatedAt: new Date() }
    })
    return res.json({ ticket })
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate hall ticket" })
  }
}

// Result Analytics
export const getResultAnalytics = async (req: Request, res: Response) => {
  const { departmentId, semester } = req.query
  try {
    const results = await prisma.semesterResult.findMany({
      where: {
        semester: semester ? parseInt(String(semester)) : undefined,
        student: departmentId ? { departmentId: String(departmentId) } : undefined
      },
      include: {
        student: { include: { user: { select: { name: true } } } }
      }
    })

    // Calculate distributions
    const total = results.length
    const passes = results.filter(r => r.status === "pass").length
    const fails = results.filter(r => r.status === "fail").length
    const passPercentage = total > 0 ? parseFloat(((passes / total) * 100).toFixed(2)) : 0

    return res.json({
      total,
      passes,
      fails,
      passPercentage,
      results
    })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch analytics" })
  }
}

// Export Transcript
export const exportTranscript = async (req: Request, res: Response) => {
  const { studentId } = req.params
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, rollNumber: true, email: true } },
        department: { select: { name: true } },
        semesterResults: { orderBy: { semester: "asc" } },
        internalMarks: { include: { subject: { select: { name: true, credits: true } } } }
      }
    })

    if (!student) return res.status(404).json({ error: "Student not found" })

    // Build plain transcript JSON response (PDF generator will format on frontend or client side)
    return res.json({
      college: "Annamacharya Institute of Technology & Sciences, Rajampet",
      title: "Official Academic Transcript",
      studentName: student.user.name,
      rollNumber: student.rollNumber,
      department: student.department?.name,
      results: student.semesterResults,
      marks: student.internalMarks
    })
  } catch (error) {
    return res.status(500).json({ error: "Failed to compile academic transcript" })
  }
}
