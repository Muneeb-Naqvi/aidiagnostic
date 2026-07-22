import { getDB } from "@/config/database";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

/**
 * GET /api/stripe/verify-payment?appointmentId=APT-xxx
 *
 * Read-only: checks the appointment's paymentStatus from the database.
 * The database is only updated by the Stripe webhook — never here.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

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
    console.error("[VERIFY PAYMENT] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/stripe/verify-payment
 *
 * Legacy: retrieves the Stripe session for display purposes only.
 * Does NOT write anything to the database.
 * Payment fulfillment is handled exclusively by the webhook.
 */
export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json({ success: false, error: "Session ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const db = await getDB();

    const appointmentId = session.metadata?.appointmentId;
    let paymentStatus = "pending";

    if (appointmentId) {
      const patient = await db.collection("patients").findOne(
        { "appointments.appointmentId": appointmentId },
        { projection: { "appointments.$": 1 } }
      );
      paymentStatus = patient?.appointments?.[0]?.paymentStatus || "pending";
    }

    // Return the status from the DB — the webhook sets it, not this route
    return Response.json({
      success: true,
      paymentStatus,
      stripeStatus: session.payment_status,
      appointmentId,
    });
  } catch (error) {
    console.error("[VERIFY PAYMENT] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
