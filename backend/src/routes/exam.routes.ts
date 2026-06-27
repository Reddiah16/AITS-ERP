import { Router } from "express"
import {
  submitInternalMarks, publishSemesterResult,
  generateHallTicket, getResultAnalytics, exportTranscript
} from "../controllers/exam.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.post("/internal-marks", restrictTo("super_admin", "admin", "hod", "faculty"), submitInternalMarks)
router.post("/publish-results", restrictTo("super_admin", "admin"), publishSemesterResult)
router.post("/generate-hall-ticket", restrictTo("super_admin", "admin"), generateHallTicket)
router.get("/analytics", restrictTo("super_admin", "admin", "hod"), getResultAnalytics)
router.get("/transcript/:studentId", restrictTo("super_admin", "admin", "student"), exportTranscript)

export default router
