import getDB from "@/config/database"
import Prescription from "@/models/Prescription"
import { NextResponse } from "next/server"

export async function GET(request, context) {
  try {
    const db = await getDB()
    const { patientId } = await context.params

    const col = Prescription.getCollection(db)
    const prescriptions = await col.find({ patientId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      data: prescriptions || [],
    })
  } catch (error) {
    console.error("[API] Error fetching prescriptions:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

