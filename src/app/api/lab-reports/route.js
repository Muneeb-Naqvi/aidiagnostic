import getDB from "@/config/database"
import LabReportAPI from "@/lib/labReportAPI"
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

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
