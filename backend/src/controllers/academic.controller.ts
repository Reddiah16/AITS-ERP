import { Request, Response } from "express"
import { prisma } from "../config/db"

// Academic Calendar
export const getAcademicCalendar = async (req: Request, res: Response) => {
  try {
    const events = await prisma.academicCalendarEvent.findMany({
      orderBy: { startDate: "asc" }
    })
    return res.json({ events })
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve calendar events" })
  }
}

export const createAcademicCalendarEvent = async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, type } = req.body
  try {
    const event = await prisma.academicCalendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type
      }
    })
    return res.status(201).json({ event })
  } catch (error) {
    return res.status(500).json({ error: "Failed to create calendar event" })
  }
}

// Timetable
export const getTimetable = async (req: Request, res: Response) => {
  const { departmentId, semester, section } = req.query
  try {
    const slots = await prisma.timetableSlot.findMany({
      where: {
        departmentId: departmentId ? String(departmentId) : undefined,
        semester: semester ? parseInt(String(semester)) : undefined,
        section: section ? String(section) : undefined
      },
      include: {
        subject: { select: { name: true, code: true } },
        faculty: { include: { user: { select: { name: true } } } }
      },
      orderBy: { startTime: "asc" }
    })
    return res.json({ slots })
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve timetable slots" })
  }
}

export const createTimetableSlot = async (req: Request, res: Response) => {
  const { dayOfWeek, startTime, endTime, subjectId, facultyId, classroom, section, semester, departmentId } = req.body
  try {
    const slot = await prisma.timetableSlot.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        subjectId,
        facultyId,
        classroom,
        section,
        semester: parseInt(semester),
        departmentId
      }
    })
    return res.status(201).json({ slot })
  } catch (error) {
    return res.status(500).json({ error: "Failed to create timetable slot" })
  }
}

// Semester Registration
export const registerSemester = async (req: Request, res: Response) => {
  const { studentId, semester, academicYear } = req.body
  try {
    const registration = await prisma.semesterRegistration.create({
      data: {
        studentId,
        semester: parseInt(semester),
        academicYear,
        status: "pending"
      }
    })
    return res.status(201).json({ registration })
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit semester registration" })
  }
}

export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const registrations = await prisma.semesterRegistration.findMany({
      include: {
        student: { include: { user: { select: { name: true } }, department: { select: { name: true } } } }
      }
    })
    return res.json({ registrations })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch registrations" })
  }
}

export const approveRegistration = async (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body // approved or rejected
  try {
    const registration = await prisma.semesterRegistration.update({
      where: { id },
      data: { status }
    })
    return res.json({ registration })
  } catch (error) {
    return res.status(500).json({ error: "Failed to update registration status" })
  }
}
