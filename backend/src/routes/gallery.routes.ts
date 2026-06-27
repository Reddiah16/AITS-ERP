import { Router } from "express"
import { getGalleryImages, uploadGalleryImage } from "../controllers/gallery.controller"
import { authenticateJWT, restrictTo } from "../middleware/auth"

const router = Router()

router.use(authenticateJWT)

router.get("/", getGalleryImages)
router.post("/", restrictTo("super_admin", "admin"), uploadGalleryImage)

export default router
