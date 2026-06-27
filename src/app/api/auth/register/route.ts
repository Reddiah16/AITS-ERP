import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, rollNumber, employeeId, phone, departmentId, secretCode } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    const allowedRoles = ["student", "faculty", "hod"]
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role for registration" }, { status: 400 })
    }

    // Validate secret codes for faculty/hod (server-side only)
    if (role === "faculty") {
      if (secretCode !== process.env.FACULTY_REGISTRATION_SECRET) {
        return NextResponse.json({ error: "Invalid faculty registration code" }, { status: 403 })
      }
    }
    if (role === "hod") {
      if (secretCode !== process.env.HOD_REGISTRATION_SECRET) {
        return NextResponse.json({ error: "Invalid HOD registration code" }, { status: 403 })
      }
    }

    // Check duplicates
    const existing = await db.user.findFirst({
      where: {
        OR: [
          { email },
          ...(rollNumber ? [{ rollNumber }] : []),
          ...(employeeId ? [{ employeeId }] : []),
        ],
      },
    })
    if (existing) {
      return NextResponse.json({ error: "User with this email/roll number/employee ID already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const username = email.split("@")[0]

    // Students are auto-approved; faculty/hod need admin approval
    const isApproved = role === "student"

    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
        phone: phone || null,
        rollNumber: rollNumber || null,
        employeeId: employeeId || null,
        isActive: true,
        isApproved,
      },
    })

    // Create student/faculty profile
    if (role === "student" && rollNumber && departmentId) {
      await db.student.create({
        data: {
          userId: user.id,
          rollNumber,
          enrollmentNo: rollNumber,
          departmentId,
          semester: 1,
          year: 1,
          status: "active",
        },
      })
    } else if ((role === "faculty" || role === "hod") && employeeId && departmentId) {
      await db.faculty.create({
        data: {
          userId: user.id,
          employeeId,
          departmentId,
          status: "active",
        },
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        details: JSON.stringify({ role, email }),
      },
    })

    return NextResponse.json({
      success: true,
      message: isApproved
        ? "Account created successfully! You can now login."
        : "Registration submitted! Your account is pending approval from the administrator.",
      isApproved,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
