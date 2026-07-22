import getDB from "@/config/database"
import Patient from "@/models/Patient"

// GET patient medical profile
export async function GET(request, { params }) {
  try {
    await getDB()
    const { patientId } = await params
    
    const patientCollection = Patient.getCollection()
    const patient = await patientCollection.findOne({ patientId })
    
    if (!patient) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 })
    }
    
    // Return only medical profile fields (plus basic identity)
    const medicalProfile = {
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || "",
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      currentMedications: patient.currentMedications || [],
      medicalHistory: patient.medicalHistory || [],
      emergencyContact: patient.emergencyContact || {
        name: "",
        relationship: "",
        phone: "",
        alternatePhone: "",
        address: ""
      },
      weight: patient.weight || 0,
      height: patient.height || 0,
      bmi: patient.bmi || 0,
      assignedDoctors: patient.assignedDoctors || [],
      updatedAt: patient.updatedAt
    }
    
    return Response.json({ success: true, data: medicalProfile })
  } catch (error) {
    console.error("[API] Error fetching medical profile:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// UPDATE patient medical profile
export async function PATCH(request, { params }) {
  try {
    await getDB()
    const { patientId } = await params
    const body = await request.json()
    
    const patientCollection = Patient.getCollection()
    
    // Build update object from allowed fields
    const updateData = {}
    const allowedFields = [
      'bloodGroup', 'allergies', 'chronicConditions', 
      'currentMedications', 'medicalHistory', 'emergencyContact',
      'weight', 'height', 'bmi', 'assignedDoctors'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date()
    
    const result = await patientCollection.findOneAndUpdate(
      { patientId },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result.value) {
      return Response.json({ success: false, error: "Patient not found" }, { status: 404 })
    }
    
    // Return updated medical profile
    const patient = result.value
    const medicalProfile = {
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || "",
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      currentMedications: patient.currentMedications || [],
      medicalHistory: patient.medicalHistory || [],
      emergencyContact: patient.emergencyContact || {
        name: "",
        relationship: "",
        phone: "",
        alternatePhone: "",
        address: ""
      },
      weight: patient.weight || 0,
      height: patient.height || 0,
      bmi: patient.bmi || 0,
      assignedDoctors: patient.assignedDoctors || [],
      updatedAt: patient.updatedAt
    }
    
    return Response.json({ success: true, data: medicalProfile })
  } catch (error) {
    console.error("[API] Error updating medical profile:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
