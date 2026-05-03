import { ObjectId } from "mongodb"

export const PatientSchema = {
  userId: ObjectId,
  patientId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  phoneNumber: String,
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
  appointments: [
    {
      appointmentId: String,
      doctorId: String,
      doctorName: String,
      doctorSpecialization: String,
      disease: String,
      reportId: String,
      reportName: String,
      reportAnalysis: Object,
      status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
      scheduledDate: Date,
      notes: String,
      createdAt: { type: Date, default: () => new Date() },
      updatedAt: { type: Date, default: () => new Date() },
    },
  ],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  // Additional patient details for prescriptions
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  bloodGroup: { type: String, default: "" },
  allergies: [String],
  currentMedications: [String],
  chronicConditions: [String],
  // Prescription history
  prescriptionHistory: [{
    prescriptionId: String,
    doctorId: String,
    doctorName: String,
    diagnosis: String,
    medicines: Array,
    issuedDate: Date,
    followUpDate: Date,
    severity: String,
  }],
  // Notification preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
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
    this.phoneNumber = data.phoneNumber || ""
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
    this.appointments = data.appointments || []
    this.emergencyContact = data.emergencyContact || {}
    // Additional patient details
    this.weight = data.weight || 0
    this.height = data.height || 0
    this.bloodGroup = data.bloodGroup || ""
    this.allergies = data.allergies || []
    this.currentMedications = data.currentMedications || []
    this.chronicConditions = data.chronicConditions || []
    this.prescriptionHistory = data.prescriptionHistory || []
    this.notificationPreferences = data.notificationPreferences || {
      email: true,
      whatsapp: true,
      inApp: true,
    }
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