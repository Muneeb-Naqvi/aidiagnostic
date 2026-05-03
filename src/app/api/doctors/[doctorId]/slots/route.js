import getDB from "@/config/database"

// Generate time slots for a doctor based on their schedule
function generateTimeSlots(startTime, endTime, slotDuration = 15) {
  const slots = []
  let [startHour, startMin] = startTime.split(':').map(Number)
  let [endHour, endMin] = endTime.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const min = currentMinutes % 60
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      isBooked: false
    })
    currentMinutes += slotDuration
  }
  
  return slots
}

export async function GET(request, { params }) {
  const { doctorId } = await params;
  try {
    await getDB()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!doctorId || !date) {
      return Response.json({ 
        success: false, 
        error: "Doctor ID and date are required" 
      }, { status: 400 })
    }
    
    const db = await getDB()
    const doctors = db.collection('doctors')
    
    const doctor = await doctors.findOne({ doctorId })
    if (!doctor) {
      return Response.json({ 
        success: false, 
        error: "Doctor not found" 
      }, { status: 404 })
    }
    
    // Get day of week
    const selectedDate = new Date(date)
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
    
    // Find available hospitals for this day (case insensitive match)
    const availableSchedules = (doctor.hospitalSchedules || []).filter(schedule => 
      schedule.isActive !== false && schedule.days.some(d => d.toLowerCase() === dayName.toLowerCase())
    )
    
    const hospitalSlots = []
    
    // If no schedules found for this day, check if doctor has any schedules at all
    if (availableSchedules.length === 0 && doctor.hospitalSchedules && doctor.hospitalSchedules.length > 0) {
      // Return first available hospital schedule with all slots available for testing
      const defaultSchedule = doctor.hospitalSchedules[0];
      const slots = generateTimeSlots(defaultSchedule.startTime, defaultSchedule.endTime, defaultSchedule.slotDuration)
      
      hospitalSlots.push({
        hospitalName: defaultSchedule.hospitalName,
        consultationFee: defaultSchedule.consultationFee || doctor.consultationFee,
        startTime: defaultSchedule.startTime,
        endTime: defaultSchedule.endTime,
        slots
      })
    } else {
      for (const schedule of availableSchedules) {
        const slots = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration)
        
        // Check existing booked slots for this date
        const existingSlots = (doctor.timeSlots || []).find(ts => 
          ts.date === date && ts.hospitalName === schedule.hospitalName
        )
        
        if (existingSlots) {
          slots.forEach(slot => {
            const booked = existingSlots.slots.find(s => s.time === slot.time && s.isBooked)
            if (booked) {
              slot.isBooked = true
              slot.appointmentId = booked.appointmentId
            }
          })
        }
        
        hospitalSlots.push({
          hospitalName: schedule.hospitalName,
          consultationFee: schedule.consultationFee || doctor.consultationFee,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slots
        })
      }
    }
    
    return Response.json({
      success: true,
      data: {
        doctorName: doctor.name,
        specialization: doctor.specialization,
        date,
        dayName,
        hospitalSlots
      }
    })
    
  } catch (error) {
    console.error("[API] Error fetching slots:", error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}