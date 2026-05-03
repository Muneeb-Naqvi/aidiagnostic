import { getDB } from "@/config/database"

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const db = await getDB()
    const { patientId } = params

    if (!patientId) {
      return Response.json(
        { success: false, error: "patientId is required" },
        { status: 400 }
      )
    }

    // Fetch notifications for the patient
    const notifications = await db
      .collection("notifications")
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({ success: true, data: notifications })
  } catch (error) {
    console.error("[API] Error fetching notifications:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}