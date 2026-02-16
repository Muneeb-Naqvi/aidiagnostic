// src/lib/patientAPI.js
import { getDB } from "@/config/database"
import bcrypt from "bcryptjs"

const PatientAPI = {
  /* =========================
     GET ALL PATIENTS
  ========================= */
  async getAllPatients() {
    const db = await getDB()
    return db.collection("patients").find().toArray()
  },

  /* =========================
     GET PATIENT BY ID
  ========================= */
  async getPatientById(patientId) {
    const db = await getDB()
    return db.collection("patients").findOne({ patientId })
  },

  /* =========================
     GET PATIENT BY EMAIL
  ========================= */
  async getPatientByEmail(email) {
    const db = await getDB()
    return db.collection("patients").findOne({ email })
  },

  /* =========================
     CREATE PATIENT (HASH PASSWORD)
  ========================= */
  async createPatient(data) {
    const db = await getDB()

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const patient = {
      ...data,
      password: hashedPassword,
      createdAt: new Date(),
    }

    await db.collection("patients").insertOne(patient)

    // password remove before returning
    delete patient.password
    return patient
  },

  /* =========================
     LOGIN VERIFY (FIXED)
  ========================= */
  async verifyPatient(email, password) {
    const db = await getDB()

    const patient = await db.collection("patients").findOne({ email })
    if (!patient) return null

    const isMatch = await bcrypt.compare(password, patient.password)
    if (!isMatch) return null

    return patient
  },

  /* =========================
     UPDATE PATIENT
  ========================= */
  async updatePatient(patientId, data) {
    const db = await getDB()

    await db
      .collection("patients")
      .updateOne({ patientId }, { $set: data })

    return this.getPatientById(patientId)
  },

  /* =========================
     DELETE PATIENT
  ========================= */
  async deletePatient(patientId) {
    const db = await getDB()
    return db.collection("patients").deleteOne({ patientId })
  },

  /* =========================
     🧠 DASHBOARD REPORTS
  ========================= */
  async getPatientReports(patientId) {
    const db = await getDB()

    const reports = await db
      .collection("labReports")
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray()

    return reports.map((r) => ({
      reportId: r._id.toString(),
      name: r.reportTitle,
      type: r.reportType,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      status: r.status || "pending-analysis",
      uploadDate: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString()
        : "—",
      analysis: r.analysis || null,
    }))
  },
}

export default PatientAPI
