import { z } from "zod"

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, "Username, email or ID is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
})

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "faculty", "hod"]),
    rollNumber: z.string().optional(),
    employeeId: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    secretCode: z.string().optional(),
  })
})
