import getDB from "@/config/database";
import DoctorAPI from "@/lib/doctorAPI";

export async function GET(request) {
  try {
    await getDB();
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get("specialization");
    const filter = specialization ? { specialization } : {};

    const doctors = await DoctorAPI.getAllDoctors(filter);
    return new Response(JSON.stringify({ success: true, data: doctors }), { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching doctors:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    await getDB();
    const body = await request.json();
    const { name, email, specialization, licenseNumber } = body;

    if (!name || !email || !specialization) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), { status: 400 });
    }

    const doctorId = `DR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const doctor = await DoctorAPI.createDoctor({ name, email, specialization, licenseNumber }, doctorId);

    return new Response(JSON.stringify({ success: true, data: doctor }), { status: 201 });
  } catch (error) {
    console.error("[API] Error creating doctor:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

