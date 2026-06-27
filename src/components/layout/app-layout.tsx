"use client"

import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAppStore } from "@/store/app-store"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { StudentsPage } from "@/components/dashboard/students-page"
import { FacultyPage } from "@/components/dashboard/faculty-page"
import { DepartmentsPage } from "@/components/dashboard/departments-page"
import { UsersPage } from "@/components/dashboard/users-page"
import { NotificationsPage } from "@/components/dashboard/notifications-page"
import { CmsPage } from "@/components/dashboard/cms-page"
import { ReportsPage } from "@/components/dashboard/reports-page"
import { ProfilePage } from "@/components/dashboard/profile-page"
import { SubjectsPage } from "@/components/dashboard/subjects-page"
import { AttendancePage } from "@/components/dashboard/attendance-page"
import { CircularsPage } from "@/components/dashboard/circulars-page"
import { MarksPage } from "@/components/dashboard/marks-page"
import { ResultsPage } from "@/components/dashboard/results-page"
import { HallTicketsPage } from "@/components/dashboard/hall-tickets-page"
import { PlacementPage } from "@/components/dashboard/placement-page"
import { LibraryPage } from "@/components/dashboard/library-page"
import { GalleryPage } from "@/components/dashboard/gallery-page"
import { AuditLogsPage } from "@/components/dashboard/audit-logs-page"
import { SettingsPage } from "@/components/dashboard/settings-page"
import { HodManagementPage } from "@/components/dashboard/hod-management-page"
import { AiAnalyticsPage } from "@/components/dashboard/ai-analytics-page"
import { AiAssistantPage } from "@/components/dashboard/ai-assistant-page"
import { AcademicCalendarPage } from "@/components/dashboard/academic-calendar-page"
import { TimetablePage } from "@/components/dashboard/timetable-page"
import { SemesterRegistrationPage } from "@/components/dashboard/semester-registration-page"
import { TranscriptPage } from "@/components/dashboard/transcript-page"


function PageContent() {
  const { currentPage } = useAppStore()

  switch (currentPage) {
    case "dashboard": return <DashboardPage />
    case "students": return <StudentsPage />
    case "faculty": return <FacultyPage />
    case "hod-management": return <HodManagementPage />
    case "departments": return <DepartmentsPage />
    case "subjects": return <SubjectsPage />
    case "attendance": return <AttendancePage />
    case "notifications": return <NotificationsPage />
    case "circulars": return <CircularsPage />
    case "marks": return <MarksPage />
    case "results": return <ResultsPage />
    case "hall-tickets": return <HallTicketsPage />
    case "placement": return <PlacementPage />
    case "library": return <LibraryPage />
    case "gallery": return <GalleryPage />
    case "ai-analytics": return <AiAnalyticsPage />
    case "ai-assistant": return <AiAssistantPage />
    case "academic-calendar": return <AcademicCalendarPage />
    case "timetable": return <TimetablePage />
    case "semester-registration": return <SemesterRegistrationPage />
    case "transcript": return <TranscriptPage />
    case "users": return <UsersPage />
    case "reports": return <ReportsPage />
    case "audit-logs": return <AuditLogsPage />
    case "cms": return <CmsPage />
    case "settings": return <SettingsPage />
    case "profile": return <ProfilePage />
    default: return <DashboardPage />
  }
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto bg-gray-50/50">
          <PageContent />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
