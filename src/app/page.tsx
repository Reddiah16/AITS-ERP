"use client"

import { useSession } from "next-auth/react"
import LoginPage from "@/components/auth/login-page"
import { AppLayout } from "@/components/layout/app-layout"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return <AppLayout />
}
