import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { bookId, studentId, dueDate } = await req.json()
    const book = await db.libraryBook.findUnique({ where: { id: bookId } })
    if (!book || book.available < 1) {
      return NextResponse.json({ error: "Book is not available for issue" }, { status: 400 })
    }

    const [issue] = await db.$transaction([
      db.bookIssue.create({
        data: {
          bookId,
          studentId,
          dueDate: new Date(dueDate),
          status: "issued"
        }
      }),
      db.libraryBook.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } }
      })
    ])

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to issue book" }, { status: 500 })
  }
}
