import { ObjectId } from "mongodb"

export const PatientSchema = {
  userId: ObjectId,
  patientId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: String,
  medicalHistory: [String],
  allergies: [String],
  currentMedications: [String],
  profileImage: String,
  assignedDoctors: [
    {
      doctorId: ObjectId,
      doctorName: String,
      specialization: String,
      assignedDate: Date,
    },
  ],
  reports: [ObjectId],
  prescriptions: [ObjectId],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  totalReports: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}

export class Patient {
  constructor(data) {
    this.userId = data.userId
    this.patientId = data.patientId
    this.email = data.email
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.phone = data.phone || ""
    this.dateOfBirth = data.dateOfBirth || null
    this.gender = data.gender || "other"
    this.bloodType = data.bloodType || ""
    this.medicalHistory = data.medicalHistory || []
    this.allergies = data.allergies || []
    this.currentMedications = data.currentMedications || []
    this.profileImage = data.profileImage || null
    this.assignedDoctors = data.assignedDoctors || []
    this.reports = data.reports || []
    this.prescriptions = data.prescriptions || []
    this.emergencyContact = data.emergencyContact || {}
    this.totalReports = 0
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  static getCollection(db) {
    return db.collection("patients")
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

export default Patient