import { Router } from "express"
import { getStudents, getStudentById } from "../controllers/student.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.get("/", restrictTo("super_admin", "admin", "hod", "faculty"), getStudents)
router.get("/:id", restrictTo("super_admin", "admin", "hod", "faculty", "student"), getStudentById)

export default router
