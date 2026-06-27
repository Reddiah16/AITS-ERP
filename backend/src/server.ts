import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import routes from "./routes"
import { prisma } from "./config/db"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Helmet for secure HTTP headers (XSS/Headers protection)
app.use(helmet())

// CORS Policy Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

// Body parsers
app.use(express.json({ limit: "10kb" })) // prevent large payload DOS
app.use(express.urlencoded({ extended: true, limit: "10kb" }))

// Rate Limiting (DOS Mitigation)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this IP, please try again later" }
})
app.use("/api/", limiter)

// API Routing
app.use("/api", routes)

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.Function) => {
  console.error("Global Error:", err.stack)
  res.status(500).json({ error: "Internal server error" })
})

// Database verification & server startup
async function startServer() {
  try {
    await prisma.$connect()
    console.log("⚡ Database connection verified successfully via Prisma")
    
    app.listen(PORT, () => {
      console.log(`🚀 AITS Rajampet ERP backend server active at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to initiate database connection:", error)
    process.exit(1)
  }
}

startServer()
