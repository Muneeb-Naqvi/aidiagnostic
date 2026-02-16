"use client"

import { useState } from "react"
import { X, Upload, File, Activity, UploadCloud } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReportUploadModal({ isOpen, onClose, onUpload }) {
  const [files, setFiles] = useState([])
  const [reportType, setReportType] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!files.length || !reportType) {
      alert("Please select files and report type")
      return
    }

    setLoading(true)

    const reports = Array.from(files).map((file) => ({
      reportTitle: file.name.split(".")[0],
      reportType,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
    }))

    await onUpload(reports)

    setFiles([])
    setReportType("")
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
            <div className="relative z-10 text-center">
              <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                <UploadCloud className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Upload Lab Reports</h2>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Report Category</Label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white appearance-none"
                >
                  <option value="" disabled>Select report type</option>
                  <option>Blood Test</option>
                  <option>X-Ray</option>
                  <option>MRI</option>
                  <option>CT Scan</option>
                  <option>Ultrasound</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Select Files</Label>
                <div className="relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setFiles(e.target.files || [])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full px-4 py-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all group-hover:border-blue-400"
                  >
                    {files.length > 0 ? (
                      <div className="text-center">
                        <File className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{files.length} files selected</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">PDF, JPG or PNG</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleUpload}
                disabled={loading || !files.length || !reportType}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none border-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5" />
                    Submit Reports
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}







