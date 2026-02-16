import getDB from "@/config/database"
import DoctorAPI from "@/lib/doctorAPI"
import { signToken, COOKIE_OPTIONS } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request) {
  try {
    await getDB()
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return new Response(JSON.stringify({ success: false, error: "ID/Email and password are required" }), { status: 400 })
    }

    // Authenticate doctor
    const doctor = await DoctorAPI.loginDoctor(identifier, password)
    if (!doctor) {
      return new Response(JSON.stringify({ success: false, error: "Invalid Doctor ID or password" }), { status: 401 })
    }

    // Sign Token
    const token = signToken({ id: doctor._id, doctorId: doctor.doctorId, role: "doctor" })

    // Set Cookie
    const cookieStore = await cookies()
    cookieStore.set("doctorToken", token, COOKIE_OPTIONS)

    return new Response(JSON.stringify({
      success: true,
      message: "Login successful",
      doctor: {
        id: doctor._id,
        doctorId: doctor.doctorId,
        name: doctor.name,
        specialization: doctor.specialization
      }
    }), { status: 200 })
  } catch (err) {
    console.error("[API] Doctor login error:", err)
    return new Response(JSON.stringify({ success: false, error: err.message || "Login failed" }), { status: 500 })
  }
}





