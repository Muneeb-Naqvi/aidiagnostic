import getDB from "@/config/database"
import PrescriptionAPI from "@/lib/prescriptionAPI"

export async function GET(request) {
  try {
    await getDB()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const doctorId = searchParams.get("doctorId")

    let prescriptions
    if (patientId) {
      prescriptions = await PrescriptionAPI.getPatientPrescriptions(patientId)
    } else if (doctorId) {
      prescriptions = await PrescriptionAPI.getDoctorPrescriptions(doctorId)
    } else {
      prescriptions = await PrescriptionAPI.getAllPrescriptions()
    }

    return Response.json({ success: true, data: prescriptions })
  } catch (error) {
    console.error("[API] Error fetching prescriptions:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await getDB()
    const body = await request.json()
    const { doctorId, patientId, medicines, diagnosis, advice } = body

    if (!doctorId || !patientId) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const prescription = await PrescriptionAPI.createPrescription({
      doctorId,
      patientId,
      medicines,
      diagnosis,
      advice,
    })

    return Response.json({ success: true, data: prescription }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
