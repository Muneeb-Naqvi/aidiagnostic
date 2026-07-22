import { getDB } from "@/config/database";
import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "@/lib/emailService";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// This route must receive the raw request body — do NOT parse it as JSON.
// Next.js App Router: disable body parsing by exporting a config.
export const dynamic = "force-dynamic";

export async function POST(request) {
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("[STRIPE WEBHOOK] Missing Stripe-Signature header");
    return new Response("Missing signature", { status: 400 });
  }

  let event;
  try {
    // Read raw body — required for Stripe signature verification
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Signature verification failed:", err.message);
    return new Response(`Webhook verification failed: ${err.message}`, { status: 400 });
  }

  const db = await getDB();

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Only fulfill if Stripe confirms payment is paid
      if (session.payment_status === "paid") {
        const appointmentId = session.metadata?.appointmentId;

        if (appointmentId) {
          // Prevent double-processing: only update if not already paid
          await db.collection("patients").updateOne(
            {
              "appointments.appointmentId": appointmentId,
              "appointments.paymentStatus": { $ne: "paid" },
            },
            {
              $set: {
                "appointments.$.paymentStatus": "paid",
                "appointments.$.stripeSessionId": session.id,
                "appointments.$.stripePaymentIntentId": session.payment_intent,
                "appointments.$.paidAt": new Date(),
                "appointments.$.updatedAt": new Date(),
              },
            }
          );
          await db.collection("doctors").updateOne(
            {
              "appointments.appointmentId": appointmentId,
              "appointments.paymentStatus": { $ne: "paid" },
            },
            {
              $set: {
                "appointments.$.paymentStatus": "paid",
                "appointments.$.stripeSessionId": session.id,
                "appointments.$.stripePaymentIntentId": session.payment_intent,
                "appointments.$.paidAt": new Date(),
                "appointments.$.updatedAt": new Date(),
              },
            }
          );
        }

        // Create a payment record in the payments collection
        const existingPayment = await db
          .collection("payments")
          .findOne({ stripeSessionId: session.id });

        if (!existingPayment) {
          const receiptId = `RCPT-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

          const paymentDoc = {
            receiptId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            patientId: session.metadata?.patientId,
            patientName: session.metadata?.patientName,
            patientEmail: session.metadata?.patientEmail,
            amount: parseFloat(session.metadata?.amount || "0"),
            description: session.metadata?.description,
            paymentMethod: "Stripe",
            appointmentId: session.metadata?.appointmentId || null,
            paymentDate: new Date(),
            status: "completed",
            createdAt: new Date(),
          };

          await db.collection("payments").insertOne(paymentDoc);

          // Add to patient payment history
          if (session.metadata?.patientId) {
            await db.collection("patients").updateOne(
              { patientId: session.metadata.patientId },
              {
                $push: {
                  payments: {
                    receiptId,
                    amount: paymentDoc.amount,
                    description: paymentDoc.description,
                    paymentDate: paymentDoc.paymentDate,
                  },
                },
                $set: { updatedAt: new Date() },
              }
            );
          }

          // Send receipt email
          if (session.metadata?.patientEmail) {
            try {
              await sendPaymentReceiptEmail(session.metadata.patientEmail, paymentDoc);
            } catch (emailErr) {
              console.error("[STRIPE WEBHOOK] Receipt email failed:", emailErr);
            }
          }
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;

      if (appointmentId) {
        // Mark as expired so the patient can retry payment
        await db.collection("patients").updateOne(
          {
            "appointments.appointmentId": appointmentId,
            "appointments.paymentStatus": "pending",
          },
          {
            $set: {
              "appointments.$.paymentStatus": "expired",
              "appointments.$.updatedAt": new Date(),
            },
          }
        );
        await db.collection("doctors").updateOne(
          {
            "appointments.appointmentId": appointmentId,
            "appointments.paymentStatus": "pending",
          },
          {
            $set: {
              "appointments.$.paymentStatus": "expired",
              "appointments.$.updatedAt": new Date(),
            },
          }
        );
      }
    }

    if (
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;

      if (appointmentId) {
        await db.collection("patients").updateOne(
          {
            "appointments.appointmentId": appointmentId,
            "appointments.paymentStatus": "pending",
          },
          {
            $set: {
              "appointments.$.paymentStatus": "failed",
              "appointments.$.updatedAt": new Date(),
            },
          }
        );
        await db.collection("doctors").updateOne(
          {
            "appointments.appointmentId": appointmentId,
            "appointments.paymentStatus": "pending",
          },
          {
            $set: {
              "appointments.$.paymentStatus": "failed",
              "appointments.$.updatedAt": new Date(),
            },
          }
        );
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Processing error:", err);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
