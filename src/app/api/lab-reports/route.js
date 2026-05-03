import getDB from "@/config/database"
import LabReportAPI from "@/lib/labReportAPI"
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { sendEmail } from "@/config/email"

/* =========================
   SAVE ANALYSIS (PATCH)
========================= */
export async function PATCH(req) {
  try {
    const db = await getDB()
    const body = await req.json()
    const { reportId, analysis, sendToPatient } = body

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "reportId is required" },
        { status: 400 }
      )
    }

    // Update the report with analysis
    const ObjectId = require("mongodb").ObjectId
    const reportObjectId = new ObjectId(reportId)

    const updateData = {
      analysis: analysis,
      status: "analyzed",
      updatedAt: new Date(),
    }

    await db.collection("labReports").updateOne(
      { _id: reportObjectId },
      { $set: updateData }
    )

    // Get the report to find patient details
    const report = await db.collection("labReports").findOne({ _id: reportObjectId })

    // If sendToPatient is true, send notification to patient
    if (sendToPatient && report?.patientId) {
      const patient = await db.collection("patients").findOne({ patientId: report.patientId })
      
      if (patient) {
        // Create in-app notification
        const notification = {
          type: "lab_report_analysis",
          title: "Lab Report Analysis Ready",
          message: `Your lab report "${report.reportTitle}" has been analyzed by the doctor. View the analysis in your reports section.`,
          patientId: report.patientId,
          reportId: reportId,
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
                <h2 style="color: #3B82F6;">Lab Report Analysis Ready</h2>
                <p>Dear ${patient.name || 'Patient'},</p>
                <p>Your lab report <strong>"${report.reportTitle}"</strong> has been analyzed by the doctor.</p>
                <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0F172A; margin-top: 0;">Analysis Findings:</h3>
                  <p style="color: #334155; line-height: 1.6;">${analysis}</p>
                </div>
                <p>Please log in to your patient dashboard to view the complete analysis and any recommendations.</p>
                <p style="color: #64748B; font-size: 14px;">Thank you for using our service.</p>
              </div>
            `,
          })
          console.log("Email sent to patient:", patient.email)
        } catch (emailError) {
          console.error("Failed to send email to patient:", emailError)
          // Continue even if email fails - notification is already saved
        }
        
        console.log("Notification sent to patient:", patient.email)
      }
    }

    return NextResponse.json({ success: true, message: "Analysis saved successfully" })
  } catch (error) {
    console.error("[PATCH /lab-reports]", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* =========================
   GET LAB REPORTS
========================= */
export async function GET(req) {
  try {
    const db = await getDB()

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "patientId is required" },
        { status: 400 }
      )
    }

    const reports = await LabReportAPI.getAll({ patientId, db })

    const formattedReports = reports.map((r) => ({
      reportId: r._id.toString(),
      name: r.reportTitle,
      type: r.reportType,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      status: r.status || "pending-analysis",
      uploadDate: new Date(r.createdAt).toLocaleDateString(),
      analysis: r.analysis || null,
    }))

    return NextResponse.json({ success: true, data: formattedReports })
  } catch (error) {
    console.error("[GET /lab-reports]", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/* =========================
   POST LAB REPORT
========================= */
export async function POST(req) {
  try {
    const db = await getDB()

    const formData = await req.formData()

    const patientId = formData.get("patientId")
    const reportTitle = formData.get("name")
    const reportType = formData.get("type")
    const file = formData.get("file")

    if (!patientId || !reportTitle || !file) {
      return NextResponse.json(
        { success: false, error: "patientId, name, file required" },
        { status: 400 }
      )
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Invalid file" },
        { status: 400 }
      )
    }

    /* 📁 Save file locally */
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const uploadDir = path.join(process.cwd(), "public/uploads")

    await fs.mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`
    const fileType = file.type || "application/octet-stream"

    /* 💾 Save DB record */
    const saved = await LabReportAPI.createReport({
      db,
      patientId,
      reportTitle,
      reportType,
      fileUrl,
      fileType,
      status: "pending-analysis",
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          reportId: saved._id.toString(),
          name: saved.reportTitle,
          type: saved.reportType,
          fileUrl,
          fileType,
          status: saved.status,
          uploadDate: new Date(saved.createdAt).toLocaleDateString(),
          analysis: saved.analysis || null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /lab-reports]", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
