"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { DoctorSidebar } from "@/components/doctor-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrescriptionModal } from "@/components/prescription-modal"
import PDFViewer from "@/components/PDFViewer"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DoctorAvailabilityManager } from "@/components/DoctorAvailabilityManager"
import {
  Stethoscope,
  User,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
  Calendar,
  Clock,
  AlertCircle,
  X,
  Check,
  XCircle,
  Activity,
  Sparkles,
  Mail,
  Phone,
  Send,
  Loader2,
  ClipboardList,
} from "lucide-react"

function DoctorDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [doctorId, setDoctorId] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [prescriptionPatient, setPrescriptionPatient] = useState(null)
  const [prescriptionAppointment, setPrescriptionAppointment] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null)
  const pollRef = useRef(null)

  // Real patients data - derived from appointments
  const [patients, setPatients] = useState([])

  // Real lab reports - we'll use appointment data
  const [labReports, setLabReports] = useState([])

  const [selectedReport, setSelectedReport] = useState(null)
  const [analysis, setAnalysis] = useState("")

  // Patient prescriptions - saved from this session
  const [localPrescriptions, setLocalPrescriptions] = useState([])
  const [selectedPatientData, setSelectedPatientData] = useState(null)

  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null)
  const [patientReports, setPatientReports] = useState([])
  const [loadingPatientReports, setLoadingPatientReports] = useState(false)
  const [viewingPdfUrl, setViewingPdfUrl] = useState(null)
  const [analyzingReportId, setAnalyzingReportId] = useState(null)

  // Simple Prescription Form States
  const [prescDisease, setPrescDisease] = useState("")
  const [prescMedications, setPrescMedications] = useState("")
  const [prescDosage, setPrescDosage] = useState("")
  const [prescInstructions, setPrescInstructions] = useState("")
  const [prescNotes, setPrescNotes] = useState("")
  const [isSavingPresc, setIsSavingPresc] = useState(false)

  const totalEarnings = appointments
    .filter(a => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + (parseFloat(a.fee || 1000) * 0.8), 0);

  useEffect(() => {
    const id = localStorage.getItem("doctorId")
    const name = localStorage.getItem("doctorName")
    const resolvedId = id || "DR000000000000"
    setDoctorId(resolvedId)
    setDoctorName(name || "")

    // Fetch appointments on initial load
    fetchAppointments(resolvedId)
    fetchDoctorPrescriptions(resolvedId)
  }, [])

  // Fetch doctor's prescriptions
  const fetchDoctorPrescriptions = async (id) => {
    const dId = id || doctorId
    if (!dId) return
    try {
      const response = await fetch(`/api/prescriptions?doctorId=${dId}`)
      const data = await response.json()
      if (data.success) {
        setLocalPrescriptions(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err)
    }
  }

  // Fetch appointments
  const fetchAppointments = async (id) => {
    const dId = id || doctorId
    if (!dId) return
    setLoadingAppointments(true)
    try {
      const response = await fetch(`/api/appointments?doctorId=${dId}`)
      const data = await response.json()
      if (data.success) {
        const apts = data.data || []
        setAppointments(apts)
        setPendingCount(apts.filter((a) => a.status === "pending").length)

        // Derive patients from appointments
        const uniquePatients = []
        const patientMap = new Map()
        apts.forEach(apt => {
          if (apt.patientId && !patientMap.has(apt.patientId)) {
            patientMap.set(apt.patientId, true)
            uniquePatients.push({
              id: apt.patientId,
              name: apt.patientName || "Unknown Patient",
              age: apt.patientAge || "N/A",
              condition: apt.disease || apt.diseaseDetected || "General Checkup",
              lastVisit: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: apt.status === "pending" ? "active" : apt.status,
              reports: 1,
            })
          }
        })
        setPatients(uniquePatients)

        // Derive lab reports from appointments (reports attached to appointments)
        const reports = apts
          .filter(apt => apt.reportName)
          .map(apt => ({
            id: apt.reportId || apt.appointmentId,
            patientName: apt.patientName,
            reportType: apt.reportName,
            uploadDate: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: apt.status === "pending" ? "pending-analysis" : "analyzed",
            findings: apt.disease || apt.diseaseDetected || "No findings yet",
          }))
        setLabReports(reports)
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
    } finally {
      setLoadingAppointments(false)
    }
  }

  useEffect(() => {
    if (activeTab === "appointments" && doctorId) {
      fetchAppointments(doctorId)
    }
  }, [activeTab, doctorId])

  // Poll for new appointments every 30 seconds
  useEffect(() => {
    if (!doctorId) return
    // Initial check
    const checkNew = async () => {
      try {
        const res = await fetch(`/api/appointments?doctorId=${doctorId}`)
        const data = await res.json()
        if (data.success) {
          const apts = data.data || []
          const pending = apts.filter((a) => a.status === "pending").length
          setPendingCount((prev) => {
            if (pending > prev && prev !== 0) {
              toast.info(`You have ${pending} pending appointment${pending > 1 ? "s" : ""}!`, {
                action: { label: "View", onClick: () => router.push("?tab=appointments") },
              })
            }
            return pending
          })
          if (activeTab === "appointments") {
            setAppointments(apts)
            // Also update patients and labReports
            const uniquePatients = []
            const patientMap = new Map()
            apts.forEach(apt => {
              if (apt.patientId && !patientMap.has(apt.patientId)) {
                patientMap.set(apt.patientId, true)
                uniquePatients.push({
                  id: apt.patientId,
                  name: apt.patientName || "Unknown Patient",
                  age: apt.patientAge || "N/A",
                  gender: apt.patientGender,
                  hospital: apt.hospitalName,
                  condition: apt.disease || apt.diseaseDetected || "General Checkup",
                  lastVisit: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  status: apt.status === "pending" ? "active" : apt.status,
                  reports: 1,
                })
              }
            })
            setPatients(uniquePatients)

            const reports = apts
              .filter(apt => apt.reportName)
              .map(apt => ({
                id: apt.reportId || apt.appointmentId,
                patientName: apt.patientName,
                reportType: apt.reportName,
                uploadDate: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: apt.status === "pending" ? "pending-analysis" : "analyzed",
                findings: apt.disease || apt.diseaseDetected || "No findings yet",
              }))
            setLabReports(reports)
          }
        }
      } catch { }
    }
    pollRef.current = setInterval(checkNew, 30000)
    return () => clearInterval(pollRef.current)
  }, [doctorId])

  // Fetch full patient data when opening prescription modal
  useEffect(() => {
    if (prescriptionAppointment?.patientId) {
      fetch(`/api/patients/${prescriptionAppointment.patientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSelectedPatientData(data.data)
          }
        })
        .catch(err => console.error("Error fetching patient data:", err))
    } else {
      setSelectedPatientData(null)
    }
  }, [prescriptionAppointment])

  const handleAnalyzeReport = (reportId) => {
    const report = labReports.find((r) => r.id === reportId)
    setSelectedReport(report)
  }

  const handleSaveAnalysis = async () => {
    // If saving from Prescription tab
    if (prescriptionAppointment?.patientId) {
      if (!prescDisease || !prescMedications) {
        toast.error("Disease and medications are required")
        return
      }

      setIsSavingPresc(true)
      try {
        const response = await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: prescriptionAppointment.patientId,
            doctorId: doctorId,
            doctorName: doctorName ? `Dr. ${doctorName}` : "Doctor",
            patientName: prescriptionAppointment.patientName,
            disease: prescDisease,
            medications: prescMedications,
            dosage: prescDosage,
            instructions: prescInstructions,
            notes: prescNotes
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast.success("Prescription saved and sent successfully.")
          setPrescDisease("")
          setPrescMedications("")
          setPrescDosage("")
          setPrescInstructions("")
          setPrescNotes("")
          setPrescriptionPatient(null)
          setPrescriptionAppointment(null)
          fetchDoctorPrescriptions(doctorId)
        } else {
          toast.error("Failed to save prescription: " + data.error)
        }
      } catch (error) {
        console.error("Error saving prescription:", error)
        toast.error("Failed to save prescription")
      } finally {
        setIsSavingPresc(false)
      }
      return
    }

    // Original Lab Report Analysis save
    if (!selectedReport?.id) {
      toast.error("No report selected")
      return
    }

    try {
      const response = await fetch("/api/lab-reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          analysis: analysis,
          sendToPatient: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setLabReports(
          labReports.map((r) =>
            r.id === selectedReport.id ? { ...r, status: "analyzed", findings: analysis } : r
          )
        )
        setSelectedReport(null)
        setAnalysis("")
        toast.success("Analysis saved and sent to patient!")
      } else {
        toast.error("Failed to save analysis: " + data.error)
      }
    } catch (error) {
      console.error("Error saving analysis:", error)
      toast.error("Failed to save analysis")
    }
  }

  // Fetch patient reports when viewing patient records
  const handleViewPatientRecords = async (patient) => {
    setSelectedPatientForRecords(patient)
    setLoadingPatientReports(true)
    try {
      // Fetch lab reports for this patient
      const res = await fetch(`/api/lab-reports?patientId=${patient.id}`)
      const data = await res.json()
      if (data.success) {
        setPatientReports(data.data || [])
      } else {
        setPatientReports([])
      }
    } catch (err) {
      console.error("Error fetching patient reports:", err)
      setPatientReports([])
    } finally {
      setLoadingPatientReports(false)
    }
  }

  // Handle AI analysis for a report (from patient records)
  const handlePatientRecordAnalyze = async (reportId) => {
    setAnalyzingReportId(reportId)
    try {
      const res = await fetch(`/api/lab-reports/${reportId}/analyze`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Report analyzed successfully!")
        // Refresh patient reports
        if (selectedPatientForRecords) {
          handleViewPatientRecords(selectedPatientForRecords)
        }
      } else {
        toast.error(data.error || "Failed to analyze report")
      }
    } catch (err) {
      console.error("Error analyzing report:", err)
      toast.error("Failed to analyze report")
    } finally {
      setAnalyzingReportId(null)
    }
  }

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle appointment status update
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(`Appointment ${newStatus} successfully`)
        // Update local state
        setAppointments(prev =>
          prev.map(apt =>
            apt.appointmentId === appointmentId
              ? { ...apt, status: newStatus }
              : apt
          )
        )
        setShowAppointmentModal(false)
      } else {
        toast.error(data.error || "Failed to update appointment")
      }
    } catch (err) {
      console.error("Error updating appointment:", err)
      toast.error("Failed to update appointment")
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FAFCFF]">
      <DoctorSidebar pendingCount={pendingCount} />

      <div className="dashboard-content flex-1 flex flex-col min-h-screen ml-0 md:ml-72">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black">Doctor Dashboard</h1>
              <p className="text-xs sm:text-sm text-black">ID: {doctorId}</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                className="relative p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors"
                onClick={() => router.push("?tab=appointments")}
              >
                <Calendar className="w-5 h-5 text-black" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-[#EFF6FF] rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5 text-black" />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#3B82F6] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-black">{patients.length}</div>
                      <p className="text-xs sm:text-sm text-black mt-1">Total Patients</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#F59E0B] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-black">
                        {labReports.filter((r) => r.status === "pending-analysis").length}
                      </div>
                      <p className="text-xs sm:text-sm text-black mt-1">Pending Analysis</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#10B981] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-black">
                        {labReports.filter((r) => r.status === "analyzed").length}
                      </div>
                      <p className="text-xs sm:text-sm text-black mt-1">Analyzed Reports</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("?tab=appointments")}>
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center relative">
                      <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-[#EF4444] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-black">
                        {pendingCount}
                      </div>
                      <p className="text-xs sm:text-sm text-black mt-1">Pending Appts.</p>
                      {pendingCount > 0 && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6">
                    <div className="text-center">
                      <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-[#059669] mx-auto mb-2 opacity-60" />
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-600">Rs. {totalEarnings.toLocaleString()}</div>
                      <p className="text-xs sm:text-sm text-black mt-1">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E2E8F0] shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-black text-lg sm:text-xl">Recent Patients</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {patients.slice(0, 3).map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between py-3 sm:py-4 border-b border-[#E2E8F0] last:border-0"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black text-sm sm:text-base truncate">{patient.name}</p>
                          <p className="text-xs sm:text-sm text-black truncate">{patient.condition}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0 ml-2" />
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-black truncate">{patient.name}</h3>
                          <p className="text-xs sm:text-sm text-black truncate">{patient.condition}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start sm:self-auto ${patient.status === "active"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#F3F4F6] text-black"
                          }`}
                      >
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 text-xs sm:text-sm">
                      <div>
                        <p className="text-black">Age</p>
                        <p className="font-semibold text-black">{patient.age === "N/A" ? "N/A" : `${patient.age} years`}</p>
                      </div>
                      <div>
                        <p className="text-black">Last Visit</p>
                        <p className="font-semibold text-black">{patient.lastVisit}</p>
                      </div>
                      <div>
                        <p className="text-black">Reports</p>
                        <p className="font-semibold text-black">{patient.reports} files</p>
                      </div>
                    </div>

                     <div className="flex flex-col sm:flex-row gap-3">
                       <Button
                         onClick={() => handleViewPatientRecords(patient)}
                         className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2 h-10 sm:h-11 text-sm"
                       >
                         <Eye className="w-4 h-4" />
                         View Records
                       </Button>
                       <Button
                         onClick={() => {
                           setPrescriptionPatient(patient.name)
                           setPrescriptionAppointment({ patientId: patient.id, patientName: patient.name })
                         }}
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
                          <h3 className="text-base sm:text-lg font-bold text-black">{report.reportType}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-black">Patient: {report.patientName}</p>
                        <p className="text-xs sm:text-sm text-black">Uploaded: {report.uploadDate}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start sm:self-auto ${report.status === "analyzed"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                      >
                        {report.status === "analyzed" ? "Analyzed" : "Pending"}
                      </span>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-lg p-3 sm:p-4 mb-5 text-xs sm:text-sm">
                      <p className="text-black">
                        <span className="font-semibold text-black">Findings:</span> {report.findings}
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
              {/* Show local prescriptions */}
              {localPrescriptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-black mb-4">Recently Issued Prescriptions</h3>
                  <div className="space-y-4">
                    {localPrescriptions.map((pres, idx) => (
                      <Card key={idx} className="border-[#E2E8F0] shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-black">{pres.patientName}</p>
                              <p className="text-sm text-black">{pres.disease}</p>
                              <p className="text-xs text-black mt-1">{pres.medications}</p>
                            </div>
                            <span className="text-xs text-black">
                              {pres.createdAt ? new Date(pres.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {!prescriptionPatient ? (
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-black text-lg sm:text-xl">Select Patient</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-3">
                      {patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setPrescriptionPatient(patient.name)
                            setPrescriptionAppointment({ patientId: patient.id, patientName: patient.name })
                          }}
                          className="w-full flex items-center justify-between p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#EFF6FF] transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-black text-sm sm:text-base truncate">{patient.name}</p>
                            <p className="text-xs sm:text-sm text-black truncate">{patient.condition}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-black shrink-0 ml-3" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-[#E2E8F0] shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-black text-lg sm:text-xl">
                      Prescription for {prescriptionPatient}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => { setPrescriptionPatient(null); setPrescriptionAppointment(null); }}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-black mb-1.5 block">Disease / Diagnosis</label>
                        <Input value={prescDisease} onChange={(e) => setPrescDisease(e.target.value)} placeholder="e.g. Viral Fever" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-black mb-1.5 block">Medications</label>
                        <Input value={prescMedications} onChange={(e) => setPrescMedications(e.target.value)} placeholder="e.g. Paracetamol 500mg" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Dosage</label>
                          <Input value={prescDosage} onChange={(e) => setPrescDosage(e.target.value)} placeholder="e.g. 1-0-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black mb-1.5 block">Instructions</label>
                          <Input value={prescInstructions} onChange={(e) => setPrescInstructions(e.target.value)} placeholder="e.g. After meals" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-black mb-1.5 block">Notes (Optional)</label>
                        <textarea
                          value={prescNotes}
                          onChange={(e) => setPrescNotes(e.target.value)}
                          className="w-full rounded-md border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Additional instructions for the patient"
                        />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button
                          onClick={handleSaveAnalysis}
                          disabled={isSavingPresc}
                          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2"
                        >
                          {isSavingPresc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Save & Send to Patient
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-black">Appointments</h2>
                  <p className="text-black">Manage patient appointments and view their medical reports</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {appointments.length} Total
                  </span>
                </div>
              </div>

              {loadingAppointments ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : appointments.length === 0 ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Calendar className="h-16 w-16 text-black mb-4" />
                    <h3 className="text-xl font-bold text-black mb-2">No Appointments Yet</h3>
                    <p className="text-black text-center">Patients will book appointments after you are recommended by the AI system.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment, idx) => {
                    const aptId = appointment.appointmentId || idx
                    const isExpanded = expandedAppointmentId === aptId
                    const patientPrescriptions = localPrescriptions.filter(
                      p => p.patientName === appointment.patientName
                    )

                    return (
                      <Card
                        key={aptId}
                        className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* ── Header row ── */}
                        <CardContent className="p-0">
                          <div
                            className="flex items-start justify-between p-6 cursor-pointer select-none"
                            onClick={() => setExpandedAppointmentId(isExpanded ? null : aptId)}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                                {appointment.patientName?.charAt(0) || "P"}
                              </div>
                              <div>
                                <h3 className="font-bold text-black text-lg">{appointment.patientName}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    appointment.status === "confirmed" ? "bg-green-100 text-green-700" :
                                    appointment.status === "completed" ? "bg-blue-100 text-blue-700" :
                                    "bg-red-100 text-red-700"
                                  }`}>
                                    {appointment.status?.toUpperCase() || "PENDING"}
                                  </span>
                                  {appointment.disease && (
                                    <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                                      <Activity className="h-3 w-3" />
                                      {appointment.disease}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
                                    Fee: Rs. {appointment.fee || 1000} (80%: Rs. {(parseFloat(appointment.fee || 1000) * 0.8).toFixed(0)})
                                  </span>
                                  {patientPrescriptions.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                                      <ClipboardList className="h-3 w-3" />
                                      {patientPrescriptions.length} Rx
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <p className="text-sm text-black">
                                {appointment.scheduledDate
                                  ? new Date(appointment.scheduledDate).toLocaleDateString()
                                  : appointment.createdAt
                                  ? new Date(appointment.createdAt).toLocaleDateString()
                                  : ""}
                              </p>
                              {isExpanded
                                ? <ChevronUp className="h-5 w-5 text-slate-400" />
                                : <ChevronDown className="h-5 w-5 text-slate-400" />}
                            </div>
                          </div>

                          {/* patient notes strip */}
                          {appointment.notes && (
                            <div className="px-6 pb-3">
                              <p className="text-sm text-slate-500 italic">{appointment.notes}</p>
                            </div>
                          )}

                          {/* ── Expanded panel ── */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 space-y-5">

                              {/* Previous Prescriptions */}
                              <div>
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <ClipboardList className="h-4 w-4 text-purple-600" />
                                  Prescription History
                                </h4>

                                {patientPrescriptions.length === 0 ? (
                                  <p className="text-sm text-slate-400 italic">No prescriptions written yet for this patient.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {patientPrescriptions.map((pres, pIdx) => (
                                      <div key={pIdx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="font-semibold text-black text-sm">{pres.diagnosis || "General Consultation"}</p>
                                            {pres.medicines?.length > 0 && (
                                              <p className="text-xs text-slate-500 mt-1">
                                                💊 {pres.medicines.map(m => m.name).filter(Boolean).join(", ")}
                                              </p>
                                            )}
                                            {pres.advice && (
                                              <p className="text-xs text-slate-400 mt-1 italic">{pres.advice}</p>
                                            )}
                                          </div>
                                          <span className="shrink-0 text-xs text-white bg-purple-500 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                                            {pres.date || pres.createdAt}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPrescriptionPatient(appointment.patientName)
                                    setPrescriptionAppointment(appointment)
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                  Write New Prescription
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-300 text-slate-700 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedAppointment(appointment)
                                    setShowAppointmentModal(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  Full Medical Record
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Availability Management Tab */}
          {activeTab === "availability" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <DoctorAvailabilityManager doctorId={doctorId} />
            </motion.div>
          )}

        </main>
      </div>

      <PrescriptionModal
        isOpen={!!prescriptionPatient}
        onClose={() => { setPrescriptionPatient(null); setPrescriptionAppointment(null); setSelectedPatientData(null) }}
        patientName={prescriptionPatient || ""}
        patientId={prescriptionAppointment?.patientId}
        patientData={selectedPatientData}
        doctorId={doctorId}
        doctorName={doctorName ? `Dr. ${doctorName}` : undefined}
        appointmentId={prescriptionAppointment?.appointmentId}
        onSuccess={(prescriptionData) => {
          console.log("[DoctorDashboard] Prescription saved successfully:", prescriptionData)
          // Store prescription locally for this session
          if (prescriptionData) {
            setLocalPrescriptions(prev => [prescriptionData, ...prev])
          }
          if (prescriptionAppointment) {
            setAppointments((prev) =>
              prev.map((a) =>
                a.appointmentId === prescriptionAppointment.appointmentId
                  ? { ...a, status: "completed" }
                  : a
              )
            )
          }

          // Clear all state properly
          setPrescriptionPatient(null)
          setPrescriptionAppointment(null)

          toast.success("Prescription saved and sent to patient successfully!")
        }}
      />

      {/* Patient Records Modal */}
      <Dialog open={!!selectedPatientForRecords} onOpenChange={(open) => !open && setSelectedPatientForRecords(null)}>
        <DialogContent className="w-screen max-w-[100vw] max-h-[92vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Patient Medical Records
            </DialogTitle>
          </DialogHeader>

          {selectedPatientForRecords && (
            <div className="space-y-6 p-4">
              {/* Patient Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                    {selectedPatientForRecords.name?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black">{selectedPatientForRecords.name}</h3>
                    <p className="text-black">Condition: {selectedPatientForRecords.condition}</p>
                    <p className="text-black text-sm">Last Visit: {selectedPatientForRecords.lastVisit}</p>
                  </div>
                </div>
              </div>

              {/* Reports & AI Analysis */}
              {loadingPatientReports ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : patientReports.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-black flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Medical Reports & AI Analysis
                  </h4>
                  {patientReports.map((report, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="font-bold text-black">{report.name}</h5>
                          <p className="text-sm text-black">Type: {report.type} | Uploaded: {report.uploadDate}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === "analyzed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {report.status === "analyzed" ? "Analyzed" : "Pending Analysis"}
                          </span>
                          {report.status !== "analyzed" && (
                            <Button
                              onClick={() => handlePatientRecordAnalyze(report.reportId)}
                              disabled={analyzingReportId === report.reportId}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                              {analyzingReportId === report.reportId ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Analyze with AI
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis Results */}
                      {report.analysis && (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-100">
                          <h6 className="font-bold text-black flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            AI Analysis Results
                          </h6>
                          {report.analysis.disease && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-black">Detected Disease:</p>
                              <p className="text-lg font-bold text-blue-700">{report.analysis.disease}</p>
                            </div>
                          )}
                          {report.analysis.severity && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-black">Severity:</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${report.analysis.severity === "high" ? "bg-red-100 text-red-700" :
                                  report.analysis.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                                }`}>
                                {report.analysis.severity.toUpperCase()}
                              </span>
                            </div>
                          )}
                          {report.analysis.details && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-black">Analysis Details:</p>
                              <p className="text-black text-sm">{report.analysis.details}</p>
                            </div>
                          )}
                          {report.analysis.suggestedSpecializations && report.analysis.suggestedSpecializations.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-black mb-2">Recommended Specializations:</p>
                              <div className="flex flex-wrap gap-2">
                                {report.analysis.suggestedSpecializations.map((spec, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View PDF Button */}
                      {report.fileUrl && (
                        <div className="mt-4 flex gap-3">
                          <Button
                            onClick={() => setViewingPdfUrl(report.fileUrl)}
                            variant="outline"
                            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View PDF Report
                          </Button>
                          <Button
                            onClick={() => {
                              setPrescriptionPatient(selectedPatientForRecords.name)
                              setPrescriptionAppointment({ patientId: selectedPatientForRecords.id, patientName: selectedPatientForRecords.name })
                              setSelectedPatientForRecords(null)
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Write Prescription
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-black">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No medical reports found for this patient.</p>
                </div>
              )}

              {/* Show prescriptions for this patient */}
              {localPrescriptions.filter(p => p.patientName === selectedPatientForRecords.name).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-black flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Issued Prescriptions
                  </h4>
                  {localPrescriptions
                    .filter(p => p.patientName === selectedPatientForRecords.name)
                    .map((pres, idx) => (
                      <div key={idx} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-black">{pres.diagnosis}</p>
                            <p className="text-sm text-black mt-1">
                              {pres.medicines?.map(m => m.name).join(", ")}
                            </p>
                          </div>
                          <span className="text-xs text-black">{pres.createdAt}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  onClick={() => {
                    setPrescriptionPatient(selectedPatientForRecords.name)
                    setPrescriptionAppointment({ patientId: selectedPatientForRecords.id, patientName: selectedPatientForRecords.name })
                    setSelectedPatientForRecords(null)
                  }}
                  className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white h-11"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write Prescription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPatientForRecords(null)}
                  className="flex-1 h-11"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Details Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Appointment & Patient Medical Record
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6 p-4">
              {/* Patient Information Card */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                    {selectedAppointment.patientName?.charAt(0) || "P"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-1">
                      {selectedAppointment.patientName}
                    </h3>
                    {selectedAppointment.patientEmail && (
                      <p className="text-black flex items-center gap-2">
                        <Mail className="h-4 w-4 text-black" />
                        {selectedAppointment.patientEmail}
                      </p>
                    )}
                    {selectedAppointment.patientPhone && (
                      <p className="text-black flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-black" />
                        {selectedAppointment.patientPhone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${selectedAppointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        selectedAppointment.status === "confirmed" ? "bg-green-100 text-green-700" :
                          selectedAppointment.status === "completed" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                      }`}>
                      {selectedAppointment.status?.toUpperCase() || "PENDING"}
                    </span>
                    <p className="text-xs text-black mt-2">
                      {selectedAppointment.createdAt
                        ? new Date(selectedAppointment.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="border-l-4 border-blue-600 bg-blue-50 rounded-lg p-5">
                <h4 className="font-bold text-black text-lg mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Medical Information
                </h4>
                <div className="space-y-4">
                  {/* Disease */}
                  {selectedAppointment.disease && (
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">Detected Disease</p>
                      <p className="text-xl font-bold text-blue-700">{selectedAppointment.disease}</p>
                    </div>
                  )}

                  {/* Report Name & File */}
                  {selectedAppointment.reportName && (
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-xs font-bold text-black uppercase tracking-wider">Report</p>
                            <p className="font-semibold text-black">{selectedAppointment.reportName}</p>
                          </div>
                        </div>
                        {selectedAppointment.reportFileUrl && (
                          <a
                            href={selectedAppointment.reportFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Report
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* OCR Extracted Text */}
                  {selectedAppointment.ocrText && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h5 className="font-bold text-black mb-2 text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-black" />
                        OCR Extracted Text
                      </h5>
                      <div className="max-h-40 overflow-y-auto">
                        <p className="text-xs text-black leading-relaxed whitespace-pre-wrap font-mono">
                          {selectedAppointment.ocrText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Report */}
                  {selectedAppointment.reportAnalysis && (
                    <div className="bg-white rounded-lg p-4 border border-emerald-100">
                      <h5 className="font-bold text-black mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        AI Analysis Details
                      </h5>
                      <div className="space-y-3">
                        {selectedAppointment.reportAnalysis.details && (
                          <div>
                            <p className="text-sm font-semibold text-black mb-1">Analysis Summary</p>
                            <p className="text-black text-sm leading-relaxed">
                              {selectedAppointment.reportAnalysis.details}
                            </p>
                          </div>
                        )}

                        {selectedAppointment.reportAnalysis.severity && (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-black">Severity:</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedAppointment.reportAnalysis.severity === "high" ? "bg-red-100 text-red-700" :
                                selectedAppointment.reportAnalysis.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-green-100 text-green-700"
                              }`}>
                              {selectedAppointment.reportAnalysis.severity.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {selectedAppointment.reportAnalysis.suggestedSpecializations?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-black mb-2">Recommended Specializations</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedAppointment.reportAnalysis.suggestedSpecializations.map((spec, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedAppointment.reportAnalysis.ranges?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-black mb-2">Blood Test Ranges</p>
                            <div className="space-y-2">
                              {selectedAppointment.reportAnalysis.ranges.map((range, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                  <span className="text-sm text-black">{range.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{range.value}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${range.status === "high" ? "bg-red-100 text-red-700" :
                                        range.status === "low" ? "bg-yellow-100 text-yellow-700" :
                                          "bg-green-100 text-green-700"
                                      }`}>
                                      {range.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Show previous prescriptions for this patient */}
              {localPrescriptions.filter(p => p.patientName === selectedAppointment.patientName).length > 0 && (
                <div className="space-y-4 bg-emerald-50/30 p-5 rounded-lg border border-emerald-100">
                  <h4 className="text-lg font-bold text-black flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Previous Prescriptions
                  </h4>
                  {localPrescriptions
                    .filter(p => p.patientName === selectedAppointment.patientName)
                    .map((pres, idx) => (
                      <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-black">{pres.diagnosis || "Consultation"}</p>
                            <p className="text-sm text-slate-600 mt-1">
                              {pres.medicines?.map(m => m.name).join(", ")}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">{pres.createdAt}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Appointment Notes */}
              {selectedAppointment.notes && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-black" />
                    Appointment Notes
                  </h4>
                  <p className="text-black text-sm leading-relaxed">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Consultation Fee Breakdown */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex justify-between items-center text-sm">
                <div>
                  <p className="text-slate-600 font-medium">Total Consultation Fee Paid</p>
                  <p className="text-xl font-black text-black">Rs. {selectedAppointment.fee || 1000}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-700 font-medium">Your Earnings (80%)</p>
                  <p className="text-xl font-black text-emerald-600">Rs. {(parseFloat(selectedAppointment.fee || 1000) * 0.8).toFixed(0)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                {selectedAppointment.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.appointmentId, "confirmed")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all"
                    >
                      <Check className="h-5 w-5" />
                      Accept Appointment
                    </Button>
                    <Button
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.appointmentId, "cancelled")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all"
                    >
                      <X className="h-5 w-5" />
                      Reject Appointment
                    </Button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <Button
                    onClick={() => {
                      setPrescriptionPatient(selectedAppointment.patientName)
                      setPrescriptionAppointment(selectedAppointment)
                      setShowAppointmentModal(false)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="h-5 w-5" />
                    Write Prescription
                  </Button>
                )}
                {selectedAppointment.status === "completed" && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-lg text-emerald-700 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    Appointment Completed - Prescription Sent
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`mailto:${selectedAppointment.patientEmail}`}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-black rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Patient
                </a>
                {selectedAppointment.patientPhone && (
                  <a
                    href={`tel:${selectedAppointment.patientPhone}`}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-black rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Patient
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPdfUrl} onOpenChange={(open) => !open && setViewingPdfUrl(null)}>
        <DialogContent className="w-screen max-w-[100vw] max-h-[95vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Medical Report PDF
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            {viewingPdfUrl && <PDFViewer url={viewingPdfUrl} />}
          </div>
          <div className="flex gap-3 pt-4">
            <a
              href={viewingPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
            <Button
              variant="outline"
              onClick={() => setViewingPdfUrl(null)}
              className="flex-1 h-10"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Editor Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Analyze Report - {selectedReport?.reportType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-black mb-2">Patient: {selectedReport?.patientName}</p>
              <p className="text-sm text-black">Uploaded: {selectedReport?.uploadDate}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Analysis Findings
              </label>
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                placeholder="Enter your analysis and findings..."
                className="w-full h-40 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReport(null)
                setAnalysis("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAnalysis}
              className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Save & Send to Patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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