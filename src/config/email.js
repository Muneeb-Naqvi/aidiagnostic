import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
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
