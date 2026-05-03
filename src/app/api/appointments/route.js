import { getDB } from "@/config/database";
import LabReportAPI from "@/lib/labReportAPI";

export async function POST(request) {
  try {
    const body = await request.json();
    const { doctorId, doctorName, patientId, reportId, scheduledDate, scheduledTime, notes } = body;

    console.log("[APPOINTMENT] Booking request:", { doctorId, doctorName, patientId, scheduledDate, scheduledTime });

    if (!doctorId && !doctorName) {
      return Response.json(
        { success: false, error: "Doctor ID or Doctor Name is required" },
        { status: 400 }
      );
    }

    if (!patientId) {
      return Response.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const db = await getDB();
    
    // Get patient details
    const patient = await db.collection("patients").findOne({ patientId });
    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get doctor details - try by ID first, then by name
    let doctor = null;
    if (doctorId) {
      doctor = await db.collection("doctors").findOne({ doctorId });
    }
    
    // If no doctor found by ID, try finding by name (case-insensitive partial match)
    // Also try if doctorId itself might be a name (fallback from patient booking)
    if (!doctor && (doctorName || doctorId)) {
      const searchName = doctorName || doctorId;
      // Remove "Dr. " prefix if present for better matching
      const cleanName = searchName.replace(/^Dr\.\s*/i, '').trim();
      doctor = await db.collection("doctors").findOne({ 
        name: { $regex: new RegExp(cleanName, 'i') } 
      });
    }
    
    // Still no doctor? Create a placeholder or return error
    if (!doctor) {
      console.log("[APPOINTMENT] Doctor not found for:", { doctorId, doctorName });
      return Response.json(
        { success: false, error: "Doctor not found. Please select a valid doctor." },
        { status: 404 }
      );
    }

    console.log("[APPOINTMENT] Found doctor:", doctor.name, doctor.doctorId);

    // Get report details if provided
    let reportDetails = null;
    if (reportId) {
      const reports = await LabReportAPI.getAll({ patientId, db });
      reportDetails = reports.find(r => r._id?.toString() === reportId || r.reportId === reportId);
      // Also try directly from db
      if (!reportDetails) {
        const { ObjectId } = await import("mongodb");
        try {
          reportDetails = await db.collection("labReports").findOne({ _id: new ObjectId(reportId) });
        } catch {
          reportDetails = await db.collection("labReports").findOne({ patientId, status: "analyzed" });
        }
      }
    }

    // Create appointment object
    const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const appointment = {
      appointmentId,
      patientId,
      patientName: patient.name || "Unknown Patient",
      patientEmail: patient.email || "",
      patientPhone: patient.phoneNumber || "",
      doctorId: doctor.doctorId || doctorId,
      doctorName: doctor.name || doctorName,
      doctorSpecialization: doctor.specialization || "",
      reportId: reportId || null,
      disease: reportDetails?.analysis?.disease || null,
      reportName: reportDetails?.reportTitle || reportDetails?.name || null,
      reportFileUrl: reportDetails?.fileUrl || null,
      ocrText: reportDetails?.ocrText || null,
      reportAnalysis: reportDetails?.analysis || null,
      aiAnalysisResult: reportDetails?.analysis?.details || null,
      diseaseDetected: reportDetails?.analysis?.disease || null,
      status: "pending",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime: scheduledTime || null,
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add appointment to doctor's record
    // Use the found doctor's actual ID
    const actualDoctorId = doctor.doctorId || doctorId;
    console.log("[APPOINTMENT] Storing appointment for doctor:", actualDoctorId);
    
    await db.collection("doctors").updateOne(
      { doctorId: actualDoctorId },
      { 
        $push: { appointments: appointment },
        $set: { updatedAt: new Date() }
      }
    );

    // Also add to patient's appointments
    await db.collection("patients").updateOne(
      { patientId },
      { 
        $push: { 
          appointments: {
            ...appointment,
            doctorName: `Dr. ${doctor.name}`,
            doctorSpecialization: doctor.specialization,
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    return Response.json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointmentId,
        doctorName: `Dr. ${doctor.name}`,
        doctorSpecialization: doctor.specialization,
        patientName: patient.name,
        scheduledDate: appointment.scheduledDate,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("[API] Error booking appointment:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");

    const db = await getDB();
    let appointments = [];

    if (doctorId) {
      // Get appointments for a specific doctor
      const doctor = await db.collection("doctors").findOne({ doctorId });
      appointments = doctor?.appointments || [];
    } else if (patientId) {
      // Get appointments for a specific patient
      const patient = await db.collection("patients").findOne({ patientId });
      appointments = patient?.appointments || [];
    } else {
      return Response.json(
        { success: false, error: "Doctor ID or Patient ID required" },
        { status: 400 }
      );
    }

    // Sort by date descending (newest first)
    appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return Response.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("[API] Error fetching appointments:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
