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
  profileImage: String,
  
  // EHR Core Medical Information
  bloodGroup: { 
    type: String, 
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], 
    default: "" 
  },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: String,
    notes: String
  }],
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    treatedBy: String,
    notes: String
  }],
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    address: String
  },
  
  // Physical measurements
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  bmi: { type: Number, default: 0 },
  
  // Doctor assignments
  assignedDoctors: [{
    doctorId: ObjectId,
    doctorName: String,
    specialization: String,
    assignedDate: Date,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Related records
  reports: [ObjectId],
  prescriptions: [ObjectId],
  appointments: [{
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
  }],
  
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
    emergencyAlerts: { type: Boolean, default: true }
  },
  
  // Statistics
  totalReports: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
  
  // Timestamps
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
    this.profileImage = data.profileImage || null
    
    // EHR Core Medical Information
    this.bloodGroup = data.bloodGroup || ""
    this.allergies = data.allergies || []
    this.chronicConditions = data.chronicConditions || []
    this.currentMedications = data.currentMedications || []
    this.medicalHistory = data.medicalHistory || []
    
    // Emergency Contact
    this.emergencyContact = data.emergencyContact || {
      name: "",
      relationship: "",
      phone: "",
      alternatePhone: "",
      address: ""
    }
    
    // Physical measurements
    this.weight = data.weight || 0
    this.height = data.height || 0
    this.bmi = data.bmi || 0
    
    // Doctor assignments
    this.assignedDoctors = data.assignedDoctors || []
    
    // Related records
    this.reports = data.reports || []
    this.prescriptions = data.prescriptions || []
    this.appointments = data.appointments || []
    
    // Prescription history
    this.prescriptionHistory = data.prescriptionHistory || []
    
    // Notification preferences
    this.notificationPreferences = data.notificationPreferences || {
      email: true,
      whatsapp: true,
      inApp: true,
      emergencyAlerts: true
    }
    
    // Statistics
    this.totalReports = data.totalReports || 0
    this.totalVisits = data.totalVisits || 0
    
    // Timestamps
    this.createdAt = data.createdAt || new Date()
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