import getDB from "@/config/database"
import PrescriptionAPI from "@/lib/prescriptionAPI"

export async function GET(request, { params }) {
  try {
    await getDB()
    const prescription = await PrescriptionAPI.getPrescriptionById(params.prescriptionId)

    if (!prescription) {
      return Response.json({ success: false, error: "Prescription not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: prescription })
  } catch (error) {
    console.error("[API] Error fetching prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await getDB()
    const body = await request.json()

    const prescription = await PrescriptionAPI.updatePrescription(params.prescriptionId, body)

    if (!prescription) {
      return Response.json({ success: false, error: "Prescription not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: prescription })
  } catch (error) {
    console.error("[API] Error updating prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await getDB()
    const result = await PrescriptionAPI.deletePrescription(params.prescriptionId)

    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: "Prescription not found" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Prescription deleted successfully" })
  } catch (error) {
    console.error("[API] Error deleting prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
