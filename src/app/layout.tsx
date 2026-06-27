import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import AuthSessionProvider from "@/components/providers/session-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CDMS - College Department Management System",
  description: "A comprehensive College Department Management System for streamlining academic administration.",
  keywords: ["CDMS", "College", "Department", "Management", "Education", "Academic"],
  icons: {
    icon: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
