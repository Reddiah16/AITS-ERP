import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { issueId } = await req.json()
    const issue = await db.bookIssue.findUnique({ where: { id: issueId } })
    if (!issue || issue.status === "returned") {
      return NextResponse.json({ error: "Invalid issue record" }, { status: 400 })
    }

    const today = new Date()
    const dueDate = new Date(issue.dueDate)
    let fine = 0
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      fine = diffDays * 2 // ₹2 per day
    }

    const [updatedIssue] = await db.$transaction([
      db.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate: today,
          status: "returned",
          fine
        }
      }),
      db.libraryBook.update({
        where: { id: issue.bookId },
        data: { available: { increment: 1 } }
      })
    ])

    return NextResponse.json({ issue: updatedIssue, fineCalculated: fine })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process book return" }, { status: 500 })
  }
}
