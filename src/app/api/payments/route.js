import { getDB } from "@/config/database";
import { sendPaymentReceiptEmail } from "@/lib/emailService";

export async function POST(request) {
  try {
    const db = await getDB();
    const body = await request.json();
    const { patientId, patientName, patientEmail, amount, description, paymentMethod, appointmentId, prescriptionId } = body;

    console.log("[PAYMENT] Processing payment:", { patientId, amount, description });

    if (!patientId || !amount) {
      return Response.json(
        { success: false, error: "Patient ID and amount are required" },
        { status: 400 }
      );
    }

    // Generate unique receipt ID
    const receiptId = `RCPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const paymentDoc = {
      receiptId,
      patientId,
      patientName: patientName || "Unknown Patient",
      patientEmail: patientEmail || "",
      amount,
      description: description || "Medical Service",
      paymentMethod: paymentMethod || "Online",
      appointmentId: appointmentId || null,
      prescriptionId: prescriptionId || null,
      paymentDate: new Date(),
      status: "completed",
      createdAt: new Date(),
    };

    // Save payment to database
    await db.collection("payments").insertOne(paymentDoc);

    // Update patient's payment history
    try {
      await db.collection("patients").updateOne(
        { patientId },
        {
          $push: {
            payments: {
              receiptId,
              amount,
              description,
              paymentDate: paymentDoc.paymentDate,
            },
          },
          $set: { updatedAt: new Date() }
        }
      );
    } catch (patientUpdateError) {
      console.log("Patient payment history update failed:", patientUpdateError.message);
    }

    // Send payment receipt email
    if (patientEmail) {
      try {
        await sendPaymentReceiptEmail(patientEmail, paymentDoc);
        console.log("[PAYMENT] Receipt email sent to:", patientEmail);
      } catch (emailError) {
        console.error("[PAYMENT] Failed to send receipt email:", emailError);
      }
    }

    return Response.json({
      success: true,
      message: "Payment processed successfully",
      data: paymentDoc,
    }, { status: 201 });
  } catch (error) {
    console.error("[API] Error processing payment:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const receiptId = searchParams.get("receiptId");
    const all = searchParams.get("all");

    let payment = null;

    if (receiptId) {
      payment = await db.collection("payments").findOne({ receiptId });
      return Response.json({ success: true, data: payment });
    }

    if (patientId) {
      const payments = await db.collection("payments")
        .find({ patientId })
        .sort({ createdAt: -1 })
        .toArray();
      return Response.json({ success: true, data: payments });
    }

    if (all === "true") {
      const payments = await db.collection("payments")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return Response.json({ success: true, data: payments });
    }

    return Response.json(
      { success: false, error: "Patient ID, Receipt ID, or all=true required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Error fetching payments:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}