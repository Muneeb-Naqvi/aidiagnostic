import getDB from "@/config/database"

export async function GET(request, context) {
  try {
    await getDB()
    const { doctorId } = await context.params
    
    const db = await getDB()
    const doctors = db.collection('doctors')
    
    const doctor = await doctors.findOne({ doctorId }, { projection: { hospitalSchedules: 1, timeSlots: 1 } })
    
    if (!doctor) {
      return Response.json({ success: false, error: "Doctor not found" }, { status: 404 })
    }
    
    return Response.json({
      success: true,
      data: doctor.hospitalSchedules || [],
      timeSlots: doctor.timeSlots || []
    })
    
  } catch (error) {
    console.error("[API] Error fetching schedules:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request, context) {
  try {
    await getDB()
    const { doctorId } = await context.params
    const body = await request.json()
    const { schedules } = body
    
    if (!schedules || !Array.isArray(schedules)) {
      return Response.json({ success: false, error: "Invalid schedules data" }, { status: 400 })
    }
    
    const db = await getDB()
    const doctors = db.collection('doctors')
    
    await doctors.updateOne(
      { doctorId },
      { 
        $set: { 
          hospitalSchedules: schedules,
          updatedAt: new Date()
        } 
      }
    )
    
    return Response.json({ success: true, message: "Schedule updated successfully" })
    
  } catch (error) {
    console.error("[API] Error saving schedules:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}