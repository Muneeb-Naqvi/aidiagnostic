import LabReportAPI from "@/lib/labReportAPI";
import DoctorAPI from "@/lib/doctorAPI";
import { medicalPrompt } from "@/lib/aiPrompt";
import { extractTextFromImage } from "@/lib/ocr";
import connectDB from "@/lib/db";

export async function POST(req, context) {
  try {
    await connectDB();

    const { patientId } = await context.params;
    if (!patientId || patientId === 'undefined') {
      return Response.json({ success: false, error: "Valid patientId is required" }, { status: 400 });
    }

    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: "FIREWORKS_API_KEY is missing in .env" }, { status: 500 });
    }

    const pendingReports = await LabReportAPI.getPendingReports(patientId);
    if (!pendingReports || pendingReports.length === 0) {
      return Response.json({ success: true, message: "No pending reports to analyze" });
    }

    const doctors = await DoctorAPI.getAllDoctors({ status: "approved" });
    const models = [
      "accounts/fireworks/models/llama-v3p3-70b-instruct",
      "accounts/fireworks/models/llama-v3p1-70b-instruct",
      "accounts/fireworks/models/gpt-oss-20b"
    ];

    const results = await Promise.all(pendingReports.map(async (report) => {
      try {
        let extractedText = report.extractedText || "";
        if (!extractedText && (report.fileType?.startsWith("image/") || report.fileUrl.toLowerCase().endsWith(".pdf"))) {
          try {
            extractedText = await extractTextFromImage(report.fileUrl);
          } catch (ocrError) {
            extractedText = "";
          }
        }

        if (!extractedText || extractedText.trim().length < 10) {
          extractedText = `Report Title: ${report.reportTitle}`;
        }

        const prompt = medicalPrompt(extractedText);

        let responseText = "";
        let usedModel = "";

        for (const modelId of models) {
          try {
            const attempt = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: modelId,
                messages: [
                  { role: "system", content: "You are a Board-Certified Medical Diagnostic AI. Return ONLY valid JSON." },
                  { role: "user", content: prompt }
                ],
                max_tokens: 3000,
                temperature: 0.1,
                response_format: { type: "json_object" }
              }),
            });

            const data = await attempt.json().catch(() => ({}));
            if (attempt.ok) {
              const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content;
              if (content) {
                usedModel = modelId;
                responseText = content;
                break;
              }
            }
          } catch (e) {
            // Skip silent
          }
        }

        if (!usedModel || !responseText) {
          throw new Error(`AI Analysis failed for this report.`);
        }

        let analysis;
        try {
          let jsonMatch = responseText.match(/\{[\s\S]*\}/);
          let toParse = jsonMatch ? jsonMatch[0] : responseText;
          const cleaned = toParse.replace(/```json|```/g, "").trim();
          analysis = JSON.parse(cleaned);
        } catch (parseError) {
          analysis = {
            disease: "Analysis Error",
            severity: "unknown",
            confidence: 0,
            details: "Error parsing AI response. Information may be cut off.",
            suggestedSpecializations: [],
          };
        }

        let matchingDoctors = [];
        if (analysis.suggestedSpecializations && analysis.suggestedSpecializations.length > 0) {
          matchingDoctors = doctors.filter(doc =>
            analysis.suggestedSpecializations.some(spec =>
              doc.specialization.toLowerCase().includes(spec.toLowerCase())
            )
          );
        }

        analysis.recommendedDoctor = matchingDoctors.length > 0
          ? matchingDoctors.map(d => `Dr. ${d.name}`).join(", ")
          : "Currently no doctor available";

        await LabReportAPI.updateAnalysis(report._id, {
          ...analysis,
          extractedText,
        });

        return { reportId: report._id, status: "analyzed", model: usedModel };
      } catch (err) {
        return { reportId: report._id, status: "failed", error: err.message };
      }
    }));

    return Response.json({
      success: true,
      message: `Processed ${pendingReports.length} report(s)`,
      results
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}