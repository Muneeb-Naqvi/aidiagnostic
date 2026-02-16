import { ADMIN_CREDENTIALS } from "@/lib/constants"
import { signToken, COOKIE_OPTIONS } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return Response.json(
                { success: false, error: "Email & password required" },
                { status: 400 }
            )
        }

        // Verify Credentials
        if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
            return Response.json(
                { success: false, error: "Invalid admin credentials" },
                { status: 401 }
            )
        }

        // Sign Token
        const token = signToken({ role: "admin", email })

        // Set Cookie
        const cookieStore = await cookies()
        cookieStore.set("adminToken", token, COOKIE_OPTIONS)

        return Response.json({
            success: true,
            message: "Admin login successful"
        })

    } catch (error) {
        console.error("[ADMIN LOGIN ERROR]:", error)
        return Response.json(
            { success: false, error: "Authentication failed" },
            { status: 500 }
        )
    }
}
