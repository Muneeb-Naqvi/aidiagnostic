import { ObjectId } from "mongodb"

export const PrescriptionSchema = {
  prescriptionId: { type: String, required: true },
  patientId: { type: ObjectId, required: true },
  doctorId: { type: ObjectId, required: true },
  doctorName: { type: String, required: true },
  patientName: { type: String, required: true },
  disease: { type: String, required: true },
  medications: { type: String, required: true },
  dosage: { type: String, required: true },
  instructions: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ["active", "expired", "completed"], default: "active" },
  createdAt: { type: Date, default: () => new Date() },
}

export class Prescription {
  constructor(data) {
    this.prescriptionId = data.prescriptionId || `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.patientId = data.patientId
    this.doctorId = data.doctorId
    this.doctorName = data.doctorName || ""
    this.patientName = data.patientName || ""
    this.disease = data.disease || ""
    this.medications = data.medications || ""
    this.dosage = data.dosage || ""
    this.instructions = data.instructions || ""
    this.notes = data.notes || ""
    this.status = "active"
    this.createdAt = new Date()
  }

  static getCollection(db) {
    return db.collection("prescriptions")
  }
}

export default Prescription
