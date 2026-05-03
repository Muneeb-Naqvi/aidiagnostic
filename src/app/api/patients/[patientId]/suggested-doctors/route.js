import { getDB } from "@/config/database";
import { getSpecializationForDisease } from "@/lib/diseaseMap";

/**
 * GET /api/patients/[patientId]/suggested-doctors
 * 
 * Fetch approved doctors based on diseases detected in patient's analyzed reports
 * Returns doctors whose specialization matches the detected diseases
 */
export async function GET(request, { params }) {
  try {
    const { patientId } = await params;

    if (!patientId) {
      return Response.json(
        { success: false, error: "Patient ID required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 1. Get all analyzed reports for this patient
    const patient = await db.collection("patients").findOne({ patientId });
    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get analyzed reports from lab-reports collection
    const reports = await db
      .collection("labReports")
      .find({
        patientId: patientId,
        status: "analyzed",
      })
      .toArray();

    // 2. Extract unique specializations from detected diseases
    const specializations = new Set();
    const detectedDiseases = [];

    reports.forEach((report) => {
      if (report.analysis?.disease) {
        detectedDiseases.push(report.analysis.disease);
        const spec = getSpecializationForDisease(report.analysis.disease);
        specializations.add(spec.toLowerCase());
      }

      // Also check suggestedSpecializations if available
      if (report.analysis?.suggestedSpecializations?.length > 0) {
        report.analysis.suggestedSpecializations.forEach((spec) => {
          specializations.add(spec.toLowerCase());
        });
      }
    });

    // If no specializations found, return empty
    if (specializations.size === 0) {
      return Response.json({
        success: true,
        data: [],
        message: "No analyzed reports yet. Upload and analyze reports to see suggested doctors.",
      });
    }

    // 3. Query doctors with matching specializations (only approved)
    const specArray = Array.from(specializations);
    const doctors = await db
      .collection("doctors")
      .find({
        status: "approved",
        $or: specArray.map((spec) => ({
          specialization: { $regex: spec, $options: "i" },
        })),
      })
      .project({
        password: 0, // Never return password
      })
      .toArray();

    // 4. Transform and enrich doctor data
    const suggestedDoctors = doctors.map((doc) => ({
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
      data: suggestedDoctors,
      meta: {
        detectedDiseases,
        matchingSpecializations: Array.from(specializations),
        totalDoctorsFound: suggestedDoctors.length,
      },
    });
  } catch (error) {
    console.error("[API] Error fetching suggested doctors:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
