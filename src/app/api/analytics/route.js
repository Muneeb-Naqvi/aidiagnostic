import { getDB } from "@/config/database";

export async function GET(request) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const doctorId = searchParams.get("doctorId");

    if (type === "admin") {
      // Admin analytics - overall system stats
      const validAppointmentQuery = {
        $or: [
          { paymentStatus: "paid" },
          { paymentStatus: { $exists: false }, status: { $ne: "payment_pending" } }
        ]
      };

      const [totalDoctors, totalPatients, totalAppointments, totalPrescriptions, totalPayments] = await Promise.all([
        db.collection("doctors").countDocuments({}),
        db.collection("patients").countDocuments({}),
        db.collection("appointments").countDocuments(validAppointmentQuery),
        db.collection("prescriptions").countDocuments({}),
        db.collection("payments").countDocuments({})
      ]);

      // Calculate admin platform fee revenue (20% of payments)
      const payments = await db.collection("payments").find({}).toArray();
      const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.adminAmount || (p.amount * 0.2)) || 0), 0);

      // Appointments over last 30 days for graph
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const appointmentsByDay = await db.collection("appointments").aggregate([
        { 
          $match: { 
            createdAt: { $gte: thirtyDaysAgo },
            ...validAppointmentQuery
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      // AI Analysis count (analyzed lab reports)
      const aiAnalysisCount = await db.collection("labReports").countDocuments({ status: "analyzed" });

      return Response.json({
        success: true,
        data: {
          totalDoctors,
          totalPatients,
          totalAppointments,
          totalPrescriptions,
          totalRevenue,
          aiAnalysisCount,
          appointmentsGraph: appointmentsByDay.map(a => ({ date: a._id, count: a.count }))
        }
      });
    }

    if (type === "doctor" && doctorId) {
      // Doctor-specific analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const validAppointmentQuery = {
        doctorId,
        $or: [
          { paymentStatus: "paid" },
          { paymentStatus: { $exists: false }, status: { $ne: "payment_pending" } }
        ]
      };

      const [appointments, prescriptions, payments] = await Promise.all([
        db.collection("appointments").find(validAppointmentQuery).toArray(),
        db.collection("prescriptions").find({ doctorId }).toArray(),
        db.collection("payments").find({ "doctorId": doctorId }).toArray()
      ]);

      const monthlyPatients = new Set(
        appointments
          .filter(a => new Date(a.createdAt) >= thirtyDaysAgo)
          .map(a => a.patientId)
      ).size;

      // Doctor receives 80% share
      const earnings = payments.reduce((sum, p) => sum + (parseFloat(p.doctorAmount || (p.amount * 0.8)) || 0), 0);

      // Top diseases from prescriptions and appointments
      const diseaseMap = new Map();
      prescriptions.forEach(p => {
        if (p.diagnosis) {
          diseaseMap.set(p.diagnosis, (diseaseMap.get(p.diagnosis) || 0) + 1);
        }
      });
      appointments.forEach(a => {
        if (a.disease) {
          diseaseMap.set(a.disease, (diseaseMap.get(a.disease) || 0) + 1);
        }
      });

      const topDiseases = Array.from(diseaseMap.entries())
        .map(([disease, count]) => ({ disease, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return Response.json({
        success: true,
        data: {
          monthlyPatients,
          earnings,
          totalPrescriptions: prescriptions.length,
          totalAppointments: appointments.length,
          topDiseases
        }
      });
    }

    return Response.json({ success: false, error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("[API] Error fetching analytics:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}