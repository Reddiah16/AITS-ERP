import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email / Roll Number / Employee ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const identifier = credentials.identifier.trim()

        // Try to find user by email, username, rollNumber, or employeeId
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
              { rollNumber: identifier },
              { employeeId: identifier },
            ],
          },
        })

        if (!user || !user.isActive) {
          return null
        }

        // Check if account needs approval
        if (!user.isApproved && user.role !== "student") {
          throw new Error("PENDING_APPROVAL")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        // Log login audit
        try {
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              details: JSON.stringify({ identifier }),
            },
          })
        } catch { /* non-critical */ }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userRole = (user as any).role
        token.userName = (user as any).username
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).userRole
        ;(session.user as any).username = (token as any).userName
        ;(session.user as any).id = (token as any).userId
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "aits-erp-secret-change-in-production",
}
