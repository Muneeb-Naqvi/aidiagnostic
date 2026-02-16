import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export const DoctorAccessRequestSchema = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  doctorEmail: { type: String, required: true, unique: true },
  phone: {type: String },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  password: { type: String, required: true },  // Added hashed password
  qualifications: [String],
  experience: Number,
  bio: String,
  hospital: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestDate: { type: Date, default: () => new Date() },
  responseDate: Date,
  respondedBy: ObjectId,
  respondedByName: String,
  responseMessage: String,
  createdAt: { type: Date, default: () => new Date() },
};

export class DoctorAccessRequest {
  constructor(data) {
    if (!data.firstName || !data.lastName || !data.phone || !data.doctorEmail || !data.specialization || !data.licenseNumber || !data.password) {
      throw new Error("Missing required fields for DoctorAccessRequest");
    }
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.doctorEmail = data.doctorEmail;
    this.phone = data.phone || "";
    this.specialization = data.specialization;
    this.licenseNumber = data.licenseNumber;
    this.password = data.password;  // Expect hashed password
    this.qualifications = data.qualifications || [];
    this.experience = data.experience || 0;
    this.bio = data.bio || "";
    this.hospital = data.hospital || "";
    this.status = "pending";
    this.requestDate = new Date();
    this.responseDate = null;
    this.respondedBy = null;
    this.respondedByName = null;
    this.responseMessage = null;
    this.createdAt = new Date();
  }

  static getCollection(db) {
    return db.collection("doctor_access_requests");
  }

  approve(adminId, adminName) {
    this.status = "approved";
    this.responseDate = new Date();
    this.respondedBy = adminId;
    this.respondedByName = adminName;
  }

  reject(adminId, adminName, message) {
    this.status = "rejected";
    this.responseDate = new Date();
    this.respondedBy = adminId;
    this.respondedByName = adminName;
    this.responseMessage = message;
  }
}

export default DoctorAccessRequest;