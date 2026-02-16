import { ObjectId } from "mongodb"

export const PrescriptionSchema = {
  patientId: { type: ObjectId, required: true, ref: "patients" },
  doctorId: { type: ObjectId, required: true, ref: "doctors" },
  doctorName: String,
  medicines: [
    {
      name: { type: String, required: true },
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
    },
  ],
  diagnosis: { type: String, required: true },
  symptoms: [String],
  tests: [String],
  advice: String,
  followUpDate: Date,
  followUpNotes: String,
  issuedDate: { type: Date, default: () => new Date() },
  expiryDate: Date,
  status: { type: String, enum: ["active", "expired", "completed"], default: "active" },
  isPrinted: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
}

export class Prescription {
  constructor(data) {
    this.patientId = data.patientId
    this.doctorId = data.doctorId
    this.doctorName = data.doctorName || ""
    this.medicines = data.medicines || []
    this.diagnosis = data.diagnosis
    this.symptoms = data.symptoms || []
    this.tests = data.tests || []
    this.advice = data.advice || ""
    this.followUpDate = data.followUpDate || null
    this.followUpNotes = data.followUpNotes || ""
    this.issuedDate = new Date()
    this.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    this.status = "active"
    this.isPrinted = false
    this.createdAt = new Date()
  }

  static getCollection(db) {
    return db.collection("prescriptions")
  }

  addMedicine(medicine) {
    this.medicines.push({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      instructions: medicine.instructions || "",
    })
  }

  removeMedicine(index) {
    this.medicines.splice(index, 1)
  }

  markAsPrinted() {
    this.isPrinted = true
  }

  isExpired() {
    return new Date() > this.expiryDate
  }

  updateStatus() {
    if (this.isExpired()) {
      this.status = "expired"
    }
  }
}

export default Prescription
