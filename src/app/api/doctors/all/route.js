import { getDB } from "@/config/database";

/**
 * GET /api/doctors/all
 * 
 * Fetch all approved doctors for patient to browse and book appointments
 */
export async function GET(request) {
  try {
    const db = await getDB();

    // Get all approved doctors
    const doctors = await db
      .collection("doctors")
      .find({ status: "approved" })
      .project({
        password: 0, // Never return password
      })
      .toArray();

    // Transform doctor data
    const allDoctors = doctors.map((doc) => ({
      doctorId: doc.doctorId,
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      degree: doc.degree || "MBBS",
      experience: doc.experience || 0,
      gender: doc.gender || "Not specified",
      phoneNumber: doc.phoneNumber || "",
      whatsappNumber: doc.whatsappNumber || "",
      profileImage: doc.profileImage || "",
      website: doc.website || "",
      socialLinks: doc.socialLinks || {},
      consultationFee: doc.consultationFee || 0,
      ratings: doc.ratings || { average: 0, count: 0 },
      qualifications: doc.qualifications || [],
      totalConsultations: doc.totalConsultations || 0,
      address: doc.address || "",
    }));

    return Response.json({
      success: true,
      data: allDoctors,
      meta: {
        totalDoctorsFound: allDoctors.length,
      },
    });
  } catch (error) {
    console.error("[API] Error fetching all doctors:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
