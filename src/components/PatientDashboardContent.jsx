// const handleAnalyzeAllReports = async () => {
//   if (selectedReports.length === 0) {
//     toast.error("Please select at least one report")
//     return
//   }

//   try {
//     setAnalyzing(true)

//     const reportIds = selectedReports.map(
//       (r) => r.reportId || r._id
//     )

//     const res = await fetch("/api/lab-reports/analyze-bulk", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ reportIds }),
//     })

//     const data = await res.json()

//     if (!data.success) {
//       throw new Error(data.error || "AI analysis failed")
//     }

//     // ✅ VERY IMPORTANT
//     await loadReports()

//     toast.success("AI analysis completed")
//   } catch (err) {
//     console.error("ANALYZE ERROR:", err)
//     toast.error(err.message)
//   } finally {
//     setAnalyzing(false)
//   }
// }
