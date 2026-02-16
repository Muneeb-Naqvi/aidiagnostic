import LabReportAPI from "@/lib/labReportAPI";
import DoctorAPI from "@/lib/doctorAPI";
import connectDB from "@/lib/db";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { patientId } = await params;

    if (!patientId) {
      return Response.json({ success: false, error: "Patient ID required" }, { status: 400 });
    }

    // 1. Get all analyzed reports for this patient
    const reports = await LabReportAPI.getAll({ patientId });
    const analyzedReports = reports.filter(r => r.status === "analyzed" && r.analysis?.suggestedSpecializations);

    // 2. Extract unique suggested specializations
    const specializations = new Set();
    analyzedReports.forEach(report => {
      report.analysis.suggestedSpecializations.forEach(spec => {
        specializations.add(spec.toLowerCase());
      });
    });

    // 3. Get matching doctors
    const allDoctors = await DoctorAPI.getAllDoctors({ status: "approved" });

    let suggestedDoctors = [];
    if (specializations.size > 0) {
      suggestedDoctors = allDoctors.filter(doc =>
        Array.from(specializations).some(spec =>
          doc.specialization?.toLowerCase().includes(spec)
        )
      );
    }

    return Response.json({
      success: true,
      data: suggestedDoctors,
    });
  } catch (error) {
    console.error("[API] Error fetching suggested doctors:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
