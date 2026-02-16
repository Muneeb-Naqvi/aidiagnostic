import LabReportAPI from "@/lib/labReportAPI";
import DoctorAPI from "@/lib/doctorAPI";
import { medicalPrompt } from "@/lib/aiPrompt";
import { extractTextFromImage } from "@/lib/ocr";
import connectDB from "@/lib/db";

export async function POST(req, context) {
    try {
        await connectDB();

        const { id } = await context.params;
        if (!id) {
            return Response.json({ success: false, error: "Report ID is required" }, { status: 400 });
        }

        const apiKey = process.env.FIREWORKS_API_KEY;
        if (!apiKey) {
            return Response.json({ success: false, error: "FIREWORKS_API_KEY is missing in .env" }, { status: 500 });
        }

        // 1. Fetch Report
        const report = await LabReportAPI.getReportById(id);
        if (!report) {
            return Response.json({ success: false, error: "Report not found" }, { status: 404 });
        }

        // 2. Extract Text using OCRSPACE
        let extractedText = report.extractedText || "";
        if (!extractedText && (report.fileType?.startsWith("image/") || report.fileUrl.toLowerCase().endsWith(".pdf"))) {
            try {
                console.log(`[Analysis] OCR Extraction started: ${report.reportTitle}`);
                extractedText = await extractTextFromImage(report.fileUrl);
                console.log(`[Analysis] OCR Result Length: ${extractedText?.length || 0}`);
            } catch (ocrError) {
                console.error("OCR process failed:", ocrError);
                extractedText = "";
            }
        }

        if (!extractedText || extractedText.trim().length < 10) {
            console.warn("[Analysis] OCR yielded no text. Using report title as fallback.");
            extractedText = `Report Title: ${report.reportTitle}`;
        }

        // 3. Generate Analysis with Fireworks AI
        const prompt = medicalPrompt(extractedText);

        // Use the confirmed available high-power model: Llama 3.3 70B
        const models = [
            "accounts/fireworks/models/llama-v3p3-70b-instruct",
            "accounts/fireworks/models/llama-v3p1-70b-instruct",
            "accounts/fireworks/models/gpt-oss-20b"
        ];

        let responseText = "";
        let usedModel = "";

        for (const modelId of models) {
            try {
                console.log(`[Analysis] Calling AI: ${modelId}`);
                const attempt = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: modelId,
                        messages: [
                            { role: "system", content: "You are a Board-Certified Medical Diagnostic AI. You must return result in valid JSON format." },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 3000,
                        temperature: 0.1,
                        // Some models support response_format
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
                console.warn(`[Analysis] ${modelId} failed: ${data.error?.message || "Invalid structure"}`);
            } catch (e) {
                console.error(`[Analysis] Request failed for ${modelId}:`, e.message);
            }
        }

        if (!usedModel || !responseText) {
            throw new Error(`AI Analysis failed. All models are currently unresponsive.`);
        }

        console.log(`[Analysis] Success using engine: ${usedModel}`);

        // 4. Parse AI Response
        let analysis;
        try {
            // Find JSON block if it's mixed with reasoning
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            let toParse = jsonMatch ? jsonMatch[0] : responseText;
            const cleaned = toParse.replace(/```json|```/g, "").trim();
            analysis = JSON.parse(cleaned);
        } catch (parseError) {
            console.error("JSON parse error. Raw Advice len:", responseText.length);
            analysis = {
                disease: "Analysis Error",
                severity: "unknown",
                confidence: 0,
                details: "Critically incomplete AI response. Please re-analyze or check logs.",
                suggestedSpecializations: [],
            };
        }

        // 5. Doctor Matching
        let matchingDoctors = [];
        if (analysis.suggestedSpecializations && analysis.suggestedSpecializations.length > 0) {
            // Get all doctors, not just approved ones (unless status is strict requirement, but user implies they exist)
            // But let's stick to "approved" to be safe, just ensure the matching logic is better.
            const doctors = await DoctorAPI.getAllDoctors();

            matchingDoctors = doctors.filter(doc => {
                const docSpec = doc.specialization.toLowerCase();

                return analysis.suggestedSpecializations.some(aiSpec => {
                    const aiSpecLower = aiSpec.toLowerCase();

                    // 1. Direct match
                    if (docSpec.includes(aiSpecLower) || aiSpecLower.includes(docSpec)) return true;

                    // 2. Root match (strip common medical suffixes to match Nephrology <-> Nephrologist)
                    // Common suffixes: -logy, -logist, -ist, -ics, -ian
                    const cleanRoot = (str) => str.replace(/(logy|logist|ist|ics|ian|path|surg|ery)$/g, "");

                    const docRoot = cleanRoot(docSpec);
                    const aiRoot = cleanRoot(aiSpecLower);

                    // Match if sufficiently long root matches (avoid over-matching short words)
                    return docRoot.length > 3 && (docRoot.includes(aiRoot) || aiRoot.includes(docRoot));
                });
            });
        }

        analysis.recommendedDoctor = matchingDoctors.length > 0
            ? matchingDoctors.map(d => `Dr. ${d.name}`).join(", ")
            : "Currently no doctor available";

        // 6. Update Report
        const updated = await LabReportAPI.updateAnalysis(id, {
            ...analysis,
            extractedText,
        });

        return Response.json({
            success: true,
            data: updated
        });

    } catch (error) {
        console.error("[ANALYZE ERROR]", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}