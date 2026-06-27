"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useAppStore, type PageName } from "@/store/app-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  UserCog,
  Bell,
  FileText,
  BarChart3,
  LogOut,
  UserCircle,
  BookOpen,
  ClipboardList,
  Award,
  Ticket,
  Briefcase,
  Library,
  Image,
  ShieldCheck,
  Settings,
  Megaphone,
  CalendarCheck,
  Crown,
  Brain,
  Sparkles,
} from "lucide-react"

interface MenuItem {
  label: string
  page: PageName
  icon: React.ReactNode
  roles: string[]
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "My Profile", page: "profile", icon: <UserCircle className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Students", page: "students", icon: <GraduationCap className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty"] },
      { label: "Faculty", page: "faculty", icon: <Users className="size-4" />, roles: ["super_admin", "admin", "hod"] },
      { label: "HOD Management", page: "hod-management", icon: <Crown className="size-4" />, roles: ["super_admin", "admin"] },
      { label: "Departments", page: "departments", icon: <Building2 className="size-4" />, roles: ["super_admin", "admin", "hod"] },
      { label: "Subjects", page: "subjects", icon: <BookOpen className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty"] },
      { label: "Attendance", page: "attendance", icon: <CalendarCheck className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Academic Calendar", page: "academic-calendar", icon: <Calendar className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Timetable", page: "timetable", icon: <CalendarCheck className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Semester Registration", page: "semester-registration", icon: <GraduationCap className="size-4" />, roles: ["super_admin", "admin", "hod", "student"] },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Notifications", page: "notifications", icon: <Bell className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Circulars", page: "circulars", icon: <Megaphone className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
    ],
  },
  {
    label: "Examination",
    items: [
      { label: "Internal Marks", page: "marks", icon: <ClipboardList className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Results & GPA", page: "results", icon: <Award className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "Hall Tickets", page: "hall-tickets", icon: <Ticket className="size-4" />, roles: ["super_admin", "admin", "student"] },
      { label: "Official Transcript", page: "transcript", icon: <FileText className="size-4" />, roles: ["super_admin", "admin", "student"] },
    ],
  },
  {
    label: "Placement",
    items: [
      { label: "Placement", page: "placement", icon: <Briefcase className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Library", page: "library", icon: <Library className="size-4" />, roles: ["super_admin", "admin", "faculty", "student"] },
    ],
  },
  {
    label: "Campus",
    items: [
      { label: "Gallery", page: "gallery", icon: <Image className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
    ],
  },
  {
    label: "AI Features",
    items: [
      { label: "AI Analytics", page: "ai-analytics", icon: <Sparkles className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
      { label: "AI Assistant", page: "ai-assistant", icon: <Brain className="size-4" />, roles: ["super_admin", "admin", "hod", "faculty", "student"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "User Management", page: "users", icon: <UserCog className="size-4" />, roles: ["super_admin", "admin"] },
      { label: "Reports", page: "reports", icon: <BarChart3 className="size-4" />, roles: ["super_admin", "admin", "hod"] },
      { label: "Audit Logs", page: "audit-logs", icon: <ShieldCheck className="size-4" />, roles: ["super_admin", "admin"] },
      { label: "CMS", page: "cms", icon: <FileText className="size-4" />, roles: ["super_admin", "admin"] },
      { label: "Settings", page: "settings", icon: <Settings className="size-4" />, roles: ["super_admin", "admin"] },
    ],
  },
]

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  hod: "bg-amber-100 text-amber-700",
  faculty: "bg-green-100 text-green-700",
  student: "bg-sky-100 text-sky-700",
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hod: "HOD",
  faculty: "Faculty",
  student: "Student",
}

export function AppSidebar() {
  const { data: session } = useSession()
  const { currentPage, setCurrentPage } = useAppStore()
  const { setOpenMobile } = useSidebar()

  const userRole = (session?.user as any)?.role || "student"
  const userName = session?.user?.name || "User"

  const handleNavigation = (page: PageName) => {
    setCurrentPage(page)
    setOpenMobile(false)
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-blue-100/50">
      {/* Header - AITS Branding */}
      <SidebarHeader className="p-0">
        <div className="flex items-center gap-2 p-3 group-data-[collapsible=icon]:justify-center bg-gradient-to-r from-[#1a3a6b] to-[#1e4d8c]">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#f5a623] shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-bold text-white leading-tight">AITS Rajampet</h2>
            <p className="text-[10px] text-blue-200 leading-tight">ERP Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="overflow-x-hidden">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(userRole))
          if (visibleItems.length === 0) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-[#1a3a6b]/50">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.page}>
                      <SidebarMenuButton
                        isActive={currentPage === item.page}
                        onClick={() => handleNavigation(item.page)}
                        tooltip={item.label}
                        className={
                          currentPage === item.page
                            ? "bg-[#1a3a6b]/10 text-[#1a3a6b] hover:bg-[#1a3a6b]/15 hover:text-[#1a3a6b] font-semibold border-r-2 border-[#f5a623] rounded-r-none"
                            : "text-gray-600 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/5"
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 border-2 border-[#f5a623]/50 shrink-0">
              <AvatarFallback className="bg-[#1a3a6b] text-white text-xs font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold truncate text-gray-900">{userName}</p>
              <Badge className={`text-[9px] px-1.5 py-0 mt-0.5 border-0 ${roleColors[userRole] || "bg-gray-100 text-gray-600"}`}>
                {roleLabels[userRole] || userRole}
              </Badge>
            </div>
            <button
              onClick={() => signOut({ redirect: false })}
              className="group-data-[collapsible=icon]:hidden p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
          <SidebarMenu className="mt-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign Out"
                onClick={() => signOut({ redirect: false })}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
