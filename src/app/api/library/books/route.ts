import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  try {
    const books = await db.libraryBook.findMany({
      where: { isActive: true }
    })
    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch library books" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("super_admin", "admin")
  if (error) return error

  try {
    const { title, author, isbn, category, quantity } = await req.json()
    const book = await db.libraryBook.create({
      data: {
        title,
        author,
        isbn,
        category,
        quantity: parseInt(quantity),
        available: parseInt(quantity)
      }
    })
    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to register book" }, { status: 500 })
  }
}
