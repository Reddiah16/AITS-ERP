import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../config/db"

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    name: string
  }
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access: Bearer token missing" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret") as any
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Account is inactive or does not exist" })
    }

    if (!user.isApproved && (user.role === "faculty" || user.role === "hod")) {
      return res.status(403).json({ error: "Account registration is pending administrator approval" })
    }

    req.user = { id: user.id, role: user.role, name: user.name }
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid access token" })
  }
}

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden: insufficient permissions" })
    }
    next()
  }
}
