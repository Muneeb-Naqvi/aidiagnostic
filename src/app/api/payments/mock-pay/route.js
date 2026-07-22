import { getDB } from "@/config/database";

export async function GET(request) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return Response.json(
        { success: false, error: "appointmentId is required" },
        { status: 400 }
      );
    }

    const appointment = await db.collection("appointments").findOne({ appointmentId });
    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        appointmentId: appointment.appointmentId,
        doctorName: appointment.doctorName,
        patientName: appointment.patientName,
        fee: appointment.fee || 1000,
        scheduledDate: appointment.scheduledDate,
        scheduledTime: appointment.scheduledTime,
        paymentStatus: appointment.paymentStatus || "unpaid"
      }
    });
  } catch (error) {
    console.error("[MOCK PAY API GET] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await getDB();
    const body = await request.json();
    const { appointmentId, cardholderName, cardNumber, expiryDate, cvc } = body;

    if (!appointmentId) {
      return Response.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    if (!cardholderName || !cardNumber || !expiryDate || !cvc) {
      return Response.json(
        { success: false, error: "All card details are required" },
        { status: 400 }
      );
    }

    // Retrieve appointment
    const appointment = await db.collection("appointments").findOne({ appointmentId });
    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.paymentStatus === "paid") {
      return Response.json(
        { success: false, error: "Appointment already paid" },
        { status: 400 }
      );
    }

    const fee = parseFloat(appointment.fee || 1000);
    const doctorAmount = fee * 0.8;
    const adminAmount = fee * 0.2;
    const paidAt = new Date();

    // 1. Update status in top-level appointments collection
    await db.collection("appointments").updateOne(
      { appointmentId },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          paidAt,
          updatedAt: new Date()
        }
      }
    );

    // 2. Update embedded appointments in patients collection
    await db.collection("patients").updateOne(
      { "appointments.appointmentId": appointmentId },
      {
        $set: {
          "appointments.$.paymentStatus": "paid",
          "appointments.$.status": "confirmed",
          "appointments.$.paidAt": paidAt,
          "appointments.$.updatedAt": new Date()
        }
      }
    );

    // 3. Update embedded appointments in doctors collection
    await db.collection("doctors").updateOne(
      { "appointments.appointmentId": appointmentId },
      {
        $set: {
          "appointments.$.paymentStatus": "paid",
          "appointments.$.status": "confirmed",
          "appointments.$.paidAt": paidAt,
          "appointments.$.updatedAt": new Date()
        }
      }
    );

    // 4. Generate unique receipt ID & create payment record
    const receiptId = `RCPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentDoc = {
      receiptId,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail || "",
      amount: fee,
      doctorAmount,
      adminAmount,
      paymentMethod: "Mock Card Payment",
      appointmentId,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      paymentDate: paidAt,
      status: "completed",
      createdAt: paidAt
    };

    await db.collection("payments").insertOne(paymentDoc);

    // 5. Update patient's payment history list
    await db.collection("patients").updateOne(
      { patientId: appointment.patientId },
      {
        $push: {
          payments: {
            receiptId,
            amount: fee,
            description: `Consultation with Dr. ${appointment.doctorName}`,
            paymentDate: paidAt
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`[MOCK PAYMENT] Successful split: total=${fee}, doctor(80%)=${doctorAmount}, admin(20%)=${adminAmount}`);

    return Response.json({
      success: true,
      message: "Mock payment processed successfully",
      data: {
        receiptId,
        amount: fee
      }
    });
  } catch (error) {
    console.error("[MOCK PAY API POST] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
