import { Router } from "express"
import authRoutes from "./auth.routes"
import studentRoutes from "./student.routes"
import academicRoutes from "./academic.routes"
import examRoutes from "./exam.routes"
import placementRoutes from "./placement.routes"
import libraryRoutes from "./library.routes"
import galleryRoutes from "./gallery.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/students", studentRoutes)
router.use("/academic", academicRoutes)
router.use("/exams", examRoutes)
router.use("/placements", placementRoutes)
router.use("/library", libraryRoutes)
router.use("/gallery", galleryRoutes)

export default router
