// AI Diagnosis using Fireworks API
// Uses multimodal capabilities to analyze uploaded reports/images

const FIREWORKS_API_KEY = process.env.NEXT_PUBLIC_FIREWORKS_API_KEY || process.env.FIREWORKS_API_KEY
const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1"

export async function generateAIDiagnosis(patientInfo, symptoms, reports) {
  if (!FIREWORKS_API_KEY) {
    throw new Error("Fireworks API key not configured")
  }

  // Build the prompt for diagnosis
  const prompt = buildDiagnosisPrompt(patientInfo, symptoms, reports)

  try {
    const response = await fetch(`${FIREWORKS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3-70b-instruct",
        messages: [
          {
            role: "system",
            content: `You are an experienced medical doctor specializing in diagnosis. Based on patient information, symptoms, and medical reports, provide a comprehensive diagnosis. 
            
            Respond in JSON format with the following structure:
            {
              "primaryDiagnosis": "Main diagnosis",
              "severity": "mild|moderate|severe",
              "differentialDiagnosis": ["Alternative diagnosis 1", "Alternative diagnosis 2"],
              "recommendedMedicines": [
                {"name": "Medicine name", "dosage": "dosage", "frequency": "frequency", "duration": "duration", "reason": "why this medicine"}
              ],
              "recommendedTests": ["Test 1", "Test 2"],
              "lifestyleAdvice": ["advice 1", "advice 2"],
              "followUpDays": number of days for follow-up,
              "warnings": ["any specific warnings"]
            }
            
            Always prioritize patient safety. If symptoms are severe, recommend immediate medical attention.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Fireworks API error: ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No diagnosis generated")
    }

    // Parse JSON from response
    try {
      // Find JSON in the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(content)
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      throw new Error("Failed to parse AI diagnosis response")
    }
  } catch (error) {
    console.error("AI Diagnosis error:", error)
    throw error
  }
}

function buildDiagnosisPrompt(patientInfo, symptoms, reports) {
  let prompt = "PATIENT INFORMATION:\n"
  
  if (patientInfo.name) {
    prompt += `- Name: ${patientInfo.name}\n`
  }
  if (patientInfo.age) {
    prompt += `- Age: ${patientInfo.age} years\n`
  }
  if (patientInfo.gender) {
    prompt += `- Gender: ${patientInfo.gender}\n`
  }
  if (patientInfo.weight) {
    prompt += `- Weight: ${patientInfo.weight} kg\n`
  }
  if (patientInfo.bloodGroup) {
    prompt += `- Blood Group: ${patientInfo.bloodGroup}\n`
  }
  if (patientInfo.allergies && patientInfo.allergies.length > 0) {
    prompt += `- Known Allergies: ${patientInfo.allergies.join(", ")}\n`
  }
  if (patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0) {
    prompt += `- Medical History: ${patientInfo.medicalHistory.join(", ")}\n`
  }
  if (patientInfo.currentMedications && patientInfo.currentMedications.length > 0) {
    prompt += `- Current Medications: ${patientInfo.currentMedications.join(", ")}\n`
  }
  
  prompt += "\nSYMPTOMS:\n"
  if (symptoms && symptoms.length > 0) {
    symptoms.forEach((symptom, index) => {
      prompt += `${index + 1}. ${symptom}\n`
    })
  } else {
    prompt += "No specific symptoms provided\n"
  }
  
  prompt += "\nMEDICAL REPORTS:\n"
  if (reports && reports.length > 0) {
    reports.forEach((report, index) => {
      prompt += `${index + 1}. ${report.name || "Report"}: ${report.analysis || "See attached file"}\n`
    })
  } else {
    prompt += "No reports attached\n"
  }
  
  prompt += "\nPlease provide a comprehensive diagnosis based on this information."
  
  return prompt
}

// OCR Function for extracting text from images
export async function extractTextFromImage(imageFile) {
  if (!FIREWORKS_API_KEY) {
    throw new Error("Fireworks API key not configured")
  }

  // Convert image to base64
  const base64Image = await fileToBase64(imageFile)

  try {
    const response = await fetch(`${FIREWORKS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3-70b-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all medical information, test results, and diagnosis from this medical report/image. Provide the extracted information in a structured format.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error("OCR extraction failed")
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ""
  } catch (error) {
    console.error("OCR error:", error)
    throw error
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(",")[1])
    reader.onerror = (error) => reject(error)
  })
}

// Fallback diagnosis suggestions based on common conditions
export function getFallbackDiagnosis(symptoms) {
  const symptomString = symptoms.toLowerCase()
  
  if (symptomString.includes("fever") && symptomString.includes("cough")) {
    return {
      primaryDiagnosis: "Upper Respiratory Tract Infection",
      severity: "moderate",
      differentialDiagnosis: ["Viral Fever", "Influenza"],
      recommendedMedicines: [
        { name: "Paracetamol 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "5 days", reason: "Fever and pain relief" },
        { name: "Cetirizine 10mg", dosage: "10mg", frequency: "Once daily", duration: "5 days", reason: "For allergic symptoms" },
      ],
      recommendedTests: ["CBC", "Chest X-Ray"],
      lifestyleAdvice: ["Rest adequately", "Stay hydrated", "Avoid cold foods"],
      followUpDays: 7,
      warnings: ["Seek immediate care if fever exceeds 103°F"],
    }
  }
  
  if (symptomString.includes("headache") && symptomString.includes("fever")) {
    return {
      primaryDiagnosis: "Viral Fever",
      severity: "mild",
      differentialDiagnosis: ["Migraine", "Tension Headache"],
      recommendedMedicines: [
        { name: "Paracetamol 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "3 days", reason: "Fever and pain control" },
      ],
      recommendedTests: ["CBC", "Malaria Test"],
      lifestyleAdvice: ["Complete rest", "Light diet", "Adequate fluids"],
      followUpDays: 5,
      warnings: [],
    }
  }
  
  if (symptomString.includes("chest pain") || symptomString.includes("breath")) {
    return {
      primaryDiagnosis: "Cardiac Evaluation Required",
      severity: "severe",
      differentialDiagnosis: ["Angina", "Gastritis"],
      recommendedMedicines: [
        { name: "Aspirin 75mg", dosage: "75mg", frequency: "Once daily", duration: "30 days", reason: "Cardiac protection" },
      ],
      recommendedTests: ["ECG", "2D Echo", "Cardiac Enzymes"],
      lifestyleAdvice: ["Avoid strenuous activity", "Low salt diet", "Regular monitoring"],
      followUpDays: 3,
      warnings: ["URGENT: Seek immediate medical attention"],
    }
  }
  
  // Default response
  return {
    primaryDiagnosis: "Clinical Assessment Required",
    severity: "moderate",
    differentialDiagnosis: [],
    recommendedMedicines: [],
    recommendedTests: ["Basic Blood Work"],
    lifestyleAdvice: ["Rest", "Balanced diet", "Adequate sleep"],
    followUpDays: 7,
    warnings: ["Consult if symptoms worsen"],
  }
}
