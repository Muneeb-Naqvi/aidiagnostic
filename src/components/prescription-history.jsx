"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Calendar, User, Pill, ChevronDown, ChevronUp, 
  Download, Printer, Search, Filter, Clock, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { downloadPrescriptionPDF } from "@/utils/pdf-generator"

export function PrescriptionHistory({ 
  patientId, 
  patientName,
  prescriptions = [],
  showFullHistory = true 
}) {
  const [localPrescriptions, setLocalPrescriptions] = useState(prescriptions)
  const [loading, setLoading] = useState(!prescriptions.length)
  const [expandedPrescription, setExpandedPrescription] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterDoctor, setFilterDoctor] = useState("all")

  // Fetch prescriptions if not provided
  useEffect(() => {
    if (prescriptions.length === 0 && patientId) {
      fetchPrescriptions()
    }
  }, [patientId])

  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prescriptions?patientId=${patientId}`)
      const data = await res.json()
      if (data.success) {
        setLocalPrescriptions(data.data)
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      toast.error("Failed to load prescription history")
    } finally {
      setLoading(false)
    }
  }

  // Filter prescriptions
  const filteredPrescriptions = localPrescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medicines?.some(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSeverity = filterSeverity === "all" || prescription.severity === filterSeverity
    const matchesDoctor = filterDoctor === "all" || prescription.doctorName === filterDoctor
    
    return matchesSearch && matchesSeverity && matchesDoctor
  })

  // Get unique doctors for filter
  const uniqueDoctors = [...new Set(localPrescriptions.map(p => p.doctorName).filter(Boolean))]

  // Severity colors
  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case "mild":
        return { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" }
      case "moderate":
        return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" }
      case "severe":
        return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" }
      default:
        return { bg: "bg-gray-100", text: "text-black", border: "border-gray-300" }
    }
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  // Handle PDF download
  const handleDownloadPDF = (prescription) => {
    const pdfData = {
      doctor: {
        name: prescription.doctorName,
        specialization: prescription.doctorSpecialization,
        clinicName: prescription.clinicName,
        clinicAddress: prescription.clinicAddress,
        clinicPhone: prescription.clinicPhone,
        registrationNumber: prescription.registrationNumber,
        digitalSignature: prescription.digitalSignature,
      },
      patient: {
        name: prescription.patientName || patientName,
        age: prescription.patientAge,
        gender: prescription.patientGender,
        weight: prescription.patientWeight,
        bloodGroup: prescription.patientBloodGroup,
      },
      prescription: {
        date: formatDate(prescription.issuedDate),
        diagnosis: prescription.diagnosis,
        severity: prescription.severity,
        medicines: prescription.medicines || [],
        labTests: prescription.labTests || [],
        advice: prescription.advice,
        notes: prescription.notes,
        followUpDate: formatDate(prescription.followUpDate),
        prescriptionId: prescription.prescriptionId,
      }
    }
    downloadPrescriptionPDF(pdfData, `prescription-${prescription.prescriptionId}.pdf`)
    toast.success("PDF downloaded successfully")
  }

  // Calculate statistics
  const stats = {
    total: localPrescriptions.length,
    bySeverity: {
      mild: localPrescriptions.filter(p => p.severity === "mild").length,
      moderate: localPrescriptions.filter(p => p.severity === "moderate").length,
      severe: localPrescriptions.filter(p => p.severity === "severe").length,
    },
    lastVisit: localPrescriptions.length > 0 
      ? formatDate(localPrescriptions[0]?.issuedDate) 
      : "No visits",
  }

  if (loading) {
    return (
      <Card className="border border-[#3875FD]/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3875FD]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showFullHistory && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="border border-[#3875FD]/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3875FD]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#3875FD]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#020331]">{stats.total}</p>
                  <p className="text-sm text-black">Total Prescriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-300">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">{stats.bySeverity.mild}</span>
                </div>
                <div>
                  <p className="text-sm text-black">Mild Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-yellow-300">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">{stats.bySeverity.moderate}</span>
                </div>
                <div>
                  <p className="text-sm text-black">Moderate Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-red-300">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold">{stats.bySeverity.severe}</span>
                </div>
                <div>
                  <p className="text-sm text-black">Severe Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {showFullHistory && localPrescriptions.length > 0 && (
        <Card className="border border-[#3875FD]/30">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                  placeholder="Search by diagnosis, doctor, or medicine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {uniqueDoctors.map(doctor => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prescription List */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="border border-[#3875FD]/30">
          <CardContent className="pt-10 pb-10 text-center">
            <FileText className="w-12 h-12 mx-auto text-black mb-4" />
            <h3 className="text-lg font-semibold text-[#020331]">No Prescriptions Found</h3>
            <p className="text-black">
              {searchTerm || filterSeverity !== "all" || filterDoctor !== "all"
                ? "Try adjusting your search or filters"
                : "Your prescription history will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription, index) => {
            const severityStyles = getSeverityStyles(prescription.severity)
            const isExpanded = expandedPrescription === prescription.prescriptionId
            
            return (
              <motion.div
                key={prescription.prescriptionId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border ${severityStyles.border} hover:shadow-md transition-shadow`}>
                  <CardHeader 
                    className="pb-2 cursor-pointer"
                    onClick={() => setExpandedPrescription(isExpanded ? null : prescription.prescriptionId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#3875FD]/10 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-[#3875FD]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base text-[#020331]">
                              {prescription.diagnosis || "No Diagnosis"}
                            </CardTitle>
                            {prescription.severity && (
                              <Badge className={`${severityStyles.bg} ${severityStyles.text}`}>
                                {prescription.severity.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-black">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {prescription.doctorName || "Doctor"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(prescription.issuedDate)}
                            </span>
                            {prescription.followUpDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Follow-up: {formatDate(prescription.followUpDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(prescription)
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-black" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-black" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Medicines */}
                            <div>
                              <h4 className="font-semibold text-[#020331] mb-3">Prescribed Medicines</h4>
                              <div className="space-y-2">
                                {prescription.medicines?.map((med, i) => (
                                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium text-[#020331]">{med.name}</p>
                                    <p className="text-sm text-black">
                                      {med.dosage} • {med.frequency} • {med.duration}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                              {prescription.labTests?.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-[#020331] mb-2">Lab Tests</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {prescription.labTests.map((test, i) => (
                                      <Badge key={i} variant="outline">{test}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {prescription.advice && (
                                <div>
                                  <h4 className="font-semibold text-[#020331] mb-2">Advice</h4>
                                  <p className="text-sm text-black">{prescription.advice}</p>
                                </div>
                              )}

                              {prescription.notes && (
                                <div>
                                  <h4 className="font-semibold text-[#020331] mb-2">Notes</h4>
                                  <p className="text-sm text-black">{prescription.notes}</p>
                                </div>
                              )}

                              <div className="text-xs text-black">
                                Rx ID: {prescription.prescriptionId}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PrescriptionHistory
