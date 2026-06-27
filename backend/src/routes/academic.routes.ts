import { Router } from "express"
import {
  getAcademicCalendar, createAcademicCalendarEvent,
  getTimetable, createTimetableSlot,
  registerSemester, getRegistrations, approveRegistration
} from "../controllers/academic.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

// Calendar
router.get("/calendar", getAcademicCalendar)
router.post("/calendar", restrictTo("super_admin", "admin"), createAcademicCalendarEvent)

// Timetable
router.get("/timetable", getTimetable)
router.post("/timetable", restrictTo("super_admin", "admin", "hod"), createTimetableSlot)

// Registrations
router.post("/register-semester", restrictTo("student"), registerSemester)
router.get("/registrations", restrictTo("super_admin", "admin", "hod"), getRegistrations)
router.put("/registrations/:id", restrictTo("super_admin", "admin", "hod"), approveRegistration)

export default router
