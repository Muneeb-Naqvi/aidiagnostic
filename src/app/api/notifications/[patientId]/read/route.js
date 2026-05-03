import { getDB } from "@/config/database"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    const db = await getDB()
    const { patientId } = params

    if (!patientId) {
      return Response.json(
        { success: false, error: "patientId is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { notificationIds } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return Response.json(
        { success: false, error: "notificationIds array is required" },
        { status: 400 }
      )
    }

    // Convert string IDs to ObjectId
    const objectIds = notificationIds.map(id => {
      try {
        return new ObjectId(id)
      } catch (e) {
        return null
      }
    }).filter(Boolean)

    if (objectIds.length === 0) {
      return Response.json(
        { success: false, error: "Invalid notification IDs" },
        { status: 400 }
      )
    }

    // Mark notifications as read
    const result = await db.collection("notifications").updateMany(
      { 
        patientId,
        _id: { $in: objectIds }
      },
      { $set: { read: true } }
    )

    return Response.json({ 
      success: true, 
      data: { modifiedCount: result.modifiedCount }
    })
  } catch (error) {
    console.error("[API] Error marking notifications as read:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}