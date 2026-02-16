import { generateText } from "ai"
import connectDB from "@/lib/db"
import LabReport from "@/models/LabReport"

const diseaseSpecializationMap = {
  "Heart Disease": ["Cardiology"],
  "High Blood Pressure": ["Cardiology"],
  "High Cholesterol": ["Cardiology"],
  Diabetes: ["Gastroenterology", "General Practice"],
  "Thyroid Disorder": ["Gastroenterology"],
  "Kidney Disease": ["General Practice"],
  "Lung Disease": ["Pulmonology"],
  Asthma: ["Pulmonology"],
  "Bone Fracture": ["Orthopedics"],
  Arthritis: ["Orthopedics"],
  Cancer: ["Oncology"],
  "Skin Condition": ["Dermatology"],
  "Brain Disorder": ["Neurology"],
  "Anxiety/Depression": ["Psychiatry"],
  "Stomach Issues": ["Gastroenterology"],
  Infection: ["General Practice"],
  "Normal/Healthy": ["General Practice"],
}

export async function POST(req) {
  try {
    await connectDB()

    const { reportId } = await req.json()

    if (!reportId) {
      return new Response(JSON.stringify({ message: "Report ID is required" }), { status: 400 })
    }

    // Fetch the report
    const report = await LabReport.findById(reportId)

    if (!report) {
      return new Response(JSON.stringify({ message: "Report not found" }), { status: 404 })
    }

    // Use AI to analyze the report based on title and type
    const prompt = `You are a medical AI assistant. Analyze this lab report and provide a brief analysis:
    
Report Title: ${report.reportTitle}
Report Type: ${report.reportType}

Provide your response in this exact JSON format (no markdown, pure JSON):
{
  "disease": "detected disease or condition name",
  "severity": "mild, moderate, severe, or critical",
  "details": "brief 2-3 sentence analysis",
  "riskFactors": ["factor1", "factor2"]
}

Be professional and accurate. If it appears normal, say "Normal/Healthy".`

    // Call Vercel AI Gateway
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: prompt,
      temperature: 0.3,
    })

    // Parse the AI response
    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch {
      // Fallback if JSON parsing fails
      analysisData = {
        disease: "Requires Manual Review",
        severity: "moderate",
        details: "AI analysis needs verification by medical professional",
        riskFactors: [],
      }
    }

    // Get specializations for the detected disease
    const suggestedSpecializations = diseaseSpecializationMap[analysisData.disease] || ["General Practice"]

    // Update report with analysis
    const updatedReport = await LabReport.findByIdAndUpdate(
      reportId,
      {
        analysis: {
          disease: analysisData.disease,
          severity: analysisData.severity,
          details: analysisData.details,
          suggestedSpecialization: suggestedSpecializations,
          analyzedDate: new Date(),
          analyzedBy: "AI",
        },
        status: "analyzed",
      },
      { new: true },
    )

    return new Response(
      JSON.stringify({
        message: "Report analyzed successfully",
        report: updatedReport,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error analyzing report:", error.message)
    return new Response(JSON.stringify({ message: "Error analyzing report: " + error.message }), { status: 500 })
  }
}