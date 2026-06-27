import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const departmentId = searchParams.get("departmentId")
  const format = searchParams.get("format") || "json"

  let data: any = {}

  switch (type) {
    case "student":
      data.students = await db.student.findMany({
        where: departmentId ? { departmentId } : undefined,
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true, code: true } },
          program: { select: { name: true } },
        },
      })
      break

    case "faculty":
      data.faculties = await db.faculty.findMany({
        where: departmentId ? { departmentId } : undefined,
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true, code: true } },
        },
      })
      break

    case "department":
      data.departments = await db.department.findMany({
        include: {
          _count: { select: { students: true, faculties: true, programs: true } },
          hod: { include: { user: { select: { name: true } } } },
        },
      })
      break

    default:
      // General overview report
      data.summary = {
        totalStudents: await db.student.count(),
        totalFaculty: await db.faculty.count(),
        totalDepartments: await db.department.count(),
        totalPrograms: await db.program.count(),
        activeStudents: await db.student.count({ where: { status: "active" } }),
        studentsByDepartment: await db.department.findMany({
          include: { _count: { select: { students: true, faculties: true } } },
        }),
      }
  }

  if (format === "csv" && type) {
    const csvData = convertToCSV(data)
    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}_report.csv"`,
      },
    })
  }

  return NextResponse.json(data)
}

function convertToCSV(data: any): string {
  const items = data.students || data.faculties || data.departments || []
  if (items.length === 0) return ""

  // Flatten for CSV
  const flatItems = items.map((item: any) => {
    const flat: any = {}
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "object" && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          flat[`${key}.${subKey}`] = subValue
        }
      } else {
        flat[key] = value
      }
    }
    return flat
  })

  const headers = Object.keys(flatItems[0])
  const csvRows = [headers.join(",")]
  for (const item of flatItems) {
    const values = headers.map(h => {
      const val = item[h]
      return typeof val === "string" && val.includes(",") ? `"${val}"` : val
    })
    csvRows.push(values.join(","))
  }
  return csvRows.join("\n")
}
