import { Router } from "express"
import { exportStudentRosterCSV, exportGradeSheetCSV } from "../controllers/report.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.get("/students/csv", restrictTo("super_admin", "admin", "hod"), exportStudentRosterCSV)
router.get("/grades/csv", restrictTo("super_admin", "admin", "hod"), exportGradeSheetCSV)

export default router
