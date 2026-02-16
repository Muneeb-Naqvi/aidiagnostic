"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Stethoscope,
  Eye,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  HeartPulse,
  User,
  Upload,
  File,
  AlertCircle,
  Edit2,
  X,
  Calendar,
  Activity,
  ChevronRight,
  Send,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const COLORS = {
  primary: "#3875FD",
  deepNavy: "#020331",
  almostBlack: "#000004",
  softGrayBlue: "#80A0B5",
  lightBg: "#FFFDFD",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  muted: "#6B7280",
}

function PatientSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"
  const [patientIdDisplay, setPatientIdDisplay] = useState("")

  useEffect(() => {
    setPatientIdDisplay(localStorage.getItem("patientId") || "")
  }, [])

  const menuItems = [
    { id: "overview", label: "Overview", icon: HeartPulse },
    { id: "reports", label: "My Reports", icon: FileText },
    { id: "doctors", label: "Suggested Doctors", icon: Stethoscope },
    { id: "prescriptions", label: "Prescriptions", icon: Activity },
  ]

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 w-72 transform bg-gradient-to-b from-[#020331] to-[#0a0f4a] border-r shadow-xl"
      style={{ borderColor: "rgba(56,117,253,0.18)" }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <HeartPulse className="h-8 w-8 text-[#3875FD]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">MedPulse</h1>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`?tab=${item.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${activeTab === item.id
                ? "bg-gradient-to-r from-[#3875FD]/20 to-[#3875FD]/10 text-white font-medium shadow-sm border border-white/10"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? "text-[#3875FD]" : "text-gray-400"}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-400 truncate">Patient ID</p>
              <p className="text-sm text-gray-200 font-mono truncate">
                {patientIdDisplay || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function ReportUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("")
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const resetForm = () => {
    setFile(null)
    setReportName("")
    setReportType("")
    setErrorMsg("")
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) return setErrorMsg("Please select a file")
    if (!reportName.trim()) return setErrorMsg("Report name is required")
    if (!reportType) return setErrorMsg("Please select report type")

    setUploading(true)
    setErrorMsg("")

    const formData = new FormData()
    formData.append("patientId", localStorage.getItem("patientId"))
    formData.append("name", reportName)
    formData.append("type", reportType)
    formData.append("file", file)

    try {
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Upload failed")
      }

      onSuccess(data.data)
      toast.success("Report uploaded successfully")
      onClose()
      resetForm()
    } catch (err) {
      console.error("UPLOAD ERROR:", err)
      setErrorMsg(err.message)
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 overflow-hidden border-none rounded-2xl">
        <div className="h-2 bg-gradient-to-r from-[#3B75FD] to-indigo-600" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-[#020331]">
              <Upload className="h-6 w-6 text-[#3B75FD]" />
              Upload Medical Report
            </DialogTitle>
            <DialogDescription className="text-[#80A0B5] mt-2">
              Add your lab results, imaging, or prescriptions to your health profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Report Title */}
            <div className="space-y-2">
              <Label className="text-[#80A0B5] font-medium">Report Title</Label>
              <Input
                placeholder="e.g. Annual Blood Check - 2026"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full rounded-xl border border-[#80A0B5]/50 bg-white text-[#000004] placeholder:text-[#80A0B5]/70 focus:border-[#3B75FD] focus:ring-[#3B75FD]/30 py-5 px-4 transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-[#80A0B5] font-medium">Category</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full rounded-xl border border-[#80A0B5]/50 bg-white text-[#000004] focus:ring-[#3B75FD]/30 py-5 px-4 data-[placeholder]:text-[#80A0B5]/70">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#80A0B5]/30 bg-white shadow-xl">
                  <SelectItem value="blood-test">Blood Test</SelectItem>
                  <SelectItem value="urine-test">Urine Test</SelectItem>
                  <SelectItem value="x-ray">X-Ray</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="mri-ct">MRI / CT Scan</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Attachment */}
            <div className="space-y-2">
              <Label className="text-[#80A0B5] font-medium">File Attachment</Label>
              <div className="border-2 border-dashed border-[#80A0B5]/50 rounded-2xl p-8 text-center hover:border-[#3B75FD]/60 hover:bg-[#3B75FD]/[0.03] transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3B75FD]/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-[#3B75FD]" />
                  </div>
                  <div className="text-sm">
                    {file ? (
                      <span className="font-semibold text-[#3B75FD]">{file.name}</span>
                    ) : (
                      <span className="text-[#80A0B5]">
                        <strong className="text-[#3B75FD]">Click to upload</strong> or drag and drop
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#80A0B5]">PDF, JPG, PNG (Max 10MB)</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}

            <DialogFooter className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={uploading}
                className="rounded-xl border border-[#80A0B5] text-[#000004] hover:bg-[#80A0B5]/10 hover:text-[#000004] px-6 py-5 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !file || !reportName.trim() || !reportType}
                className="rounded-xl px-8 py-5 bg-gradient-to-r from-[#3B75FD] to-indigo-600 hover:from-[#3B75FD]/90 hover:to-indigo-600/90 text-white shadow-lg shadow-[#3B75FD]/25 transition-all transform hover:-translate-y-0.5 active:scale-95 border-0"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Upload Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReportDetailModal({ report, open, onClose, onDelete, onRename, onAnalyze, analyzing }) {
  const [newName, setNewName] = useState(report?.name || "")
  const [renaming, setRenaming] = useState(false)

  useEffect(() => {
    if (report) setNewName(report.name)
  }, [report])

  if (!report) return null

  const handleRename = async () => {
    if (newName.trim() === report.name || !newName.trim()) {
      setRenaming(false)
      return
    }
    try {
      const res = await fetch(`/api/lab-reports/${report.reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        onRename(report.reportId, newName.trim())
        toast.success("Renamed successfully")
        setRenaming(false)
      } else {
        throw new Error(data.error || "Update failed")
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const isNormal =
    (report.analysis?.disease?.toLowerCase().includes("normal") || report.analysis?.disease?.toLowerCase().includes("healthy")) &&
    report.analysis?.severity === "normal" &&
    !(report.analysis?.ranges?.some(r => r.status?.toLowerCase() === "high" || r.status?.toLowerCase() === "low"));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideClose={true}
        className="max-w-none w-screen h-screen translate-x-0 translate-y-0 top-0 left-0 p-0 overflow-hidden border-none rounded-none flex flex-col shadow-none bg-white font-sans"
      >
        <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-20">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isNormal ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {isNormal ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>

            {renaming ? (
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-11 rounded-lg border-slate-200 focus:ring-blue-500 text-lg font-bold"
                  autoFocus
                />
                <Button onClick={handleRename} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</Button>
                <Button variant="ghost" onClick={() => setRenaming(false)} className="h-11 px-4 rounded-lg font-bold">Cancel</Button>
              </div>
            ) : (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setRenaming(true)}>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">{report.name}</h2>
                  <Edit2 className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold border-none px-2 py-0 rounded-md text-[10px] uppercase tracking-wider">
                    {report.type}
                  </Badge>
                  <span className="text-xs font-bold text-slate-300">/</span>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Uploaded {report.uploadDate}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {report.status === "analyzed" ? (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-50 py-1.5 px-4 rounded-lg font-black text-[10px] tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> AI VERIFIED
              </Badge>
            ) : (
              <Badge className="bg-blue-50 text-blue-600 border-blue-100/50 hover:bg-blue-50 py-1.5 px-4 rounded-lg font-black text-[10px] tracking-widest flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> PROCESSING
              </Badge>
            )}
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 border-none transition-all active:scale-95 shadow-sm"
              >
                <X className="h-6 w-6" />
              </Button>
            </DialogClose>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-[0.6] bg-slate-50 flex flex-col relative border-r border-slate-100">
            <div className="flex-1 p-10 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative">
                {report.fileUrl ? (
                  report.fileUrl.toLowerCase().endsWith(".pdf") ? (
                    <iframe src={report.fileUrl} className="w-full h-full border-none" title="PDF Preview" />
                  ) : (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-slate-50">
                      <img src={report.fileUrl} className="max-w-full max-h-full object-contain" alt="Report Content" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                    <FileText className="h-16 w-16 opacity-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No visual data</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-10 pb-8 flex items-center gap-4 shrink-0">
              <a href={report.fileUrl} download className="flex-1">
                <Button className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                  <Download className="h-4 w-4 opacity-40" /> Save Document
                </Button>
              </a>
              <Button
                variant="ghost"
                onClick={() => { if (confirm("Erase this record?")) { onDelete(report.reportId); onClose(); } }}
                className="h-12 w-12 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <aside className="flex-[0.4] bg-white flex flex-col overflow-hidden min-w-[420px]">
            <div className="flex-1 overflow-auto custom-scrollbar p-10 space-y-12">
              {report.status !== "analyzed" ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black text-slate-900 leading-tight">Extract Insights</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed px-10">
                      Let our medical AI process this report to find hidden health markers.
                    </p>
                  </div>
                  <Button
                    disabled={analyzing}
                    onClick={() => onAnalyze(report.reportId)}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/10"
                  >
                    {analyzing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Activity className="h-5 w-5 mr-2" />}
                    Analyze Biomarkers
                  </Button>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                  {/* Diagnosis */}
                  <section className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Assessment</h3>
                    <div className={`p-8 rounded-3xl border ${isNormal ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <h4 className={`text-3xl font-black mb-4 tracking-tight leading-none ${isNormal ? 'text-emerald-700' : 'text-slate-900'}`}>{report.analysis?.disease}</h4>
                      <p className="text-slate-500 font-bold leading-relaxed text-base italic">
                        "{report.analysis?.details}"
                      </p>
                    </div>
                  </section>

                  {/* Findings */}
                  {report.analysis?.ranges && report.analysis.ranges.length > 0 && (
                    <section className="space-y-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Findings</h3>
                      <div className="grid gap-3">
                        {report.analysis.ranges.map((range, idx) => (
                          <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-white transition-all group">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate mb-1">{range.parameter}</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900">{range.actualValue}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${range.status?.toLowerCase() === 'normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {range.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right border-l border-slate-100 pl-4 shrink-0">
                              <p className="text-[9px] font-bold text-slate-300 mb-0.5 uppercase tracking-tighter">Normal</p>
                              <p className="text-[11px] font-black text-slate-500">{range.normalRange}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-6 pb-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Medical Roadmap</h3>
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden group shadow-xl">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Stethoscope className="h-24 w-24 text-blue-400" />
                      </div>
                      <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Recommended Care</p>
                        <p className="text-2xl font-black tracking-tight">{report.analysis?.suggestedSpecializations?.join(" / ") || "General Practice"}</p>
                      </div>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm relative z-10">
                        <p className="text-sm font-bold text-slate-300 leading-relaxed">
                          {report.analysis?.recommendedDoctor}
                        </p>
                      </div>
                      <Button
                        onClick={() => { onClose(); window.history.pushState(null, '', '?tab=doctors'); }}
                        className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-sm relative z-10 shadow-lg flex items-center justify-center gap-2 group"
                      >
                        Schedule Match <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ContactDoctorModal({ isOpen, onClose, doctorName }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success(`Enquiry sent to Dr. ${doctorName}`)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-none p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Stethoscope className="h-5 w-5" /> Contact Specialist
          </h2>
          <p className="text-blue-100 text-sm mt-1">Send a query to Dr. {doctorName}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white rounded-2xl shadow-sm">
          {/* Report Title */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Report Title</Label>
            <Input
              placeholder="Enter report title"
              required
              className="w-full h-9 px-4 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 
                 focus:border-[#3B75FD] focus:ring-1 focus:ring-[#3B75FD]/30 focus:outline-none 
                 transition-all duration-150"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Your Name</Label>
            <Input
              placeholder="Enter your name"
              required
              className="w-full h-9 px-4 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 
                 focus:border-[#3B75FD] focus:ring-1 focus:ring-[#3B75FD]/30 focus:outline-none 
                 transition-all duration-150"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Phone / Email</Label>
            <Input
              placeholder="How can they reach you?"
              required
              className="w-full h-9 px-4 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 
                 focus:border-[#3B75FD] focus:ring-1 focus:ring-[#3B75FD]/30 focus:outline-none 
                 transition-all duration-150"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Select Type</Label>
            <select
              className="w-full h-9 px-4 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 
                 focus:border-[#3B75FD] focus:ring-1 focus:ring-[#3B75FD]/30 focus:outline-none 
                 appearance-none transition-all duration-150"
              required
            >
              {/* your existing options */}
              <option value="">Select category...</option>
              {/* ... */}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Message</Label>
            <textarea
              className="w-full min-h-[90px] px-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 
                 focus:border-[#3B75FD] focus:ring-1 focus:ring-[#3B75FD]/30 focus:outline-none 
                 resize-y transition-all duration-150"
              placeholder="Briefly describe your concern..."
              required
            />
          </div>

          <DialogFooter className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-5 text-sm font-medium rounded-lg border border-[#80A0B5] text-[#80A0B5] 
                 hover:bg-[#80A0B5]/10 hover:border-[#80A0B5]/80 transition-colors duration-150"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="h-9 px-6 text-sm font-medium rounded-lg bg-[#3B75FD] text-white 
                 hover:bg-[#2c5cd8] focus:ring-2 focus:ring-[#3B75FD]/30 focus:outline-none 
                 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 
                 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PatientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [patientName, setPatientName] = useState("Patient")
  const [patientId, setPatientId] = useState("")
  const [reports, setReports] = useState([])
  const [suggestedDoctors, setSuggestedDoctors] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactDoctorName, setContactDoctorName] = useState("")

  const loadReports = async (pidParam) => {
    try {
      const pid = pidParam || patientId || localStorage.getItem("patientId")
      if (!pid) return
      const res = await fetch(`/api/lab-reports?patientId=${pid}`)
      const data = await res.json()
      if (data.success) setReports(data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const pid = localStorage.getItem("patientId")
    const pname = localStorage.getItem("patientName") || "Patient"

    if (!pid || pid === "undefined") {
      router.push("/patients-login")
      return
    }

    setPatientId(pid)
    setPatientName(pname)

    const initData = async () => {
      setLoading(true)
      try {
        await loadReports(pid)
        const [docRes, presRes] = await Promise.all([
          fetch(`/api/patients/${pid}/suggested-doctors`),
          fetch(`/api/patients/${pid}/prescriptions`),
        ])
        const docJson = await docRes.json()
        const presJson = await presRes.json()
        if (docJson.success) setSuggestedDoctors(docJson.data || [])
        if (presJson.success) setPrescriptions(presJson.data || [])
      } catch (err) {
        toast.error("Network issue loading dashboard")
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  const handleAnalyze = async (specificReportId = null) => {
    try {
      setAnalyzing(true)
      let res;
      if (specificReportId) {
        res = await fetch(`/api/lab-reports/${specificReportId}/analyze`, { method: "POST" })
      } else {
        res = await fetch(`/api/patients/${patientId}/analyze-all`, { method: "POST" })
      }

      const data = await res.json()
      if (data.success) {
        toast.success(specificReportId ? "Report analyzed successfully" : "AI analysis complete")
        await loadReports()
        // If we analyzed a specific report, update the selected report state to show new data
        if (specificReportId) {
          const updatedReport = reports.find(r => r.reportId === specificReportId) || data.data;
          if (updatedReport) {
            // Need to merge data.data if it's the updated one
            setSelectedReport(data.data || updatedReport);
          }
        }

        // Also refresh suggested doctors
        const docRes = await fetch(`/api/patients/${patientId}/suggested-doctors`)
        const docJson = await docRes.json()
        if (docJson.success) setSuggestedDoctors(docJson.data || [])
      } else {
        toast.info(data.message || "No pending reports")
      }
    } catch (err) {
      toast.error("Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const addNewReport = (report) => {
    setReports(prev => [report, ...prev])
  }

  const deleteReportLocally = (id) => {
    setReports(prev => prev.filter(r => r.reportId !== id))
  }

  const handleDeleteReport = async (reportId) => {
    try {
      const res = await fetch(`/api/lab-reports/${reportId}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        deleteReportLocally(reportId);
        setShowDetailModal(false);
        toast.success("Report deleted successfully");
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete report");
    }
  }

  const renameReportLocally = (id, newName) => {
    setReports(prev => prev.map(r => r.reportId === id ? { ...r, name: newName } : r))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <PatientSidebar />
        <div className="ml-72 flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Syncing your health records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <PatientSidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="px-10 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Health Dashboard</h1>
              <p className="text-sm text-slate-400 font-medium">Welcome back, {patientName}</p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all border-0 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5 mr-2" /> Upload Report
              </Button>
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm">
                {patientName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Reports", value: reports.length, icon: FileText, color: "bg-blue-100 text-blue-600" },
                  { label: "Analyzed", value: reports.filter(r => r.status === "analyzed").length, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
                  { label: "Pending", value: reports.filter(r => r.status !== "analyzed").length, icon: Clock, color: "bg-amber-100 text-amber-600" },
                  { label: "Doctors", value: suggestedDoctors.length, icon: Stethoscope, color: "bg-violet-100 text-violet-600" },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden p-1">
                    <CardContent className="pt-8 pb-8 text-center bg-white rounded-[1.4rem]">
                      <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Banner */}
              {reports.some(r => r.status === "analyzed") && (
                <Card className="border-none shadow-lg rounded-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 opacity-95 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex gap-6 items-start md:items-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white mb-2">AI Health Insights Ready</h2>
                        <p className="text-blue-50 max-w-xl leading-relaxed">
                          our clinical reports have been processed by our AI engine. We've detected potential matches for
                          specialized consultation. View your <strong>Suggested Doctors</strong> for detailed paths.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push("?tab=doctors")}
                      className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl px-8 h-12 font-bold transition-all shadow-xl"
                    >
                      View Recommendations <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Recent Table-ish List */}
              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900">Recent Medical Activity</h3>
                  <Button variant="ghost" className="text-blue-600 font-bold" onClick={() => router.push("?tab=reports")}>View All</Button>
                </div>

                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <File className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">No medical documents found</p>
                    </div>
                  ) : (
                    reports.slice(0, 5).map(r => (
                      <div key={r.reportId} className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 duration-200">{r.name}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{r.type} • {r.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={r.status === "analyzed" ? "bg-emerald-50 text-emerald-600 border-none" : "bg-amber-50 text-amber-600 border-none"}>
                            {r.status === "analyzed" ? "Analyzed" : "Pending"}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedReport(r); setShowDetailModal(true); }} className="text-slate-300 hover:text-blue-600">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Medical Reports</h2>
                  <p className="text-slate-400 font-medium">Manage and analyze your laboratory findings.</p>
                </div>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {reports.map(report => (
                    <motion.div
                      key={report.reportId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full group"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                          <FileText className="h-7 w-7 text-blue-500" />
                        </div>
                        <Badge className={report.status === "analyzed" ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
                          {report.status === "analyzed" ? "Analyzed" : "Pending"}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                        {report.name}
                      </h4>
                      <p className="text-sm text-slate-400 font-medium mb-6">
                        {report.type} • {report.uploadDate}
                      </p>

                      {report.analysis && (
                        <div className="mb-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Detected Insight</p>
                          <p className="text-sm font-bold text-slate-800">{report.analysis.disease}</p>
                        </div>
                      )}

                      <div className="mt-auto flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => { setSelectedReport(report); setShowDetailModal(true); }}
                          className="flex-1 rounded-xl h-10 border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" /> Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this?")) {
                              deleteReportLocally(report.reportId);
                              fetch(`/api/lab-reports/${report.reportId}`, { method: "DELETE" });
                            }
                          }}
                          className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Suggested Doctors</h2>
                <p className="text-slate-400 font-medium">Specialists recommended based on your analyzed reports.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Report Name</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Disease Identified</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Uploaded</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Suggested Doctor</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.filter(r => r.status === "analyzed").length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">
                            No analyzed reports with doctor suggestions yet.
                          </td>
                        </tr>
                      ) : (
                        reports.filter(r => r.status === "analyzed").map((report) => (
                          <tr key={report.reportId} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-slate-900">{report.name}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                {report.analysis?.disease || "N/A"}
                              </span>
                            </td>
                            <td className="p-6 text-sm font-semibold text-slate-500">
                              {report.uploadDate}
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-slate-700">
                                  Dr. {report.analysis?.recommendedDoctor || "General Practitioner"}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-3">
                                {/* View Button - Primary treatment */}
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowDetailModal(true);
                                  }}
                                  className={`
        inline-flex items-center justify-center
        px-5 py-2.5           /* generous padding for premium clickable area */
        text-sm font-semibold  /* crisp, enterprise typography */
        rounded-lg             /* modern medium radius */
        bg-[#3B75FD]           /* Primary Blue */
        text-white
        shadow-sm shadow-blue-500/20
        transition-all duration-200 ease-out
        hover:bg-[#2f66e6]     /* subtle darkening on hover */
        hover:shadow-md
        hover:shadow-blue-500/30
        active:scale-[0.98]    /* gentle press feedback */
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
      `}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>

                                {/* Contact Button - Strong accent */}
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setContactDoctorName(report.analysis?.recommendedDoctor || "Specialist");
                                    setShowContactModal(true);
                                  }}
                                  className={`
        inline-flex items-center justify-center
        px-5 py-2.5
        text-sm font-semibold
        rounded-lg
        bg-[#020331]               /* Dark Navy for strong contrast */
        text-white
        shadow-md shadow-gray-800/20
        transition-all duration-200 ease-out
        hover:bg-[#0a0a4a]         /* slightly lighter navy on hover */
        hover:shadow-lg
        hover:shadow-gray-900/25
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2
      `}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Medications</h2>
                <p className="text-slate-400 font-medium">Digital prescriptions issued by your practitioners.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {prescriptions.length === 0 ? (
                  <Card className="col-span-full border-none shadow-sm rounded-3xl p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="h-10 w-10 text-slate-200" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-400">No prescriptions found</h4>
                    <p className="text-slate-300 max-w-sm mx-auto mt-2">Your verified medication history will appear here.</p>
                  </Card>
                ) : (
                  prescriptions.map((pres, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col md:flex-row gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Activity className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xl font-black text-slate-900">{pres.medicineName}</h4>
                          <Badge className="bg-blue-50 text-blue-600 border-none font-bold">{pres.dosage}</Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-400 mb-6">{pres.frequency} • {pres.duration}</p>

                        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 leading-relaxed italic">
                          "{pres.instructions}"
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200" />
                            <span className="text-xs font-bold text-slate-700">Dr. {pres.doctorName}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{pres.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <ReportUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={addNewReport}
      />
      <ReportDetailModal
        report={selectedReport}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onDelete={deleteReportLocally}
        onRename={renameReportLocally}
        onAnalyze={handleAnalyze}
        analyzing={analyzing}
      />
      <ContactDoctorModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        doctorName={contactDoctorName}
      />
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>}>
      <PatientDashboardContent />
    </Suspense>
  )
}