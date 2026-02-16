import getDB from "@/config/database";
import { DoctorAccessRequest } from "@/models/DoctorAccessRequest";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

class DoctorRequestAPI {
  // Get Mongo collection
  static async getCollection() {
    const db = await getDB();
    return DoctorAccessRequest.getCollection(db);
  }

  // Get all requests
  static async getAllRequests() {
    const collection = await this.getCollection();
    return await collection.find({}).toArray();
  }

  // Get pending requests
  static async getPendingRequests() {
    const collection = await this.getCollection();
    return await collection.find({ status: "pending" }).toArray();
  }

  // ✅ CREATE DOCTOR REQUEST (ERROR FIXED)
  static async createRequest(data) {
    // 🔒 Required fields check (phone optional)
    if (
      !data.firstName ||
      !data.lastName ||
      !data.doctorEmail ||
      !data.specialization ||
      !data.licenseNumber ||
      !data.password
    ) {
      throw new Error("Required fields are missing");
    }

    const collection = await this.getCollection();
    const db = await getDB();
    const email = data.doctorEmail.toLowerCase().trim();

    // 1. Check if doctor already exists in text 'doctors' collection
    const existingDoctor = await db.collection("doctors").findOne({ email: email });
    if (existingDoctor) {
      throw new Error("An account with this email already exists. Please login.");
    }

    // 2. Check if there is already a PENDING request
    const existingRequest = await collection.findOne({ doctorEmail: email, status: "pending" });
    if (existingRequest) {
      throw new Error("A request with this email is already pending approval.");
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // ✅ Create request safely
    const request = new DoctorAccessRequest({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      doctorEmail: data.doctorEmail.toLowerCase().trim(),
      phone: data.phone || "",
      specialization: data.specialization.trim(),
      licenseNumber: data.licenseNumber.trim(),
      password: hashedPassword,
      qualifications: data.qualifications || [],
      experience: data.experience || 0,
      bio: data.bio || "",
      hospital: data.hospital || "",
      status: "pending",          // ✅ ADD
      createdAt: new Date(),      // ✅ ADD
    });


    const result = await collection.insertOne(request);

    return {
      success: true,
      message: "Doctor signup request submitted successfully",
      data: { ...request, _id: result.insertedId },
    };
  }

  // Approve request
  static async approveRequest(requestId, doctorId, adminId = "ADMIN") {
    const collection = await this.getCollection();

    const request = await collection.findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) throw new Error("Request not found");

    await collection.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "approved",
          responseDate: new Date(),
          respondedBy: adminId,
          respondedByName: "Admin",
          doctorId,
        },
      }
    );

    // ✅ RETURN FULL REQUEST
    return {
      ...request,
      doctorId,
    };
  }

  // ✅ GET REQUESTS (ADMIN DASHBOARD)
  static async getRequests(status) {
    const collection = await this.getCollection()

    const query = status ? { status } : {}
    return await collection.find(query).sort({ createdAt: -1 }).toArray()
  }

  // Reject request
  static async rejectRequest(requestId, reason, adminId = "ADMIN") {
    const collection = await this.getCollection();

    const request = await collection.findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) throw new Error("Request not found");

    await collection.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "rejected",
          responseDate: new Date(),
          respondedBy: adminId,
          respondedByName: "Admin",
          responseMessage: reason || "Rejected by admin",
        },
      }
    );

    return { success: true };
  }
}

export default DoctorRequestAPI;





