import { Request, Response } from "express"
import { prisma } from "../config/db"

export const getGalleryImages = async (req: Request, res: Response) => {
  const { category } = req.query
  try {
    const images = await prisma.galleryImage.findMany({
      where: {
        category: category ? String(category) : undefined,
        isActive: true
      },
      orderBy: { createdAt: "desc" }
    })
    return res.json({ images })
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch gallery images" })
  }
}

export const uploadGalleryImage = async (req: Request, res: Response) => {
  const { title, description, imageUrl, category, departmentId } = req.body
  try {
    const image = await prisma.galleryImage.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        departmentId
      }
    })
    return res.status(201).json({ image })
  } catch (error) {
    return res.status(500).json({ error: "Failed to upload image record" })
  }
}
