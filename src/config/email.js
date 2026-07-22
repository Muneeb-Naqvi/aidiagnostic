import nodemailer from "nodemailer"

const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
const port = process.env.EMAIL_PORT || process.env.SMTP_PORT
const secure = process.env.EMAIL_SECURE === "true"
const user = process.env.EMAIL_USER || process.env.SMTP_USER
const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS

if (!host || !port || !user || !pass) {
  console.warn("[EMAIL] SMTP configuration incomplete. Some environment variables are missing. Using defaults or will fail.")
}

const transporter = nodemailer.createTransport({
  host,
  port: port ? parseInt(port, 10) : 587,
  secure: secure || false,
  auth: {
    user,
    pass,
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
})

export async function sendEmail(options) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...options,
    })
    console.log("[EMAIL] Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error)
    throw error
  }
}

export async function testConnection() {
  try {
    await transporter.verify()
    console.log("[EMAIL] SMTP connection verified")
    return true
  } catch (error) {
    console.error("[EMAIL] SMTP connection failed:", error)
    return false
  }
}

export default { sendEmail, testConnection }
