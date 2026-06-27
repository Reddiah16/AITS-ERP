import { Router } from "express"
import {
  getTrainingPrograms, createTrainingProgram,
  getInternships, createInternship,
  createInterviewSchedule, issueOfferLetter
} from "../controllers/placement.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.get("/training", getTrainingPrograms)
router.post("/training", restrictTo("super_admin", "admin"), createTrainingProgram)

router.get("/internships", getInternships)
router.post("/internships", restrictTo("super_admin", "admin"), createInternship)

router.post("/interviews", restrictTo("super_admin", "admin"), createInterviewSchedule)
router.post("/offers", restrictTo("super_admin", "admin"), issueOfferLetter)

export default router
