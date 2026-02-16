import { ObjectId } from "mongodb"

export const AdminSchema = {
  userId: ObjectId,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  fullName: String,
  role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
  permissions: [String],
  lastLogin: Date,
  totalRequests: { type: Number, default: 0 },
  approvedDoctors: { type: Number, default: 0 },
  rejectedDoctors: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
}

export class Admin {
  constructor(data) {
    this.userId = data.userId
    this.email = data.email
    this.username = data.username
    this.fullName = data.fullName || ""
    this.role = data.role || "admin"
    this.permissions = data.permissions || ["manage_doctors", "view_reports", "manage_requests", "view_analytics"]
    this.lastLogin = null
    this.totalRequests = 0
    this.approvedDoctors = 0
    this.rejectedDoctors = 0
    this.createdAt = new Date()
  }

  static getCollection(db) {
    return db.collection("admins")
  }
}

export default Admin
