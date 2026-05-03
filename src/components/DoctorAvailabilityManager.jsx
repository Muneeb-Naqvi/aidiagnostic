"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FAISALABAD_HOSPITALS } from "@/lib/hospitals"
import Swal from "sweetalert2"
import { Plus, Trash2, Clock, Calendar, Hospital, Save, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function DoctorAvailabilityManager({ doctorId }) {
  const [schedules, setSchedules] = useState([
    { hospitalName: "", days: [], startTime: "09:00", endTime: "17:00", slotDuration: 15, consultationFee: 0, isActive: true }
  ])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch existing schedules
  useEffect(() => {
    if (doctorId) {
      fetchDoctorSchedules()
    }
  }, [doctorId])

  const fetchDoctorSchedules = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedules`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setSchedules(data.data)
      }
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const addNewSchedule = () => {
    setSchedules([
      ...schedules,
      { hospitalName: "", days: [], startTime: "09:00", endTime: "17:00", slotDuration: 15, consultationFee: 0, isActive: true }
    ])
  }

  const removeSchedule = (index) => {
    if (schedules.length === 1) return
    const newSchedules = [...schedules]
    newSchedules.splice(index, 1)
    setSchedules(newSchedules)
  }

  const updateSchedule = (index, field, value) => {
    const newSchedules = [...schedules]
    newSchedules[index][field] = value
    setSchedules(newSchedules)
  }

  const toggleDay = (scheduleIndex, day) => {
    const newSchedules = [...schedules]
    const days = newSchedules[scheduleIndex].days
    if (days.includes(day)) {
      newSchedules[scheduleIndex].days = days.filter(d => d !== day)
    } else {
      newSchedules[scheduleIndex].days = [...days, day]
    }
    setSchedules(newSchedules)
  }

  const saveSchedules = async () => {
    // Validation
    const invalid = schedules.some(s => !s.hospitalName || s.days.length === 0 || s.startTime >= s.endTime)
    if (invalid) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Invalid Schedule', 
        text: 'Please fill all hospital details, select at least one day and set valid timings', 
        confirmButtonColor: '#EF4444' 
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules })
      })
      
      const data = await res.json()
      if (data.success) {
        Swal.fire({ 
          icon: 'success', 
          title: 'Saved!', 
          text: 'Your availability schedule has been updated successfully. Patients will now see your new timings.', 
          confirmButtonColor: '#10B981',
          timer: 3000
        })
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save schedule', confirmButtonColor: '#EF4444' })
    } finally {
      setSaving(false)
    }
  }

  // Generate time slots for selected date
  const generateSlots = () => {
    const dateObj = new Date(selectedDate)
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
    
    const slots = []
    schedules.forEach(schedule => {
      if (!schedule.isActive || !schedule.days.includes(dayName)) return
      
      let [startHour, startMin] = schedule.startTime.split(':').map(Number)
      let [endHour, endMin] = schedule.endTime.split(':').map(Number)
      
      let currentMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      while (currentMinutes < endMinutes) {
        const hour = Math.floor(currentMinutes / 60)
        const min = currentMinutes % 60
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          hospital: schedule.hospitalName,
          fee: schedule.consultationFee,
          isBooked: false,
          isPast: new Date(`${selectedDate} ${hour}:${min}`) < new Date()
        })
        currentMinutes += schedule.slotDuration
      }
    })
    
    setTimeSlots(slots)
  }

  useEffect(() => {
    if (selectedDate && schedules.length > 0) {
      generateSlots()
    }
  }, [selectedDate, schedules])

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="space-y-8">
      {/* Digital Clock Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Availability Management</h2>
            <p className="text-blue-100 mt-1">Manage your hospital schedules and available time slots</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold tracking-wider">
              {currentTime.toLocaleTimeString('en-PK', { hour12: false })}
            </div>
            <div className="text-blue-100 mt-1">
              {currentTime.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Schedules */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-blue-600" />
              Hospital Schedules
            </CardTitle>
            <Button onClick={addNewSchedule} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Hospital
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          {schedules.map((schedule, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Hospital Schedule #{index + 1}</h3>
                {schedules.length > 1 && (
                  <button
                    onClick={() => removeSchedule(index)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <Label>Hospital Name (Faisalabad)</Label>
                <select
                  className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                  value={schedule.hospitalName}
                  onChange={(e) => updateSchedule(index, 'hospitalName', e.target.value)}
                >
                  <option value="">Select Hospital</option>
                  {FAISALABAD_HOSPITALS.map((hospital) => (
                    <option key={hospital} value={hospital}>{hospital}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Available Days</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index, day)}
                      className={`py-2.5 text-xs font-medium rounded-lg transition-all ${
                        schedule.days.includes(day)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                    value={schedule.startTime}
                    onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <input
                    type="time"
                    className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                    value={schedule.endTime}
                    onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Slot Duration</Label>
                  <select
                    className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                    value={schedule.slotDuration}
                    onChange={(e) => updateSchedule(index, 'slotDuration', parseInt(e.target.value))}
                  >
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                  </select>
                </div>
                <div>
                  <Label>Consultation Fee (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={schedule.consultationFee}
                    onChange={(e) => updateSchedule(index, 'consultationFee', parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateSchedule(index, 'isActive', !schedule.isActive)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    schedule.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {schedule.isActive ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
                  {schedule.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </motion.div>
          ))}

          <Button
            onClick={saveSchedules}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Availability Schedule'}
          </Button>
        </CardContent>
      </Card>

      {/* Calendar & Time Slots Preview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Time Slots Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Select Date</Label>
              <input
                type="date"
                className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="text-sm text-slate-500">
              {new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {timeSlots.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                No availability set for this date
              </div>
            ) : (
              timeSlots.map((slot, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    slot.isPast
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : slot.isBooked
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-green-100 text-green-700 border border-green-200 cursor-pointer hover:bg-green-200'
                  }`}
                >
                  <div className="font-bold">{slot.time}</div>
                  <div className="text-xs mt-1 opacity-70">{slot.hospital?.slice(0, 12)}</div>
                </motion.div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
              <span className="text-sm text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
              <span className="text-sm text-slate-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-100"></div>
              <span className="text-sm text-slate-600">Past</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}