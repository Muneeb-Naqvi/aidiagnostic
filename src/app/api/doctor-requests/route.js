import DoctorRequestAPI from "@/app/api/doctorRequestAPI";
import { sendDoctorEmail } from "@/lib/emailService";

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      doctorEmail,
      phoneNumber,
      specialization,
      licenseNumber,
      password,
    } = body;

    // Map frontend field names to API expected names
    const email = doctorEmail || body.email;
    const phone = phoneNumber || body.phone;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !specialization ||
      !licenseNumber ||
      !password
    ) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doctorRequest = await DoctorRequestAPI.createRequest({
      firstName,
      lastName,
      doctorEmail: email,
      phone,
      specialization,
      licenseNumber,
      password,
    });

    // Send confirmation email to doctor
    try {
      await sendDoctorEmail(email, "✅ Access Request Received", `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2>Request Received!</h2>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
            <p>Dear Dr. ${firstName} ${lastName},</p>
            <p>Your doctor access request has been successfully submitted.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #3B82F6;">Request Details</h3>
              <p><strong>Specialization:</strong> ${specialization}</p>
              <p><strong>License Number:</strong> ${licenseNumber}</p>
              <p><strong>Status:</strong> <span style="color: #F59E0B;">Pending Review</span></p>
            </div>
            <p>Our admin team will review your application within 24-48 hours. You will receive email notification once decision is made.</p>
            <p style="color: #666;">Best Regards,<br>Medical Appointment System</p>
          </div>
        </div>
      `);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return Response.json(
      { success: true, data: doctorRequest },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST doctor-requests]", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ================== GET (Admin Dashboard) ==================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending / approved / rejected

    const requests = await DoctorRequestAPI.getRequests(status);

    return Response.json(
      { success: true, data: requests },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET doctor-requests]", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}









// import DoctorRequestAPI from "@/app/api/doctorRequestAPI";

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const {
//       firstName,
//       lastName,
//       email,      // frontend sends "email"
//       phone,
//       specialization,
//       licenseNumber,
//       password,
//     } = body;

//     // Required field check
//     if (
//       !firstName ||
//       !lastName ||
//       !email ||
//       !phone ||
//       !specialization ||
//       !licenseNumber ||
//       !password
//     ) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Missing required fields" }),
//         { status: 400 }
//       );
//     }

//     // Map email -> doctorEmail
//     const doctorRequest = await DoctorRequestAPI.createRequest({
//       firstName,
//       lastName,
//       doctorEmail: email, // important
//       phone,
//       specialization,
//       licenseNumber,
//       password,
//     });

//     return new Response(
//       JSON.stringify({ success: true, data: doctorRequest }),
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("[API] Doctor request error:", err);
//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: err.message || "Failed to submit request",
//       }),
//       { status: 500 }
//     );
//   }
// }


