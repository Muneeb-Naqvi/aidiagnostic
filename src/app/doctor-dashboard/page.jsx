"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { DoctorSidebar } from "@/components/doctor-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrescriptionModal } from "@/components/prescription-modal"
import {
  Stethoscope,
  User,
  FileText,
  Plus,
  ChevronRight,
  Search,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
} from "lucide-react"

function DoctorDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [doctorId, setDoctorId] = useState("")
  const [prescriptionPatient, setPrescriptionPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "John Smith",
      age: 45,
      condition: "Hypertension",
      lastVisit: "2024-01-18",
      status: "active",
      reports: 3,
    },
    {
      id: 2,
      name: "Sarah Wilson",
      age: 32,
      condition: "Diabetes Type 2",
      lastVisit: "2024-01-17",
      status: "active",
      reports: 5,
    },
    {
      id: 3,
      name: "Michael Johnson",
      age: 55,
      condition: "Heart Disease",
      lastVisit: "2024-01-10",
      status: "inactive",
      reports: 8,
    },
  ])

  const [labReports, setLabReports] = useState([
    {
      id: 1,
      patientName: "John Smith",
      reportType: "Blood Test",
      uploadDate: "2024-01-20",
      status: "pending-analysis",
      findings: "Elevated cholesterol levels",
    },
    {
      id: 2,
      patientName: "Sarah Wilson",
      reportType: "Glucose Test",
      uploadDate: "2024-01-19",
      status: "analyzed",
      findings: "Fasting glucose: 145 mg/dL (elevated)",
    },
    {
      id: 3,
      patientName: "Michael Johnson",
      reportType: "ECG",
      uploadDate: "2024-01-15",
      status: "analyzed",
      findings: "Normal sinus rhythm, no acute changes",
    },
  ])

  const [selectedReport, setSelectedReport] = useState(null)
  const [analysis, setAnalysis] = useState("")

  useEffect(() => {
    const id = localStorage.getItem("doctorId")
    setDoctorId(id || "DR000000000000")
  }, [])

  const handleAnalyzeReport = (reportId) => {
    const report = labReports.find((r) => r.id === reportId)
    setSelectedReport(report)
  }

  const handleSaveAnalysis = () => {
    setLabReports(
      labReports.map((r) => (r.id === selectedReport.id ? { ...r, status: "analyzed", findings: analysis } : r)),
    )
    setSelectedReport(null)
    setAnalysis("")
    alert("Analysis saved successfully!")
  }

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-[#FAFCFF]">
      {/* Sidebar - hidden on mobile, can be toggled with a menu button if needed */}
      <div className="hidden lg:block">
        <DoctorSidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Doctor Dashboard</h1>
              <p className="text-xs sm:text-sm text-[#64748B]">ID: {doctorId}</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-[#64748B]" />
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                D
              </div>
            </div>
          </div>
        </motion.div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{patients.length}</div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-1">Total Patients</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#F59E0B] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                        {labReports.filter((r) => r.status === "pending-analysis").length}
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-1">Pending Analysis</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#10B981] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                        {labReports.filter((r) => r.status === "analyzed").length}
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-1">Analyzed Reports</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                        {patients.filter((p) => p.status === "active").length}
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-1">Active Patients</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-[#0F172A] text-lg sm:text-xl">Recent Patients</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {patients.slice(0, 3).map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between py-3 sm:py-4 border-b border-[#E2E8F0] last:border-0"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0F172A] text-sm sm:text-base truncate">{patient.name}</p>
                          <p className="text-xs sm:text-sm text-[#64748B] truncate">{patient.condition}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748B] flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* My Patients Tab */}
          {activeTab === "patients" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-[#3B82F6]/20 h-10 sm:h-11 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-4 sm:space-y-5">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] truncate">{patient.name}</h3>
                          <p className="text-xs sm:text-sm text-[#64748B] truncate">{patient.condition}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start sm:self-auto ${
                          patient.status === "active"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#F3F4F6] text-[#374151]"
                        }`}
                      >
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 text-xs sm:text-sm">
                      <div>
                        <p className="text-[#64748B]">Age</p>
                        <p className="font-semibold text-[#0F172A]">{patient.age} years</p>
                      </div>
                      <div>
                        <p className="text-[#64748B]">Last Visit</p>
                        <p className="font-semibold text-[#0F172A]">{patient.lastVisit}</p>
                      </div>
                      <div>
                        <p className="text-[#64748B]">Reports</p>
                        <p className="font-semibold text-[#0F172A]">{patient.reports} files</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2 h-10 sm:h-11 text-sm">
                        <Eye className="w-4 h-4" />
                        View Records
                      </Button>
                      <Button
                        onClick={() => setPrescriptionPatient(patient.name)}
                        variant="outline"
                        className="flex-1 border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF] flex items-center justify-center gap-2 h-10 sm:h-11 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Prescription
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Lab Reports Tab */}
          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6">
              <div className="space-y-4 sm:space-y-5">
                {labReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
                      <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <FileText className="w-5 h-5 text-[#3B82F6]" />
                          <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">{report.reportType}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-[#64748B]">Patient: {report.patientName}</p>
                        <p className="text-xs sm:text-sm text-[#64748B]">Uploaded: {report.uploadDate}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start sm:self-auto ${
                          report.status === "analyzed"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {report.status === "analyzed" ? "Analyzed" : "Pending"}
                      </span>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-lg p-3 sm:p-4 mb-5 text-xs sm:text-sm">
                      <p className="text-[#374151]">
                        <span className="font-semibold text-[#0F172A]">Findings:</span> {report.findings}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF] flex items-center justify-center gap-2 h-10 sm:h-11 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        View Report
                      </Button>
                      {report.status === "pending-analysis" && (
                        <Button
                          onClick={() => handleAnalyzeReport(report.id)}
                          className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2 h-10 sm:h-11 text-sm"
                        >
                          Analyze
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Write Prescription Tab */}
          {activeTab === "prescription" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-[#0F172A] text-lg sm:text-xl">Select Patient</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-3">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setPrescriptionPatient(patient.name)}
                        className="w-full flex items-center justify-between p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#EFF6FF] transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0F172A] text-sm sm:text-base truncate">{patient.name}</p>
                          <p className="text-xs sm:text-sm text-[#64748B] truncate">{patient.condition}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#64748B] flex-shrink-0 ml-3" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      <PrescriptionModal
        isOpen={!!prescriptionPatient}
        onClose={() => setPrescriptionPatient(null)}
        patientName={prescriptionPatient || ""}
      />
    </div>
  )
}

export default function DoctorDashboard() {
  return (
    <Suspense fallback={null}>
      <DoctorDashboardContent />
    </Suspense>
  )
}