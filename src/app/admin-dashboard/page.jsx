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

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [doctorRequests, setDoctorRequests] = useState([])
  const [approvedDoctors, setApprovedDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialization: "",
    licenseNumber: "",
  })

  // Fetch pending doctor requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/doctor-requests?status=pending")
        const data = await res.json()
        if (data.success) {
          setDoctorRequests(data.data)
        }
      } catch (error) {
        console.error("[Dashboard] Error fetching requests:", error)
      }
    }

    const fetchApprovedDoctors = async () => {
      try {
        const res = await fetch("/api/doctors")
        const data = await res.json()
        if (data.success) {
          setApprovedDoctors(data.data)
        }
      } catch (error) {
        console.error("[Dashboard] Error fetching doctors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
    fetchApprovedDoctors()
  }, [])

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/doctor-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "ADMIN_001" }),
      })

      const data = await res.json()
      if (data.success) {
        setDoctorRequests(doctorRequests.filter((r) => r.requestId !== requestId))
        setApprovedDoctors([...approvedDoctors, data.data])
        alert("Doctor approved successfully!")
      }
    } catch (error) {
      console.error("[Dashboard] Error approving request:", error)
      alert("Error approving request")
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
        setDoctorRequests(doctorRequests.filter((r) => r.requestId !== requestId))
        alert("Request rejected")
      }
    } catch (error) {
      console.error("[Dashboard] Error rejecting request:", error)
      alert("Error rejecting request")
    }
  }

  const handleAddDoctor = async (e) => {
    e.preventDefault()

    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialization) {
      alert("Please fill all required fields")
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
        alert("Doctor added successfully!")
      }
    } catch (error) {
      console.error("[Dashboard] Error adding doctor:", error)
      alert("Error adding doctor")
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      const res = await fetch(`/api/doctors/${doctorId}`, { method: "DELETE" })
      const data = await res.json()

      if (data.success) {
        setApprovedDoctors(approvedDoctors.filter((d) => d.doctorId !== doctorId))
        alert("Doctor deleted successfully!")
      }
    } catch (error) {
      console.error("[Dashboard] Error deleting doctor:", error)
      alert("Error deleting doctor")
    }
  }

  if (loading && activeTab === "overview") {
    return (
      <div className="flex min-h-screen bg-[#FAFCFF]">
        <AdminSidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#3B82F6] animate-spin mx-auto mb-4" />
            <p className="text-[#64748B]">Loading dashboard...</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#3B82F6] mb-2">{doctorRequests.length}</div>
                      <p className="text-[#64748B]">Pending Requests</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#10B981] mb-2">{approvedDoctors.length}</div>
                      <p className="text-[#64748B]">Approved Doctors</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#3B82F6] mb-2">Loading...</div>
                      <p className="text-[#64748B]">Active Patients</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E2E8F0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0F172A]">Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {doctorRequests.length === 0 ? (
                    <p className="text-[#64748B] text-center py-6">No pending requests</p>
                  ) : (
                    doctorRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.requestId}
                        className="flex items-center justify-between p-4 border-b border-[#E2E8F0] last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <User className="w-5 h-5 text-[#64748B]" />
                          <div>
                            <p className="font-semibold text-[#0F172A]">{request.name}</p>
                            <p className="text-sm text-[#64748B]">{request.specialization}</p>
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
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Pending Doctor Access Requests</h2>

              {doctorRequests.length === 0 ? (
                <Card className="border-[#E2E8F0]">
                  <CardContent className="pt-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-[#64748B] mx-auto mb-3 opacity-60" />
                      <p className="text-[#64748B]">No pending requests</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {doctorRequests.map((request) => (
                    <motion.div
                      key={request.requestId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#0F172A]">{request.name}</h3>
                          <div className="space-y-1.5 mt-2">
                            <p className="text-sm text-[#64748B] flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {request.email}
                            </p>
                            <p className="text-sm text-[#64748B] flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              {request.specialization}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-[#FEF3C7] text-[#B45309] rounded-full text-xs font-semibold">
                          {request.status || "Pending"}
                        </span>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-lg p-3 mb-5 text-sm text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">License:</span> {request.licenseNumber || "—"}
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
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Approved Doctors</h2>

              {approvedDoctors.length === 0 ? (
                <Card className="border-[#E2E8F0]">
                  <CardContent className="pt-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-[#64748B] mx-auto mb-3 opacity-60" />
                      <p className="text-[#64748B]">No approved doctors yet</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {approvedDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.doctorId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#0F172A]">{doctor.name}</h3>
                          <p className="text-sm text-[#64748B] mt-1">{doctor.specialization}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.doctorId)}
                          className="p-2 hover:bg-[#EF4444]/10 rounded-lg text-[#EF4444] transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-5 text-sm text-[#64748B]">
                        <p>
                          <span className="font-semibold text-[#0F172A]">ID:</span> {doctor.doctorId}
                        </p>
                        <p>
                          <span className="font-semibold text-[#0F172A]">Email:</span> {doctor.email}
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
      <CardTitle className="text-xl font-semibold text-slate-800">
        Add New Doctor
      </CardTitle>
      <p className="text-sm text-slate-500 mt-1.5">
        Enter the doctor's details to register them in the system.
      </p>
    </CardHeader>

    <CardContent className="pt-8 pb-10">
      <form onSubmit={handleAddDoctor} className="space-y-8">
        {/* Full Name */}
        <div className="space-y-4">
          <Label 
            htmlFor="doctorName" 
            className="text-sm font-medium text-slate-700 block"
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
            className="text-sm font-medium text-slate-700 block"
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
            className="text-sm font-medium text-slate-700 block"
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
            className="text-sm font-medium text-slate-700 block"
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
              <span className="font-medium">Note:</span> A unique Doctor ID will be automatically generated when you add the doctor.
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


