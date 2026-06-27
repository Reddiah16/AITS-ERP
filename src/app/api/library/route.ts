import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  try {
    const [books, issues] = await Promise.all([
      db.libraryBook.findMany({
        where: { isActive: true, ...(category ? { category } : {}) },
        include: { _count: { select: { issues: true } } },
        orderBy: { title: "asc" },
      }),
      db.bookIssue.findMany({
        where: { status: "issued" },
        include: {
          book: { select: { title: true, author: true } },
          student: { include: { user: { select: { name: true } } } },
        },
        orderBy: { issueDate: "desc" },
        take: 20,
      }),
    ])

    return NextResponse.json({ books, issues })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch library data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role

  try {
    const body = await req.json()
    const { type } = body

    if (type === "issue") {
      if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14) // 14 day lending period

      const issue = await db.bookIssue.create({
        data: { bookId: body.bookId, studentId: body.studentId, dueDate, status: "issued" },
      })
      await db.libraryBook.update({ where: { id: body.bookId }, data: { available: { decrement: 1 } } })
      return NextResponse.json({ issue })
    }

    if (type === "return") {
      if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const issue = await db.bookIssue.findUnique({ where: { id: body.issueId } })
      if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 })

      const returnDate = new Date()
      const fine = issue.dueDate < returnDate ? Math.ceil((returnDate.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24)) * 2 : 0

      await db.bookIssue.update({ where: { id: body.issueId }, data: { returnDate, fine, status: "returned" } })
      await db.libraryBook.update({ where: { id: issue.bookId }, data: { available: { increment: 1 } } })
      return NextResponse.json({ success: true, fine })
    }

    if (type === "add_book") {
      if (!["super_admin", "admin"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      const book = await db.libraryBook.create({
        data: { title: body.title, author: body.author, isbn: body.isbn, publisher: body.publisher, category: body.category, quantity: body.quantity || 1, available: body.quantity || 1 },
      })
      return NextResponse.json({ book })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
