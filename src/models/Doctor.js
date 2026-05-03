import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export const DoctorSchema = {
  userId: ObjectId,
  doctorId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  password: { type: String, required: true },  // Added hashed password
  experience: { type: Number, default: 0 },
  bio: String,
  qualifications: [String],
  // New fields for comprehensive doctor profile
  degree: { type: String, default: "" }, // MBBS, BDS, FCPS, MD, etc.
  gender: { type: String, enum: ["male", "female", "other"], default: "other" },
  dateOfBirth: Date,
  phoneNumber: String,
  whatsappNumber: String,
  address: String,
  // Clinic/Hospital Details
  clinicName: { type: String, default: "" },
  clinicAddress: { type: String, default: "" },
  clinicPhone: { type: String, default: "" },
  clinicEmail: { type: String, default: "" },
  clinicLogo: String,
  // Digital Signature
  digitalSignature: String, // Base64 encoded signature image
  registrationNumber: { type: String, default: "" }, // Clinic/Hospital registration number
  website: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
  },
  status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
  profileImage: String,
  consultationFee: { type: Number, default: 0 },
  assignedPatients: [{ type: ObjectId, ref: "patients" }],
  appointments: [{
    appointmentId: String,
    patientId: ObjectId,
    patientName: String,
    reportId: String,
    disease: String,
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    scheduledDate: Date,
    notes: String,
    createdAt: { type: Date, default: () => new Date() },
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [
      {
        patientId: ObjectId,
        rating: Number,
        comment: String,
        date: Date,
      },
    ],
  },
   availableHours: Object,
   hospitalSchedules: [{
     hospitalName: { type: String, required: true },
     days: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
     startTime: { type: String, required: true },
     endTime: { type: String, required: true },
     consultationFee: { type: Number, default: 0 },
     slotDuration: { type: Number, default: 15 }, // minutes per slot
     isActive: { type: Boolean, default: true }
   }],
   timeSlots: [{
     date: String,
     hospitalName: String,
     slots: [{
       time: String,
       isBooked: { type: Boolean, default: false },
       appointmentId: String
     }]
   }],
   totalConsultations: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
};

export class Doctor {
  constructor(data) {
    if (!data.doctorId || !data.email || !data.name || !data.specialization || !data.licenseNumber || !data.password) {
      throw new Error("Missing required fields for Doctor");
    }
    this.userId = data.userId || new ObjectId();
    this.doctorId = data.doctorId;
    this.email = data.email;
    this.name = data.name;
    this.specialization = data.specialization;
    this.licenseNumber = data.licenseNumber;
    this.password = data.password;  // Expect hashed password
    this.experience = data.experience || 0;
    this.bio = data.bio || "";
    this.qualifications = data.qualifications || [];
    // New fields
    this.degree = data.degree || "";
    this.gender = data.gender || "other";
    this.dateOfBirth = data.dateOfBirth || null;
    this.whatsappNumber = data.whatsappNumber || "";
    this.website = data.website || "";
    this.socialLinks = data.socialLinks || {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    };
    this.status = data.status || "pending";
    this.profileImage = data.profileImage || null;
    this.consultationFee = data.consultationFee || 0;
    this.assignedPatients = data.assignedPatients || [];
    this.appointments = data.appointments || [];
    this.ratings = {
      average: 0,
      count: 0,
      reviews: [],
    };
    this.availableHours = data.availableHours || {};
    this.hospitalSchedules = data.hospitalSchedules || [];
    this.timeSlots = data.timeSlots || [];
    this.phoneNumber = data.phoneNumber || "";
    this.address = data.address || "";
    // Clinic/Hospital Details
    this.clinicName = data.clinicName || "";
    this.clinicAddress = data.clinicAddress || "";
    this.clinicPhone = data.clinicPhone || "";
    this.clinicEmail = data.clinicEmail || "";
    this.clinicLogo = data.clinicLogo || null;
    // Digital Signature
    this.digitalSignature = data.digitalSignature || null;
    this.registrationNumber = data.registrationNumber || "";
    this.totalConsultations = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getCollection(db) {
    return db.collection("doctors");
  }

  addReview(patientId, rating, comment) {
    if (rating < 1 || rating > 5) throw new Error("Invalid rating");
    this.ratings.reviews.push({
      patientId,
      rating,
      comment,
      date: new Date(),
    });
    this.updateAverageRating();
  }

  updateAverageRating() {
    if (this.ratings.reviews.length === 0) {
      this.ratings.average = 0;
    } else {
      const sum = this.ratings.reviews.reduce((acc, review) => acc + review.rating, 0);
      this.ratings.average = (sum / this.ratings.reviews.length).toFixed(1);
      this.ratings.count = this.ratings.reviews.length;
    }
  }

  async verifyPassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }
}

export default Doctor;