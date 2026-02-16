import { MongoClient } from "mongodb"

let client
let clientPromise

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in .env.local")
}

if (!dbName) {
  throw new Error("❌ MONGODB_DB_NAME is not defined in .env.local")
}

/**
 * Global caching (Next.js hot reload safe)
 */
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
  })

  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

/**
 * Get Database (Atlas only)
 */
export async function getDB() {
  const client = await clientPromise
  const db = client.db(dbName)

  console.log("[DB] Connected to MongoDB Atlas")
  console.log("[DB] Database Name:", db.databaseName)

  return db
}

/**
 * Optional: Get raw client
 */
export async function getClient() {
  return await clientPromise
}

export default getDB
