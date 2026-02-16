// src/app/api/patients/route.js
import PatientAPI from "@/lib/patientAPI"

export async function GET() {
  try {
    const patients = await PatientAPI.getAllPatients()
    return Response.json({ success: true, data: patients })
  } catch (error) {
    console.error("[API] Error fetching patients:", error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, dateOfBirth, gender, bloodGroup, password } = body

    if (!name || !email || !dateOfBirth || !password) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const existingPatient = await PatientAPI.getPatientByEmail(email)
    if (existingPatient) {
      return Response.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      )
    }

    const patientId = `PT${Date.now()}`

    const patient = await PatientAPI.createPatient({
      patientId,
      name,
      email,
      dateOfBirth,
      gender,
      bloodGroup,
      password,
    })

    return Response.json(
      { success: true, data: patient },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] Error creating patient:", error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
