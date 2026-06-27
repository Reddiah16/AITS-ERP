import { Router } from "express"
import { getBooks, createBook, issueBook, returnBook } from "../controllers/library.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.get("/books", getBooks)
router.post("/books", restrictTo("super_admin", "admin"), createBook)
router.post("/issue", restrictTo("super_admin", "admin"), issueBook)
router.post("/return", restrictTo("super_admin", "admin"), returnBook)

export default router
