import { v2 as cloudinary } from "cloudinary"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// 1. Cloudinary Integration
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
})

export const uploadToCloudinary = async (filePath: string, folder: string = "aits_erp") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder })
    return result.secure_url
  } catch (error) {
    console.error("Cloudinary Upload Error:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

// 2. AWS S3 Integration
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
})

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  const bucketName = process.env.AWS_S3_BUCKET || "aits-erp-documents"
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `documents/${Date.now()}_${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: "public-read"
    })
    await s3.send(command)
    return `https://${bucketName}.s3.amazonaws.com/documents/${Date.now()}_${fileName}`
  } catch (error) {
    console.error("AWS S3 Upload Error:", error)
    throw new Error("Failed to upload document to AWS S3")
  }
}
