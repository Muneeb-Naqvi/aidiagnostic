import crypto from "crypto"

/**
 * Hash password using Node.js crypto
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

/**
 * Verify password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} Password match status
 */
export function verifyPassword(password, hash) {
  return hashPassword(password) === hash
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = btoa(JSON.stringify(payload))
  const secret = process.env.JWT_SECRET || "default_secret"
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64")
  return `${header}.${body}.${signature}`
}
