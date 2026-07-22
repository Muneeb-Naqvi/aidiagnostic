"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Check, X, Mail, User, Briefcase, Loader } from "lucide-react"
import { SPECIALIZATIONS } from "@/lib/constants"
import { FAISALABAD_HOSPITALS } from "@/lib/hospitals"
import Swal from 'sweetalert2'

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [doctorRequests, setDoctorRequests] = useState([])
  const [approvedDoctors, setApprovedDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    aiAnalysisCount: 0,
    appointmentsGraph: []
  })
   const [newDoctor, setNewDoctor] = useState({
     name: "",
     email: "",
     specialization: "",
     licenseNumber: "",
     phoneNumber: "",
     degree: "",
     experience: "",
     consultationFee: "",
     hospitalSchedules: [
       { hospitalName: "", days: [], startTime: "09:00", endTime: "17:00", slotDuration: 15, consultationFee: 0 }
     ]
   })

// Fetch pending doctor requests
    useEffect(() => {
      const fetchRequests = async () => {
        try {
          const res = await fetch("/api/doctor-requests?status=pending")
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setDoctorRequests(data.data)
          } else {
            setDoctorRequests([])
          }
        } catch (error) {
          console.error("[Dashboard] Error fetching requests:", error)
          setDoctorRequests([])
        }
      }

      const fetchApprovedDoctors = async () => {
        try {
          const res = await fetch("/api/doctors")
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setApprovedDoctors(data.data)
          } else {
            setApprovedDoctors([])
          }
        } catch (error) {
          console.error("[Dashboard] Error fetching doctors:", error)
          setApprovedDoctors([])
        } finally {
          setLoading(false)
        }
      }

      // Fetch analytics
      const fetchAnalytics = async () => {
        try {
          const res = await fetch("/api/analytics?type=admin")
          const data = await res.json()
          if (data.success) {
            setAnalytics(data.data)
          }
        } catch (error) {
          console.error("[Dashboard] Error fetching analytics:", error)
        }
      }

      fetchRequests()
      fetchApprovedDoctors()
      fetchAnalytics()
    }, [])

  useEffect(() => {
    if (activeTab === "payments") {
      const fetchPayments = async () => {
        setLoadingPayments(true)
        try {
          const res = await fetch("/api/payments?all=true")
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setPayments(data.data)
          } else {
            setPayments([])
          }
        } catch (error) {
          console.error("[Dashboard] Error fetching payments:", error)
          setPayments([])
        } finally {
          setLoadingPayments(false)
        }
      }
      fetchPayments()
    }
  }, [activeTab])

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/doctor-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "ADMIN_001" }),
      })

      const data = await res.json()
      if (data.success) {
        setDoctorRequests(doctorRequests.filter((r) => r._id !== requestId))
        setApprovedDoctors([...approvedDoctors, data.data])
        Swal.fire({
          icon: 'success',
          title: 'Doctor Approved',
          text: 'Doctor has been approved successfully!',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      console.error("[Dashboard] Error approving request:", error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error approving doctor request',
        confirmButtonColor: '#EF4444'
      })
    }
  }

   const handleRejectRequest = async (requestId) => {
     try {
       const res = await fetch(`/api/doctor-requests/${requestId}/reject`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ adminId: "ADMIN_001", rejectionReason: "Administrative review" }),
       })

       const data = await res.json()
       if (data.success) {
         setDoctorRequests(doctorRequests.filter((r) => r._id !== requestId))
         Swal.fire({
           icon: 'info',
           title: 'Request Rejected',
           text: 'Doctor request has been rejected',
           confirmButtonColor: '#F59E0B',
           timer: 2000,
           timerProgressBar: true
         })
       }
     } catch (error) {
       console.error("[Dashboard] Error rejecting request:", error)
       Swal.fire({
         icon: 'error',
         title: 'Error',
         text: 'Error rejecting doctor request',
         confirmButtonColor: '#EF4444'
       })
     }
   }

  const handleAddDoctor = async (e) => {
    e.preventDefault()

    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please fill all required fields',
        confirmButtonColor: '#F59E0B'
      })
      return
    }

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
      })

      const data = await res.json()
      if (data.success) {
        setApprovedDoctors([...approvedDoctors, data.data])
        setNewDoctor({ name: "", email: "", specialization: "", licenseNumber: "" })
        Swal.fire({
          icon: 'success',
          title: 'Doctor Added',
          text: 'Doctor has been added successfully!',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      console.error("[Dashboard] Error adding doctor:", error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error adding doctor',
        confirmButtonColor: '#EF4444'
      })
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Doctor?',
      text: 'Are you sure you want to delete this doctor? This action cannot be undone.',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" })
      const data = await res.json()

      if (data.success) {
        setApprovedDoctors(approvedDoctors.filter((d) => d.doctorId !== doctorId))
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Doctor has been deleted successfully.',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      console.error("[Dashboard] Error deleting doctor:", error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting doctor',
        confirmButtonColor: '#EF4444'
      })
    }
  }

  if (loading && activeTab === "overview") {
    return (
      <div className="flex min-h-screen bg-[#FAFCFF]">
        <AdminSidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#3B82F6] animate-spin mx-auto mb-4" />
            <p className="text-black">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FAFCFF]">
      <AdminSidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <AdminHeader title="Admin Dashboard" subtitle="Manage doctors and patient requests" />

        <main className="flex-1 p-6 md:p-8 space-y-8">
{/* Overview Tab */}
           {activeTab === "overview" && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                 <Card className="border-[#E2E8F0] shadow-sm">
                   <CardContent className="pt-6">
                     <div className="text-center">
                       <div className="text-4xl font-bold text-[#3B82F6] mb-2">{analytics.totalDoctors}</div>
                       <p className="text-black">Total Doctors</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-[#E2E8F0] shadow-sm">
                   <CardContent className="pt-6">
                     <div className="text-center">
                       <div className="text-4xl font-bold text-[#10B981] mb-2">{analytics.totalPatients}</div>
                       <p className="text-black">Total Patients</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-[#E2E8F0] shadow-sm">
                   <CardContent className="pt-6">
                     <div className="text-center">
                       <div className="text-4xl font-bold text-[#F59E0B] mb-2">Rs. {analytics.totalRevenue.toLocaleString()}</div>
                       <p className="text-black">Revenue</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-[#E2E8F0] shadow-sm">
                   <CardContent className="pt-6">
                     <div className="text-center">
<div className="text-4xl font-bold text-[#3B82F6] mb-2">{analytics.totalAppointments}</div>
                        <p className="text-black">Total Appointments</p>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-[#E2E8F0] shadow-sm">
                   <CardContent className="pt-6">
                     <div className="text-center">
                       <div className="text-4xl font-bold text-[#7C3AED] mb-2">{analytics.aiAnalysisCount}</div>
                       <p className="text-black">AI Analyses</p>
                     </div>
                   </CardContent>
                 </Card>
               </div>

               {/* Appointments Graph */}
               <Card className="border-[#E2E8F0] shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-black">Appointments (Last 30 Days)</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 flex items-end justify-between gap-1">
{analytics.appointmentsGraph.length > 0 ? analytics.appointmentsGraph.map((item, idx) => {
                        const maxCount = Math.max(...analytics.appointmentsGraph.map(i => i.count), 1)
                        const height = (item.count / maxCount) * 100
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            <div className="w-full bg-[#3B82F6] rounded-t" style={{ height: `${Math.max(height, 5)}%` }}></div>
                            <span className="text-xs text-black mt-1">{item.date.split('-')[2]}</span>
                          </div>
                        )
                      }) : (
                       <div className="w-full text-center text-black">No appointment data available</div>
                     )}
                   </div>
                 </CardContent>
               </Card>

              <Card className="border-[#E2E8F0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                   {doctorRequests.length === 0 ? (
                     <p className="text-black text-center py-6">No pending requests</p>
                   ) : (
                     doctorRequests.slice(0, 3).map((request) => (
                       <div
                         key={request._id}
                         className="flex items-center justify-between p-4 border-b border-[#E2E8F0] last:border-0"
                       >
                         <div className="flex items-center gap-4">
                           <User className="w-5 h-5 text-black" />
                           <div>
                             <p className="font-semibold text-black">{request.firstName} {request.lastName}</p>
                             <p className="text-sm text-black">{request.specialization}</p>
                           </div>
                         </div>
                         <span className="px-3 py-1 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
                           Pending
                         </span>
                       </div>
                     ))
                   )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Doctor Requests Tab */}
          {activeTab === "requests" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-4">Pending Doctor Access Requests</h2>

              {doctorRequests.length === 0 ? (
                <Card className="border-[#E2E8F0]">
                  <CardContent className="pt-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-black mx-auto mb-3 opacity-60" />
                      <p className="text-black">No pending requests</p>
                    </div>
                  </CardContent>
                </Card>
               ) : (
                 <div className="space-y-5">
                   {doctorRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                           <h3 className="text-lg font-bold text-black">{request.firstName} {request.lastName}</h3>
                           <div className="space-y-1.5 mt-2">
                             <p className="text-sm text-black flex items-center gap-2">
                               <Mail className="w-4 h-4" />
                               {request.doctorEmail}
                             </p>
                             <p className="text-sm text-black flex items-center gap-2">
                               <Briefcase className="w-4 h-4" />
                               {request.specialization}
                             </p>
                           </div>
                        </div>
                        <span className="px-3 py-1 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
                          {request.status || "Pending"}
                        </span>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-lg p-3 mb-5 text-sm text-black">
                        <span className="font-semibold text-black">License:</span> {request.licenseNumber || "—"}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2"
                          onClick={() => handleApproveRequest(request._id)}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center justify-center gap-2"
                          onClick={() => handleRejectRequest(request._id)}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                     </motion.div>
                   ))}
                 </div>
              )}
            </motion.div>
          )}

          {/* Approved Doctors Tab */}
          {activeTab === "approved" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-4">Approved Doctors</h2>

              {approvedDoctors.length === 0 ? (
                <Card className="border-[#E2E8F0]">
                  <CardContent className="pt-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-black mx-auto mb-3 opacity-60" />
                      <p className="text-black">No approved doctors yet</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {Array.isArray(approvedDoctors) && approvedDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.doctorId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-black">{doctor.name}</h3>
                          <p className="text-sm text-black mt-1">{doctor.specialization}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.doctorId)}
                          className="p-2 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-5 text-sm text-black">
                        <p>
                          <span className="font-semibold text-black">ID:</span> {doctor.doctorId}
                        </p>
                        <p>
                          <span className="font-semibold text-black">Email:</span> {doctor.email}
                        </p>
                      </div>

                      <Button variant="outline" className="w-full border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 text-sm py-2">
                        Send Credentials Email
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Add Doctor Tab */}
          {activeTab === "add-doctor" && (
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="max-w-2xl mx-auto py-6"
>
  <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
    <CardHeader className="bg-slate-50/70 border-b border-slate-200 pb-6">
      <CardTitle className="text-xl font-semibold text-black">
        Add New Doctor
      </CardTitle>
      <p className="text-sm text-black mt-1.5">
        Enter the doctor's details to register them in the system.
      </p>
    </CardHeader>

    <CardContent className="pt-8 pb-10">
      <form onSubmit={handleAddDoctor} className="space-y-8">
        {/* Full Name */}
        <div className="space-y-4">
          <Label 
            htmlFor="doctorName" 
            className="text-sm font-medium text-black block"
          >
            Full Name
          </Label>
          <Input
            id="doctorName"
            type="text"
            placeholder="Dr. John Doe"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            className="w-full h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-4">
          <Label 
            htmlFor="doctorEmail" 
            className="text-sm font-medium text-black block"
          >
            Email Address
          </Label>
          <Input
            id="doctorEmail"
            type="email"
            placeholder="doctor@example.com"
            value={newDoctor.email}
            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
            className="w-full h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Specialization */}
        <div className="space-y-4">
          <Label 
            htmlFor="doctorSpecialization" 
            className="text-sm font-medium text-black block"
          >
            Specialization
          </Label>
          <select
            id="doctorSpecialization"
            className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 focus-visible:outline-none transition-colors"
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
          >
            <option value="">Select Specialization</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* License Number */}
        <div className="space-y-4">
          <Label 
            htmlFor="licenseNumber" 
            className="text-sm font-medium text-black block"
          >
            License Number
          </Label>
          <Input
            id="licenseNumber"
            type="text"
            placeholder="LIC123456"
            value={newDoctor.licenseNumber}
            onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
            className="w-full h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
          />
        </div>

         {/* Hospital & Availability Section */}
         <div className="space-y-6">
           <div className="border-b border-slate-200 pb-4">
             <h3 className="text-lg font-semibold text-black">Hospital & Availability Schedule</h3>
             <p className="text-sm text-black">Add hospitals and timings where doctor is available</p>
           </div>

            {newDoctor.hospitalSchedules && newDoctor.hospitalSchedules.length > 0 && newDoctor.hospitalSchedules.map((schedule, index) => (
             <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-5">
               <div className="flex justify-between items-center">
                 <h4 className="font-medium text-black">Hospital Schedule #{index + 1}</h4>
                 {index > 0 && (
                   <button
                     type="button"
                     onClick={() => {
                       const schedules = [...newDoctor.hospitalSchedules]
                       schedules.splice(index, 1)
                       setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                     }}
                     className="text-red-500 hover:text-red-700 text-sm font-medium"
                   >
                     Remove
                   </button>
                 )}
               </div>

               <div>
                 <Label className="text-sm font-medium text-black">Hospital Name</Label>
                 <select
                   className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                   value={schedule.hospitalName}
                   onChange={(e) => {
                     const schedules = [...newDoctor.hospitalSchedules]
                     schedules[index].hospitalName = e.target.value
                     setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                   }}
                 >
                   <option value="">Select Hospital (Faisalabad)</option>
                    {FAISALABAD_HOSPITALS.map((hospital) => (
                     <option key={hospital} value={hospital}>{hospital}</option>
                   ))}
                 </select>
               </div>

               <div>
                 <Label className="text-sm font-medium text-black">Available Days</Label>
                 <div className="grid grid-cols-7 gap-2 mt-2">
                   {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                     <label key={day} className="flex flex-col items-center">
                       <input
                         type="checkbox"
                         checked={schedule.days.includes(day)}
                         onChange={(e) => {
                           const schedules = [...newDoctor.hospitalSchedules]
                           if (e.target.checked) {
                             schedules[index].days.push(day)
                           } else {
                             schedules[index].days = schedules[index].days.filter(d => d !== day)
                           }
                           setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                         }}
                         className="w-4 h-4 text-blue-600 rounded"
                       />
                       <span className="text-xs mt-1 text-black">{day.slice(0, 3)}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label className="text-sm font-medium text-black">Start Time</Label>
                   <input
                     type="time"
                     className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                     value={schedule.startTime}
                     onChange={(e) => {
                       const schedules = [...newDoctor.hospitalSchedules]
                       schedules[index].startTime = e.target.value
                       setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                     }}
                   />
                 </div>
                 <div>
                   <Label className="text-sm font-medium text-black">End Time</Label>
                   <input
                     type="time"
                     className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                     value={schedule.endTime}
                     onChange={(e) => {
                       const schedules = [...newDoctor.hospitalSchedules]
                       schedules[index].endTime = e.target.value
                       setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                     }}
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label className="text-sm font-medium text-black">Slot Duration (minutes)</Label>
                   <select
                     className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20 transition-colors mt-2"
                     value={schedule.slotDuration}
                     onChange={(e) => {
                       const schedules = [...newDoctor.hospitalSchedules]
                       schedules[index].slotDuration = parseInt(e.target.value)
                       setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                     }}
                   >
                     <option value="10">10 minutes</option>
                     <option value="15">15 minutes</option>
                     <option value="20">20 minutes</option>
                     <option value="30">30 minutes</option>
                   </select>
                 </div>
                 <div>
                   <Label className="text-sm font-medium text-black">Consultation Fee (Rs.)</Label>
                   <Input
                     type="number"
                     placeholder="2000"
                     value={schedule.consultationFee}
                     onChange={(e) => {
                       const schedules = [...newDoctor.hospitalSchedules]
                       schedules[index].consultationFee = parseInt(e.target.value) || 0
                       setNewDoctor({ ...newDoctor, hospitalSchedules: schedules })
                     }}
                     className="mt-2"
                   />
                 </div>
               </div>
             </div>
           ))}

           <button
             type="button"
             onClick={() => {
               setNewDoctor({
                 ...newDoctor,
                 hospitalSchedules: [
                   ...newDoctor.hospitalSchedules,
                   { hospitalName: "", days: [], startTime: "09:00", endTime: "17:00", slotDuration: 15, consultationFee: 0 }
                 ]
               })
             }}
             className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-black hover:border-blue-500 hover:text-blue-600 transition-colors"
           >
             + Add Another Hospital Schedule
           </button>
         </div>

         {/* Note */}
         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mt-6">
           <div className="flex items-start gap-3">
             <svg 
               className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor"
               strokeWidth="2"
             >
               <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p>
               <span className="font-medium">Note:</span> A unique Doctor ID will be automatically generated. Login credentials will be sent to doctor's email after approval.
             </p>
           </div>
         </div>

         <Button
           type="submit"
           className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors mt-8"
         >
           Add Doctor
         </Button>
      </form>
    </CardContent>
  </Card>
</motion.div>
          )}

          {/* Platform Fees Tab */}
          {activeTab === "payments" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-black">Platform Fees &amp; Payments History</h2>
                  <p className="text-black text-sm">View transaction splits and total administrative commission (20%)</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-right">
                  <span className="text-xs text-blue-600 font-medium block">Total Commission Collected</span>
                  <span className="text-xl font-black text-blue-700">
                    Rs. {payments.reduce((sum, p) => sum + (p.adminAmount || (p.amount * 0.2)), 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {loadingPayments ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : payments.length === 0 ? (
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-black">No transactions found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-[#E2E8F0] shadow-sm rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-xs font-bold text-black uppercase">Receipt ID</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Patient</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Doctor</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Total Fee</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Doctor Share (80%)</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Platform Fee (20%)</th>
                          <th className="p-4 text-xs font-bold text-black uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.receiptId} className="hover:bg-slate-50/50">
                            <td className="p-4 text-sm font-semibold text-black">{p.receiptId}</td>
                            <td className="p-4 text-sm text-black">{p.patientName}</td>
                            <td className="p-4 text-sm text-black">Dr. {p.doctorName || "Specialist"}</td>
                            <td className="p-4 text-sm font-bold text-black">Rs. {p.amount?.toLocaleString()}</td>
                            <td className="p-4 text-sm text-emerald-600 font-bold">Rs. {(p.doctorAmount || (p.amount * 0.8))?.toLocaleString()}</td>
                            <td className="p-4 text-sm text-blue-600 font-bold">Rs. {(p.adminAmount || (p.amount * 0.2))?.toLocaleString()}</td>
                            <td className="p-4 text-sm text-black">
                              {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  )
}


