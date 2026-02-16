export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const adminEmail = process.env.ADMIN_EMAIL || "admin@medicare.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123"

    if (email === adminEmail && password === adminPassword) {
      const token = Buffer.from(`${email}:${password}`).toString("base64")
      return Response.json(
        {
          success: true,
          message: "Admin login successful",
          token,
          admin: { email, name: "Administrator" },
        },
        { status: 200 },
      )
    }

    return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[API] Error logging in admin:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
