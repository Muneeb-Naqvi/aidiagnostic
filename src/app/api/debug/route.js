import { getDB } from "@/config/database"

export async function GET(request) {
  try {
    const db = await getDB()
    const prescriptions = await db.collection("prescriptions").find({}).toArray()
    const patients = await db.collection("patients").find({}).toArray()
    
    return Response.json({
      success: true,
      data: {
        prescriptions: prescriptions.map(p => ({ p_id: p.prescriptionId, patientId: p.patientId, date: p.createdAt })),
        patients: patients.map(p => ({ patientId: p.patientId, name: p.name || p.firstName, email: p.email }))
      }
    })
  } catch (err) {
    return Response.json({ success: false, error: err.message })
  }
}
