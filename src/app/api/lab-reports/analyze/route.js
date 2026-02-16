import { getDB } from "@/config/database"
import { ObjectId } from "mongodb"
import { extractTextFromImage } from "@/lib/ocr"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { reportId } = await req.json()
    if (!reportId) {
      return NextResponse.json({ error: "reportId required" }, { status: 400 })
    }

    const db = await getDB()
    const report = await db.collection("labReports").findOne({
      _id: new ObjectId(reportId),
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    /* 🧾 OCR */
    const filePath = process.cwd() + "/public" + report.fileUrl
    const extractedText = await extractTextFromImage(filePath)

    /* 🤖 Gemini */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
You are a medical AI assistant.

Analyze the report text and respond ONLY in JSON:

{
  "disease": "Normal/Healthy or disease name",
  "recommendedDoctor": "Doctor specialization",
  "severity": "mild | moderate | severe"
}

Report Text:
${extractedText}
`

    const result = await model.generateContent(prompt)
    const cleaned = result.response.text().replace(/```json|```/g, "").trim()
    const analysis = JSON.parse(cleaned)

    /* 💾 Save */
    await db.collection("labReports").updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          extractedText,
          analysis,
          status: "analyzed",
          analyzedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true, analysis })
  } catch (err) {
    console.error("AI ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
