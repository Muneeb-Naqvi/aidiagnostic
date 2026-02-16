import { getDB } from "@/config/database"

const COLLECTION = "prescriptions"

const PrescriptionAPI = {
  // ✅ Get all prescriptions
  async getAllPrescriptions() {
    return await getDB()
      .collection(COLLECTION)
      .find()
      .sort({ createdAt: -1 })
      .toArray()
  },

  // ✅ Get prescription by prescriptionId
  async getPrescriptionById(prescriptionId) {
    return await getDB()
      .collection(COLLECTION)
      .findOne({ prescriptionId })
  },

  // ✅ Get prescriptions by patient
  async getPatientPrescriptions(patientId) {
    return await getDB()
      .collection(COLLECTION)
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray()
  },

  // ✅ Get prescriptions by doctor
  async getDoctorPrescriptions(doctorId) {
    return await getDB()
      .collection(COLLECTION)
      .find({ doctorId })
      .sort({ createdAt: -1 })
      .toArray()
  },

  // ✅ Create new prescription
  async createPrescription(data) {
    const prescription = {
      prescriptionId: `RX-${Date.now()}`,
      doctorId: data.doctorId,
      patientId: data.patientId,
      medicines: data.medicines || [],
      diagnosis: data.diagnosis || "",
      advice: data.advice || "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await getDB().collection(COLLECTION).insertOne(prescription)
    return prescription
  },

  // ✅ Update prescription
  async updatePrescription(prescriptionId, data) {
    const result = await getDB()
      .collection(COLLECTION)
      .findOneAndUpdate(
        { prescriptionId },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      )

    return result.value
  },

  // ✅ Delete prescription
  async deletePrescription(prescriptionId) {
    return await getDB()
      .collection(COLLECTION)
      .deleteOne({ prescriptionId })
  },
}

export default PrescriptionAPI
