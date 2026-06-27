import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/db"

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { rollNumber: identifier },
          { employeeId: identifier },
          { username: identifier },
        ]
      }
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Your account is deactivated" })
    }

    if (!user.isApproved && (user.role === "faculty" || user.role === "hod")) {
      return res.status(403).json({ error: "PENDING_APPROVAL" })
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
      { expiresIn: "7d" }
    )

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    // Log the audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        details: "User successfully authenticated via API"
      }
    })

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    return res.status(500).json({ error: "Login failed" })
  }
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, rollNumber, employeeId, departmentId, secretCode } = req.body

  try {
    // Secret code check
    if (role === "faculty" && secretCode !== process.env.FACULTY_REGISTRATION_SECRET) {
      return res.status(400).json({ error: "Invalid secret registration code for Faculty" })
    }
    if (role === "hod" && secretCode !== process.env.HOD_REGISTRATION_SECRET) {
      return res.status(400).json({ error: "Invalid secret registration code for HOD" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const username = rollNumber || employeeId || email.split("@")[0]

    // Faculty and HOD require manual admin approval
    const isApproved = role === "student"

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
        rollNumber,
        employeeId,
        isApproved,
        isActive: true,
      }
    })

    if (role === "student") {
      await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: rollNumber || username,
          enrollmentNo: rollNumber || username,
          departmentId,
          status: "active",
        }
      })
    } else {
      await prisma.faculty.create({
        data: {
          userId: user.id,
          employeeId: employeeId || username,
          departmentId,
          designation: role === "hod" ? "Professor & HOD" : "Assistant Professor",
          status: "active",
        }
      })
    }

    return res.status(201).json({
      message: role === "student" 
        ? "Registration successful! You can now log in." 
        : "Registration submitted successfully! Pending admin approval."
    })
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Username, email, or identifier already exists" })
    }
    return res.status(500).json({ error: "Registration failed" })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) return res.status(401).json({ error: "Refresh token is required" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "default_refresh_secret") as any
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: "Invalid refresh token" })
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "15m" }
    )

    return res.json({ accessToken: newAccessToken })
  } catch (error) {
    return res.status(403).json({ error: "Invalid refresh token" })
  }
}
