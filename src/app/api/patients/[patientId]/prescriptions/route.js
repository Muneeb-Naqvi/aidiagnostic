import getDB from "@/config/database"
import { NextResponse } from "next/server"

export async function GET(request, context) {
  try {
    const db = await getDB()
    const { patientId } = await context.params

    // Fetch from prescriptions collection directly
    const prescriptions = await db
      .collection("prescriptions")
      .find({ patientId })
      .sort({ issuedDate: -1 })
      .toArray()

    // Transform data to match frontend expectations
    const transformedPrescriptions = (prescriptions || []).map(pres => {
      // If medicines is an array, take the first one for display
      const firstMedicine = pres.medicines && pres.medicines.length > 0 ? pres.medicines[0] : {}
      
      return {
        prescriptionId: pres.prescriptionId,
        patientId: pres.patientId,
        patientName: pres.patientName,
        doctorName: pres.doctorName,
        doctorSpecialization: pres.doctorSpecialization,
        diagnosis: pres.diagnosis,
        severity: pres.severity,
        issuedDate: pres.issuedDate,
        followUpDate: pres.followUpDate,
        // For display - use first medicine
        medicineName: firstMedicine.name || "",
        dosage: firstMedicine.dosage || "",
        frequency: firstMedicine.frequency || "",
        duration: firstMedicine.duration || "",
        instructions: firstMedicine.instructions || "",
        // All medicines
        medicines: pres.medicines || [],
        // Additional fields
        labTests: pres.labTests || [],
        advice: pres.advice || "",
        notes: pres.notes || "",
        clinicName: pres.clinicName || "",
        date: pres.issuedDate ? new Date(pres.issuedDate).toLocaleDateString() : "",
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedPrescriptions,
    })
  } catch (error) {
    console.error("[API] Error fetching prescriptions:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

