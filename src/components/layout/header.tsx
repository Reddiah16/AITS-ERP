"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useAppStore, type PageName } from "@/store/app-store"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, UserCircle, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

const pageTitles: Record<PageName, string> = {
  dashboard: "Dashboard",
  students: "Students",
  faculty: "Faculty",
  departments: "Departments",
  users: "Users",
  notifications: "Notifications",
  cms: "Content Management",
  reports: "Reports",
  profile: "My Profile",
}

export function AppHeader() {
  const { data: session } = useSession()
  const { currentPage, setCurrentPage } = useAppStore()
  const [unreadCount, setUnreadCount] = useState(0)

  const userName = session?.user?.name || "User"
  const userRole = (session?.user as any)?.role || "student"

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications?limit=1")
        if (res.ok) {
          const data = await res.json()
          // For now, just use total as a proxy - we could add a specific endpoint
          setUnreadCount(data.total || 0)
        }
      } catch {
        // Silently ignore
      }
    }
    if (session) {
      fetchUnreadCount()
    }
  }, [session])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1 text-gray-500 hover:text-gray-900" />

      <div className="flex-1 flex items-center gap-2">
        <h1 className="text-base font-semibold text-gray-900">
          {pageTitles[currentPage]}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-900"
          onClick={() => setCurrentPage("notifications")}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center bg-emerald-600 text-[9px] text-white border-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 hover:bg-gray-50">
              <Avatar className="size-7 border border-emerald-200">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px] font-medium">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {userName}
              </span>
              <ChevronDown className="size-3.5 text-gray-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCurrentPage("profile")}
              className="cursor-pointer"
            >
              <UserCircle className="size-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ redirect: false })}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
