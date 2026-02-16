import bcrypt from "bcryptjs"
import { getDB } from "@/config/database"

const DoctorAPI = {
  // ✅ Create doctor
  async createDoctor(data, doctorId) {
    const db = await getDB()
    const collection = db.collection("doctors")

    // Check for existing email to prevent duplicates
    if (data.email) {
      const existing = await collection.findOne({ email: data.email });
      if (existing) {
        throw new Error(`Doctor with email ${data.email} already exists.`);
      }
    }

    const doctor = {
      doctorId,
      ...data,
      createdAt: new Date(),
    }

    await collection.insertOne(doctor)
    return doctor
  },

  // ✅ GET ALL doctors (THIS FIXES YOUR ERROR)
  async getAllDoctors(filter = {}) {
    const db = await getDB()
    return await db.collection("doctors").find(filter).toArray()
  },

  // ✅ Delete doctor
  async deleteDoctor(doctorId) {
    const db = await getDB()
    return await db.collection("doctors").deleteOne({ doctorId })
  },

  // ✅ Doctor login
  async loginDoctor(identifier, password) {
    const db = await getDB()
    // Search by EITHER doctorId OR email (case-insensitive for email usually preferred, but strict here for now)
    const doctor = await db.collection("doctors").findOne({
      $or: [
        { doctorId: identifier },
        { email: identifier }
      ]
    })

    if (!doctor) return null

    const isMatch = await bcrypt.compare(password, doctor.password)
    if (!isMatch) return null

    delete doctor.password
    return doctor
  },
}

export default DoctorAPI





