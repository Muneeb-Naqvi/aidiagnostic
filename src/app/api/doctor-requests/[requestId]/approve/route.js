import getDB from "@/config/database";
import DoctorRequestAPI from "@/app/api/doctorRequestAPI";
import DoctorAPI from "@/lib/doctorAPI";
import { sendApprovalEmail } from "@/lib/emailService";

export async function POST(request, context) {
  try {
    await getDB();

    // ✅ FIX: await params
    const { requestId } = await context.params;

    if (!requestId) {
      return Response.json(
        { success: false, error: "Missing requestId" },
        { status: 400 }
      );
    }

    let adminId = "ADMIN";
    try {
      const body = await request.json();
      adminId = body?.adminId || "ADMIN";
    } catch { }

    const doctorId = `DR${Date.now()}${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const doctorRequest = await DoctorRequestAPI.approveRequest(
      requestId,
      doctorId,
      adminId
    );

    const newDoctor = await DoctorAPI.createDoctor(
      {
        name: `${doctorRequest.firstName} ${doctorRequest.lastName}`,
        email: doctorRequest.doctorEmail,
        specialization: doctorRequest.specialization,
        licenseNumber: doctorRequest.licenseNumber,
        password: doctorRequest.password, // already hashed
        doctorId
      },
      doctorId
    );
    
    // Update doctor request even if doctor already existed
    if (!doctorRequest.doctorId) {
      await DoctorRequestAPI.updateRequest(requestId, { doctorId: newDoctor.doctorId });
    }

    // Send approval email to doctor
    try {
      await sendApprovalEmail(doctorRequest.doctorEmail, {
        name: `${doctorRequest.firstName} ${doctorRequest.lastName}`,
        doctorId,
        email: doctorRequest.doctorEmail
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return Response.json({ success: true, doctorId, data: newDoctor }, { status: 200 });
  } catch (error) {
    console.error("[API] Approve error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}










// import { connectDB } from "@/config/database";
// import DoctorRequestAPI from "@/app/api/doctorRequestAPI";
// import DoctorAPI from "@/app/api/doctorAPI";

// export async function POST(request, { params }) {
//   try {
//     await connectDB();

//     const { requestId } = params;
//     if (!requestId) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Missing requestId" }),
//         { status: 400 }
//       );
//     }

//     let adminId = "ADMIN";
//     try {
//       const body = await request.json();
//       adminId = body?.adminId || "ADMIN";
//     } catch {}

//     const doctorId = `DR${Date.now()}${Math.random()
//       .toString(36)
//       .substr(2, 6)
//       .toUpperCase()}`;

//     // ✅ approve & get full request data
//     const doctorRequest = await DoctorRequestAPI.approveRequest(
//       requestId,
//       doctorId,
//       adminId
//     );

//     await DoctorAPI.createDoctor(
//       {
//         name: `${doctorRequest.firstName} ${doctorRequest.lastName}`,
//         email: doctorRequest.doctorEmail,
//         specialization: doctorRequest.specialization,
//         licenseNumber: doctorRequest.licenseNumber,
//         password: doctorRequest.password, // already hashed
//       },
//       doctorId
//     );

//     return new Response(
//       JSON.stringify({ success: true, doctorId }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("[API] Approve error:", error);
//     return new Response(
//       JSON.stringify({ success: false, error: error.message }),
//       { status: 500 }
//     );
//   }
// }
