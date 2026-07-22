import { getDB } from "@/config/database";

export async function PATCH(request, { params }) {
  try {
    const { appointmentId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return Response.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Update appointment in doctors collection
    const doctorResult = await db.collection("doctors").updateOne(
      { "appointments.appointmentId": appointmentId },
      { 
        $set: { 
          "appointments.$.status": status,
          "appointments.$.updatedAt": new Date()
        }
      }
    );

    // Also update in patients collection
    const patientResult = await db.collection("patients").updateOne(
      { "appointments.appointmentId": appointmentId },
      { 
        $set: { 
          "appointments.$.status": status,
          "appointments.$.updatedAt": new Date()
        }
      }
    );

    // Also update in top-level appointments collection
    await db.collection("appointments").updateOne(
      { appointmentId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (doctorResult.matchedCount === 0) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: `Appointment ${status} successfully`,
    });
  } catch (error) {
    console.error("[API] Error updating appointment status:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
