import { create } from "zustand"

export type PageName =
  // Core
  | "dashboard"
  | "profile"
  // Academic
  | "students"
  | "faculty"
  | "hod-management"
  | "departments"
  | "subjects"
  | "attendance"
  // Communication
  | "notifications"
  | "circulars"
  // Examination
  | "marks"
  | "results"
  | "hall-tickets"
  // Placement
  | "placement"
  // Library
  | "library"
  // Gallery
  | "gallery"
  // AI Features
  | "ai-analytics"
  | "ai-assistant"
  // Administration
  | "users"
  | "reports"
  | "audit-logs"
  | "cms"
  | "settings"

interface AppState {
  currentPage: PageName
  sidebarOpen: boolean
  selectedId: string | null
  setCurrentPage: (page: PageName) => void
  setSidebarOpen: (open: boolean) => void
  setSelectedId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "dashboard",
  sidebarOpen: true,
  selectedId: null,
  setCurrentPage: (page) => set({ currentPage: page, selectedId: null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedId: (id) => set({ selectedId: id }),
}))
