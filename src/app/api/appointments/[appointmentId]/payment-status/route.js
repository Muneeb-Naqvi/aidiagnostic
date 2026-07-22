import { getDB } from "@/config/database";

/**
 * GET /api/appointments/:appointmentId/payment-status
 *
 * Returns the current paymentStatus of an appointment from the database.
 * Used by the success/cancel page to display the correct result.
 * Never writes to the database — that is the webhook's job.
 */
export async function GET(request, { params }) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId) {
      return Response.json(
        { success: false, error: "appointmentId is required" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const patient = await db.collection("patients").findOne(
      { "appointments.appointmentId": appointmentId },
      { projection: { "appointments.$": 1 } }
    );

    const appointment = patient?.appointments?.[0];
    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      paymentStatus: appointment.paymentStatus || "unpaid",
      appointmentId,
    });
  } catch (error) {
    console.error("[PAYMENT STATUS] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
