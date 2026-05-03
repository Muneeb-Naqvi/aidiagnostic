import { getDB } from "@/config/database"

export async function GET(request) {
  try {
    const db = await getDB()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const doctorId = searchParams.get("doctorId")

    let query = {}
    if (patientId) query.patientId = patientId
    else if (doctorId) query.doctorId = doctorId

    const prescriptions = await db
      .collection("prescriptions")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({ success: true, data: prescriptions })
  } catch (error) {
    console.error("[API] Error fetching prescriptions:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const db = await getDB()
    const body = await request.json()
    console.log("[API] Received prescription request:", {
      doctorId: body.doctorId,
      patientId: body.patientId,
      patientName: body.patientName,
      diagnosis: body.diagnosis,
      medicinesCount: body.medicines?.length,
    })

    const {
      doctorId,
      doctorName,
      doctorSpecialization,
      clinicName,
      clinicAddress,
      clinicPhone,
      registrationNumber,
      digitalSignature,
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientWeight,
      patientBloodGroup,
      appointmentId,
      medicines,
      diagnosis,
      severity,
      labTests,
      advice,
      notes,
      followUpDate,
      issuedDate,
      attachments,
      sendToPatient,
      notificationMethods,
    } = body

    if (!doctorId || !patientId) {
      console.error("[API] Missing doctorId or patientId")
      return Response.json(
        { success: false, error: "doctorId and patientId are required" },
        { status: 400 }
      )
    }

    if (!medicines || medicines.length === 0) {
      console.error("[API] No medicines provided")
      return Response.json(
        { success: false, error: "At least one medicine is required" },
        { status: 400 }
      )
    }

    // Get doctor details if not fully provided
    let doctor = null
    try {
      doctor = await db.collection("doctors").findOne({ doctorId })
      console.log("Doctor found:", doctor ? doctor.name : "not found")
    } catch (e) {
      console.log("Doctor lookup failed, continuing anyway")
    }
    
    const resolvedDoctorName = doctorName || (doctor?.name ? `Dr. ${doctor.name}` : "Doctor")
    const resolvedSpecialization = doctorSpecialization || doctor?.specialization || ""
    const resolvedClinicName = clinicName || doctor?.clinicName || ""
    const resolvedClinicAddress = clinicAddress || doctor?.clinicAddress || ""
    const resolvedClinicPhone = clinicPhone || doctor?.clinicPhone || ""
    const resolvedRegistrationNumber = registrationNumber || doctor?.registrationNumber || ""
    const resolvedSignature = digitalSignature || doctor?.digitalSignature || null

    // Get patient details
    let patient = null
    try {
      patient = await db.collection("patients").findOne({ patientId })
      console.log("Patient found:", patient ? patient.email : "not found")
    } catch (e) {
      console.log("Patient lookup failed, continuing anyway")
    }
    
    const resolvedPatientName = patientName || patient?.firstName + " " + patient?.lastName || "Patient"
    const resolvedAge = patientAge || patient?.age || null
    const resolvedGender = patientGender || patient?.gender || ""
    const resolvedWeight = patientWeight || patient?.weight || null
    const resolvedBloodGroup = patientBloodGroup || patient?.bloodGroup || ""

    const prescriptionId = `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const issuedDateObj = issuedDate ? new Date(issuedDate) : new Date()
    const followUpDateObj = followUpDate ? new Date(followUpDate) : null

    const prescriptionDoc = {
      prescriptionId,
      // Doctor Details
      doctorId,
      doctorName: resolvedDoctorName,
      doctorSpecialization: resolvedSpecialization,
      clinicName: resolvedClinicName,
      clinicAddress: resolvedClinicAddress,
      clinicPhone: resolvedClinicPhone,
      registrationNumber: resolvedRegistrationNumber,
      digitalSignature: resolvedSignature,
      // Patient Details
      patientId,
      patientName: resolvedPatientName,
      patientAge: resolvedAge,
      patientGender: resolvedGender,
      patientWeight: resolvedWeight,
      patientBloodGroup: resolvedBloodGroup,
      // Appointment
      appointmentId: appointmentId || null,
      // Prescription Details
      medicines,
      diagnosis: diagnosis || "",
      severity: severity || "moderate",
      labTests: labTests || [],
      advice: advice || "",
      notes: notes || "",
      followUpDate: followUpDateObj,
      attachments: attachments || [],
      // Metadata
      issuedDate: issuedDateObj,
      status: "active",
      createdAt: new Date(),
    }

    await db.collection("prescriptions").insertOne(prescriptionDoc)

    // Update patient's prescription history - with error handling
    try {
      await db.collection("patients").updateOne(
        { patientId },
        {
          $push: {
            prescriptions: {
              prescriptionId,
              doctorId,
              doctorName: resolvedDoctorName,
              diagnosis,
              medicines,
              issuedDate: issuedDateObj,
              followUpDate: followUpDateObj,
              severity,
            },
          },
          $set: {
            updatedAt: new Date(),
          }
        },
        { upsert: true }
      )
      console.log("Patient prescription history updated")
    } catch (patientUpdateError) {
      console.log("Patient update failed, but prescription saved:", patientUpdateError.message)
    }

    // If linked to appointment, mark it as completed
    if (appointmentId) {
      try {
        await db.collection("appointments").updateOne(
          { appointmentId },
          { $set: { status: "completed", updatedAt: new Date() } }
        )
        console.log("Appointment marked as completed")
      } catch (appointmentError) {
        console.log("Appointment update failed:", appointmentError.message)
      }
    }

    // Send notifications if requested - with error handling so it doesn't break save
    if (sendToPatient && patient) {
      try {
        const notificationData = {
          prescriptionId,
          patientId,
          patientName: resolvedPatientName,
          doctorName: resolvedDoctorName,
          diagnosis,
          issuedDate: issuedDateObj,
          notificationMethods: notificationMethods || { email: true, whatsapp: true, inApp: true },
          patientEmail: patient.email,
          patientPhone: patient.phone || patient.phoneNumber,
        }
        
        // Create in-app notification for patient
        const notification = {
          type: "prescription",
          title: "New Prescription Issued",
          message: `Dr. ${resolvedDoctorName} has issued you a prescription for ${diagnosis}. View it in your prescriptions section.`,
          patientId,
          prescriptionId,
          createdAt: new Date(),
          read: false,
        }
        
        await db.collection("notifications").insertOne(notification)
        console.log("Notification sent to patient:", patient.email)
      } catch (notificationError) {
        // Continue even if notification fails - prescription should still save
        console.log("Notification failed, but prescription saved:", notificationError.message)
      }
    }

    return Response.json(
      { success: true, data: prescriptionDoc },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] Error creating prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
