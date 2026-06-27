import { createClient } from "redis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
const client = createClient({ url: redisUrl })

client.on("error", (err) => console.error("Redis Cache Client Error:", err))

let isConnected = false

export const connectRedis = async () => {
  if (isConnected) return
  try {
    await client.connect()
    isConnected = true
    console.log("⚡ Redis Cache connected successfully")
  } catch (error) {
    console.warn("⚠ Failed to connect to Redis. Caching will be disabled.")
  }
}

export const getCache = async (key: string): Promise<string | null> => {
  if (!isConnected) return null
  try {
    return await client.get(key)
  } catch {
    return null
  }
}

export const setCache = async (key: string, value: string, expirationSeconds: number = 3600): Promise<void> => {
  if (!isConnected) return
  try {
    await client.setEx(key, expirationSeconds, value)
  } catch {
    // Fail silently in production to avoid crashing request
  }
}

export const invalidateCache = async (key: string): Promise<void> => {
  if (!isConnected) return
  try {
    await client.del(key)
  } catch {
    // Fail silently
  }
}
