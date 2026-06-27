import { Router } from "express"
import authRoutes from "./auth.routes"
import studentRoutes from "./student.routes"
import academicRoutes from "./academic.routes"
import examRoutes from "./exam.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/students", studentRoutes)
router.use("/academic", academicRoutes)
router.use("/exams", examRoutes)

export default router
