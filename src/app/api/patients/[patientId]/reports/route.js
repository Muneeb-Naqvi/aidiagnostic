import getDB from "@/config/database"
import PatientAPI from "@/lib/patientAPI"

export async function GET(request, context) {
  try {
    const db = await getDB()

    // ✅ FIX: params ko await karo
    const { patientId } = await context.params

    const reports = await PatientAPI.getPatientReports(patientId)

    return Response.json({ success: true, data: reports || [] })
  } catch (error) {
    console.error("[API] Error fetching reports:", error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}