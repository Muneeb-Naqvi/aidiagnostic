import { ObjectId } from "mongodb"
import getDB from "@/config/database"
import { NextResponse } from "next/server"
import { sendEmail } from "@/config/email"

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

       // Check if this appears to be an OCR failure case
       const extractedText = report.extractedText || "";
       const isOcrFailure = extractedText && extractedText.includes("[OCR FAILED]");

       let disease = detectDisease(report.reportType);
       let severity = "moderate";
       let confidence = 0.75;
       let recommendedDoctor = "General Physician";
       
       // If OCR failed, mark as insufficient data
       if (isOcrFailure) {
         disease = "Insufficient data to determine clinical condition";
         severity = "unknown";
         confidence = 0;
         recommendedDoctor = "Consult healthcare professional";
       } else {
         const doctor = diseaseToDoctorMap[disease] || "General Physician";
         recommendedDoctor = doctor;
       }

       const analysis = {
         disease,
         severity,
         confidence,
         recommendedDoctor,
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

      // Send notification to patient
      if (report.patientId) {
        const patient = await db.collection("patients").findOne({ patientId: report.patientId })
        
        if (patient) {
          // Create in-app notification
          const notification = {
            type: "lab_report_analysis",
            title: "Lab Report Analysis Ready",
            message: `Your lab report "${report.reportTitle}" has been analyzed. View the analysis in your reports section.`,
            patientId: report.patientId,
            reportId: id,
            createdAt: new Date(),
            read: false,
          }
          
          await db.collection("notifications").insertOne(notification)
          
          // Send email to patient
          try {
            await sendEmail({
              to: patient.email,
              subject: `Lab Report Analysis - ${report.reportTitle}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Lab Report Analysis Complete</h2>
                  <p>Dear ${patient.name || 'Patient'},</p>
                  <p>Your lab report <strong>"${report.reportTitle}"</strong> has been analyzed.</p>
                  ${analysis.disease ? `<p><strong>Detected:</strong> ${analysis.disease}</p>` : ''}
                  ${analysis.severity ? `<p><strong>Severity:</strong> ${analysis.severity}</p>` : ''}
                  <p>Please log in to your patient dashboard to view the complete analysis.</p>
                  <p style="color: #64748B; font-size: 14px;">Thank you for using our service.</p>
                </div>
              `,
            })
            console.log("[BULK] Email sent to patient:", patient.email)
          } catch (emailError) {
            console.error("[BULK] Failed to send email to patient:", emailError)
          }
        }
      }

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
