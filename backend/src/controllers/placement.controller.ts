import { Request, Response } from "express"
import { prisma } from "../config/db"

// Training Programs
export const getTrainingPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.trainingProgram.findMany({
      orderBy: { startDate: "asc" }
    })
    return res.json({ programs })
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve training programs" })
  }
}

export const createTrainingProgram = async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, trainer } = req.body
  try {
    const program = await prisma.trainingProgram.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        trainer
      }
    })
    return res.status(201).json({ program })
  } catch (error) {
    return res.status(500).json({ error: "Failed to create training program" })
  }
}

// Internships
export const getInternships = async (req: Request, res: Response) => {
  try {
    const internships = await prisma.internship.findMany({
      orderBy: { createdAt: "desc" }
    })
    return res.json({ internships })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch internships" })
  }
}

export const createInternship = async (req: Request, res: Response) => {
  const { title, companyName, description, duration, stipend, deadline } = req.body
  try {
    const internship = await prisma.internship.create({
      data: {
        title,
        companyName,
        description,
        duration,
        stipend,
        deadline: deadline ? new Date(deadline) : null
      }
    })
    return res.status(201).json({ internship })
  } catch (error) {
    return res.status(500).json({ error: "Failed to create internship" })
  }
}

// Interview Schedule
export const createInterviewSchedule = async (req: Request, res: Response) => {
  const { studentId, driveId, date, mode, location } = req.body
  try {
    const interview = await prisma.interviewSchedule.create({
      data: {
        studentId,
        driveId,
        date: new Date(date),
        mode,
        location
      }
    })
    return res.status(201).json({ interview })
  } catch (error) {
    return res.status(500).json({ error: "Failed to schedule interview" })
  }
}

// Offer Letter
export const issueOfferLetter = async (req: Request, res: Response) => {
  const { studentId, driveId, fileUrl, ctc } = req.body
  try {
    const offer = await prisma.offerLetter.create({
      data: {
        studentId,
        driveId,
        fileUrl,
        ctc,
        status: "issued"
      }
    })
    return res.status(201).json({ offer })
  } catch (error) {
    return res.status(500).json({ error: "Failed to issue offer letter" })
  }
}
