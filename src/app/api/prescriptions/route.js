import { getDB } from "@/config/database"

export const dynamic = "force-dynamic";

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
    console.log("[API] Received prescription request:", body)

    const {
      patientId,
      doctorId,
      doctorName,
      patientName,
      disease,
      diagnosis,
      medications,
      medicines,
      dosage,
      instructions,
      notes,
      severity,
      labTests,
      advice,
      followUpDate,
      attachments,
      issuedDate
    } = body

    const finalDisease = disease || diagnosis
    const finalMedications = medications || (medicines ? medicines.map(m => `${m.name} (${m.dosage || ''} ${m.frequency || ''})`).join(', ') : "")

    if (!doctorId || !patientId || !finalDisease || !finalMedications) {
      console.error("[API] Missing required fields")
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prescriptionId = `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const prescriptionDoc = {
      prescriptionId,
      patientId,
      doctorId,
      doctorName: doctorName || "Doctor",
      patientName: patientName || "Patient",
      disease: finalDisease,
      medications: finalMedications,
      medicines: medicines || [],
      dosage: dosage || "",
      instructions: instructions || advice || "",
      notes: notes || "",
      severity: severity || "moderate",
      labTests: labTests || [],
      advice: advice || "",
      followUpDate: followUpDate || null,
      attachments: attachments || [],
      status: "active",
      createdAt: issuedDate ? new Date(issuedDate) : new Date(),
    }

    await db.collection("prescriptions").insertOne(prescriptionDoc)

    return Response.json(
      { success: true, message: "Prescription saved and sent successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] Error creating prescription:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
