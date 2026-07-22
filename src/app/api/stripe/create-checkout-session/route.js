import { getDB } from "@/config/database";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, patientName, patientEmail, description, appointmentId } = body;

    if (!patientId || !appointmentId) {
      return Response.json(
        { success: false, error: "Patient ID and Appointment ID are required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Read the fee from the database — never trust the amount from the frontend
    const patient = await db.collection("patients").findOne({
      patientId,
      "appointments.appointmentId": appointmentId,
    });

    if (!patient) {
      return Response.json(
        { success: false, error: "Appointment not found for this patient" },
        { status: 404 }
      );
    }

    const appointment = patient.appointments?.find(
      (a) => a.appointmentId === appointmentId
    );

    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Prevent creating a new session if already paid
    if (appointment.paymentStatus === "paid") {
      return Response.json(
        { success: false, error: "This appointment has already been paid" },
        { status: 400 }
      );
    }

    // Fetch the doctor to get the authoritative consultation fee
    const doctor = await db.collection("doctors").findOne({
      doctorId: appointment.doctorId,
    });

    // Use doctor's consultation fee from DB; fall back to stored fee, then 1000 PKR
    const authorizedAmount =
      doctor?.consultationFee || appointment.fee || 1000;

    // Create Stripe Checkout Session with server-side amount
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: description || `Consultation with Dr. ${appointment.doctorName || "Specialist"}`,
            },
            unit_amount: authorizedAmount * 100, // Stripe expects amount in lowest denomination
          },
          quantity: 1,
        },
      ],
      metadata: {
        patientId,
        patientName: patientName || patient.name || "",
        patientEmail: patientEmail || patient.email || "",
        amount: authorizedAmount.toString(),
        description: description || `Consultation with Dr. ${appointment.doctorName || "Specialist"}`,
        appointmentId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/patients-dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/patients-dashboard?payment=cancelled&appointmentId=${appointmentId}`,
      customer_email: patientEmail || patient.email || undefined,
    });

    // Save stripeSessionId on the appointment and mark paymentStatus as "pending"
    // DO NOT mark as "paid" here — only the webhook can do that
    await db.collection("patients").updateOne(
      { patientId, "appointments.appointmentId": appointmentId },
      {
        $set: {
          "appointments.$.paymentStatus": "pending",
          "appointments.$.stripeSessionId": session.id,
          "appointments.$.updatedAt": new Date(),
        },
      }
    );
    await db.collection("doctors").updateOne(
      { "appointments.appointmentId": appointmentId },
      {
        $set: {
          "appointments.$.paymentStatus": "pending",
          "appointments.$.stripeSessionId": session.id,
          "appointments.$.updatedAt": new Date(),
        },
      }
    );

    return Response.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[STRIPE API] Error creating checkout session:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
