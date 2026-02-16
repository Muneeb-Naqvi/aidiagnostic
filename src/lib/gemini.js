export async function analyzeMedicalText(text) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  })

  const prompt = `
You are a medical AI assistant.
Analyze the medical report below.
Detect disease and suggest doctor specialization.

Return JSON ONLY in this exact format:
{
  "disease": "",
  "severity": "",
  "confidence": 0.0,
  "recommendedDoctor": ""
}

Report:
${text}
`

  const result = await model.generateContent(prompt)
  const raw = await result.response.text()

  // 🔥 SAFETY CLEAN
  const jsonText = raw.match(/\{[\s\S]*\}/)?.[0]
  if (!jsonText) throw new Error("Invalid AI response")

  return JSON.parse(jsonText)
}
