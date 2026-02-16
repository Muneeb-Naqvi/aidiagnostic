import connectDB from "@/lib/db"
import Doctor from "@/models/Doctor"

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const specialization = searchParams.get("specialization")

    if (!specialization) {
      return new Response(JSON.stringify({ message: "Specialization parameter is required" }), { status: 400 })
    }

    const doctors = await Doctor.find({
      specialization: specialization,
      status: "approved",
    }).select("-password")

    return new Response(
      JSON.stringify({
        message: "Doctors retrieved",
        doctors,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return new Response(JSON.stringify({ message: "Error fetching doctors" }), { status: 500 })
  }
}
