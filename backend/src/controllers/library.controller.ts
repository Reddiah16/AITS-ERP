import { Request, Response } from "express"
import { prisma } from "../config/db"

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.libraryBook.findMany({
      where: { isActive: true }
    })
    return res.json({ books })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch library books" })
  }
}

export const createBook = async (req: Request, res: Response) => {
  const { title, author, isbn, category, quantity } = req.body
  try {
    const book = await prisma.libraryBook.create({
      data: {
        title,
        author,
        isbn,
        category,
        quantity: parseInt(quantity),
        available: parseInt(quantity)
      }
    })
    return res.status(201).json({ book })
  } catch (error) {
    return res.status(500).json({ error: "Failed to register book" })
  }
}

export const issueBook = async (req: Request, res: Response) => {
  const { bookId, studentId, dueDate } = req.body
  try {
    const book = await prisma.libraryBook.findUnique({ where: { id: bookId } })
    if (!book || book.available < 1) {
      return res.status(400).json({ error: "Book is not available for issue" })
    }

    const [issue] = await prisma.$transaction([
      prisma.bookIssue.create({
        data: {
          bookId,
          studentId,
          dueDate: new Date(dueDate),
          status: "issued"
        }
      }),
      prisma.libraryBook.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } }
      })
    ])

    return res.status(201).json({ issue })
  } catch (error) {
    return res.status(500).json({ error: "Failed to issue book" })
  }
}

export const returnBook = async (req: Request, res: Response) => {
  const { issueId } = req.body
  try {
    const issue = await prisma.bookIssue.findUnique({ where: { id: issueId } })
    if (!issue || issue.status === "returned") {
      return res.status(400).json({ error: "Invalid issue record" })
    }

    // Auto-calculate ₹2 per day fine if overdue
    const today = new Date()
    const dueDate = new Date(issue.dueDate)
    let fine = 0
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      fine = diffDays * 2 // ₹2 per day
    }

    const [updatedIssue] = await prisma.$transaction([
      prisma.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate: today,
          status: "returned",
          fine
        }
      }),
      prisma.libraryBook.update({
        where: { id: issue.bookId },
        data: { available: { increment: 1 } }
      })
    ])

    return res.json({ issue: updatedIssue, fineCalculated: fine })
  } catch (error) {
    return res.status(500).json({ error: "Failed to process book return" })
  }
}
