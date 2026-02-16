import { ObjectId } from "mongodb"
import getDB from "@/config/database"
import { NextResponse } from "next/server"

/* 🧠 Disease → Doctor Map */
const diseaseToDoctorMap = {
  "Heart Disease": "Cardiologist",
  "Skin Condition": "Dermatologist",
  "Kidney Disease": "Nephrologist",
  Infection: "General Physician",
  "Normal/Healthy": "General Physician",
}

/* 🧠 Disease Detection */
function detectDisease(reportType = "") {
  const type = reportType.toLowerCase()

  if (type.includes("heart")) return "Heart Disease"
  if (type.includes("skin")) return "Skin Condition"
  if (type.includes("kidney")) return "Kidney Disease"
  if (type.includes("urine")) return "Kidney Disease"
  if (type.includes("blood")) return "Infection"

  return "Normal/Healthy"
}

export async function POST(req) {
  try {
    const { reportIds } = await req.json()

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "reportIds array is required" },
        { status: 400 }
      )
    }

    const db = await getDB()
    const collection = db.collection("labReports")

    const results = []

    for (const id of reportIds) {
      if (!ObjectId.isValid(id)) continue

      const _id = new ObjectId(id)
      const report = await collection.findOne({ _id })
      if (!report) continue

      const disease = detectDisease(report.reportType)
      const doctor = diseaseToDoctorMap[disease] || "General Physician"

      const analysis = {
        disease,
        severity: "moderate",
        confidence: 0.75,
        recommendedDoctor: doctor,
        analyzedBy: "AI",
        analyzedAt: new Date(),
      }

      await collection.updateOne(
        { _id },
        {
          $set: {
            analysis,
            status: "analyzed",
            updatedAt: new Date(),
          },
        }
      )

      results.push({
        reportId: id,
        status: "analyzed",
        analysis,
      })
    }

    return NextResponse.json({
      success: true,
      analyzedCount: results.length,
      data: results,
    })
  } catch (error) {
    console.error("❌ BULK ANALYZE ERROR:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
