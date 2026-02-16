export const UserSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["admin", "doctor", "patient"], required: true },
  firstName: String,
  lastName: String,
  phone: String,
  profileImage: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}

export class User {
  constructor(data) {
    this.email = data.email
    this.password = data.password
    this.userType = data.userType
    this.firstName = data.firstName || ""
    this.lastName = data.lastName || ""
    this.phone = data.phone || ""
    this.profileImage = data.profileImage || null
    this.isActive = data.isActive !== false
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  toJSON() {
    const { password, ...rest } = this
    return rest
  }

  static getCollection(db) {
    return db.collection("users")
  }
}

export default User
