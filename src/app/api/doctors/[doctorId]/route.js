import getDB from "@/config/database";
import DoctorAPI from "@/lib/doctorAPI";

export async function GET(request, { params }) {
  try {
    await getDB();
    const { doctorId } = await params;
    const doctor = await DoctorAPI.getDoctorById(doctorId);

    if (!doctor) {
      return new Response(JSON.stringify({ success: false, error: "Doctor not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: doctor }), { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching doctor:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await getDB();
    const body = await request.json();
    const { doctorId } = await params;
    const doctor = await DoctorAPI.updateDoctor(doctorId, body);

    if (!doctor) {
      return new Response(JSON.stringify({ success: false, error: "Doctor not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: doctor }), { status: 200 });
  } catch (error) {
    console.error("[API] Error updating doctor:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await getDB();
    const { doctorId } = await params;
    const result = await DoctorAPI.deleteDoctor(doctorId);

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ success: false, error: "Doctor not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200 });
  } catch (error) {
    console.error("[API] Error deleting doctor:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}