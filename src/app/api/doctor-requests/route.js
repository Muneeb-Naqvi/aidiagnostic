import DoctorRequestAPI from "@/app/api/doctorRequestAPI";

// ================== POST (Doctor Signup) ==================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      specialization,
      licenseNumber,
      password,
    } = body;

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


