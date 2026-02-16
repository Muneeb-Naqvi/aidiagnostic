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
  status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
  profileImage: String,
  consultationFee: { type: Number, default: 0 },
  assignedPatients: [{ type: ObjectId, ref: "patients" }],
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
  phoneNumber: String,
  address: String,
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
    this.status = data.status || "pending";
    this.profileImage = data.profileImage || null;
    this.consultationFee = data.consultationFee || 0;
    this.assignedPatients = data.assignedPatients || [];
    this.ratings = {
      average: 0,
      count: 0,
      reviews: [],
    };
    this.availableHours = data.availableHours || {};
    this.phoneNumber = data.phoneNumber || "";
    this.address = data.address || "";
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