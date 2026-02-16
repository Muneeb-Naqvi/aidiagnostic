"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function PatientDashboardContent({ patientId }) {
  const [reports, setReports] = useState([])
  const [selectedReports, setSelectedReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // ✅ 1️⃣ LOAD REPORTS
  const loadReports = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/lab-reports?patientId=${patientId}`)
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load reports")
      }

      setReports(data.data || [])
    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ 2️⃣ ANALYZE REPORTS
const handleAnalyzeAllReports = async () => {
  if (selectedReports.length === 0) {
    toast.error("Please select at least one report")
    return
  }

  try {
    setAnalyzing(true)

    const reportIds = selectedReports.map(
      (r) => r.reportId || r._id
    )

    const res = await fetch("/api/lab-reports/analyze-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds }),
    })

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.error || "AI analysis failed")
    }

    // 🔥 VERY IMPORTANT
    await loadReports(patientId)

    setSelectedReports([])
    toast.success("AI analysis completed")
  } catch (err) {
    console.error("ANALYZE ERROR:", err)
    toast.error(err.message)
  } finally {
    setAnalyzing(false)
  }
}


  // ✅ LOAD ON PAGE OPEN
  useEffect(() => {
    if (patientId) loadReports()
  }, [patientId])

  return (
    <>
      <button onClick={handleAnalyzeAllReports}>
        Analyze Selected Reports
      </button>

      {/* reports UI */}
    </>
  )
}
