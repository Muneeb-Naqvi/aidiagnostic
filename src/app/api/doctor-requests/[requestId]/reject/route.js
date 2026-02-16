import getDB from "@/config/database";
import DoctorRequestAPI from "@/app/api/doctorRequestAPI";

export async function POST(request, context) {
  try {
    await getDB();

    // ✅ FIX: await params
    const { requestId } = await context.params;

    const body = await request.json();
    const { adminId, rejectionReason } = body;

    if (!requestId || !adminId) {
      return Response.json(
        { success: false, error: "RequestId or AdminId missing" },
        { status: 400 }
      );
    }

    await DoctorRequestAPI.rejectRequest(
      requestId,
      rejectionReason,
      adminId
    );

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API] Reject error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}













// import { connectDB } from "@/config/database";
// import DoctorRequestAPI from "@/app/api/doctorRequestAPI";

// export async function POST(request, { params }) {
//   try {
//     await connectDB();
//     const body = await request.json();
//     const { adminId, rejectionReason } = body;

//     if (!adminId) {
//       return new Response(JSON.stringify({ success: false, error: "Admin ID required" }), { status: 400 });
//     }

//     const doctorRequest = await DoctorRequestAPI.rejectRequest(params.requestId, rejectionReason, adminId);

//     if (!doctorRequest) {
//       return new Response(JSON.stringify({ success: false, error: "Request not found" }), { status: 404 });
//     }

//     return new Response(JSON.stringify({ success: true, data: doctorRequest }), { status: 200 });
//   } catch (error) {
//     console.error("[API] Error rejecting request:", error);
//     return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
//   }
// }