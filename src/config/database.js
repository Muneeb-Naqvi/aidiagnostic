import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in .env")
}

if (!dbName) {
  throw new Error("❌ MONGODB_DB_NAME is not defined in .env")
}

const localUri = "mongodb://127.0.0.1:27017"

async function connectToMongo() {
  if (global._mongoActiveClient) {
    return global._mongoActiveClient
  }

  try {
    console.log("[DB] Attempting connection to MongoDB Atlas...")
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      retryWrites: true,
    })
    await client.connect()
    console.log("[DB] Connected to MongoDB Atlas successfully")
    global._mongoActiveClient = client
    return client
  } catch (atlasError) {
    console.warn(`[DB] MongoDB Atlas connection failed: ${atlasError.message}`)
    console.log("[DB] Attempting local MongoDB fallback (127.0.0.1:27017)...")
    
    try {
      const localClient = new MongoClient(localUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 2000,
      })
      await localClient.connect()
      console.log("[DB] Connected to Local MongoDB successfully")
      global._mongoActiveClient = localClient
      return localClient
    } catch (localError) {
      console.error(`[DB] Local MongoDB connection also failed: ${localError.message}`)
      throw atlasError
    }
  }
}

export async function getDB() {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToMongo()
  }

  try {
    const client = await global._mongoClientPromise
    const db = client.db(dbName)
    console.log("[DB] Database Name:", db.databaseName)
    return db
  } catch (error) {
    global._mongoClientPromise = null
    throw error
  }
}

export async function getClient() {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToMongo()
  }
  try {
    return await global._mongoClientPromise
  } catch (error) {
    global._mongoClientPromise = null
    throw error
  }
}

export default getDB
