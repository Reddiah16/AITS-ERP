import { Request, Response } from "express"
import { prisma } from "../config/db"

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { departmentId, search } = req.query
    const where: any = {}
    if (departmentId) where.departmentId = String(departmentId)
    if (search) {
      where.OR = [
        { rollNumber: { contains: String(search), mode: "insensitive" } },
        { user: { name: { contains: String(search), mode: "insensitive" } } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        department: { select: { name: true, code: true } }
      }
    })
    return res.json({ students })
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve students" })
  }
}

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        department: true,
        program: true,
      }
    })
    if (!student) return res.status(404).json({ error: "Student not found" })
    return res.json({ student })
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve student details" })
  }
}
