import { Router } from "express"
import { login, register, refreshToken } from "../controllers/auth.controller"
import { validateRequest } from "../middleware/validation"
import { loginSchema, registerSchema } from "../validation/auth"

const router = Router()

router.post("/register", validateRequest(registerSchema), register)
router.post("/login", validateRequest(loginSchema), login)
router.post("/refresh-token", refreshToken)

export default router
