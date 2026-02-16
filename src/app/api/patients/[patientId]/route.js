import getDB from "@/config/database"
import PatientAPI from "@/api/patientAPI"

export async function GET(request, { params }) {
  try {
    await getDB()
    const patient = await PatientAPI.getPatientById(params.patientId)

    if (!patient) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: patient })
  } catch (error) {
    console.error("[API] Error fetching patient:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await getDB()
    const body = await request.json()
    const patient = await PatientAPI.updatePatient(params.patientId, body)

    if (!patient) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: patient })
  } catch (error) {
    console.error("[API] Error updating patient:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await getDB()
    const result = await PatientAPI.deletePatient(params.patientId)

    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("[API] Error deleting patient:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}