// Comprehensive disease database for patient report analysis
export const DISEASE_DATABASE = {
  diabetes: {
    name: "Type 2 Diabetes",
    specialization: "Endocrinology",
    symptoms: ["High blood sugar", "Fatigue", "Increased thirst", "Frequent urination"],
    riskFactors: ["Obesity", "Sedentary lifestyle", "Family history"],
    treatments: ["Metformin", "Insulin therapy", "Lifestyle changes"],
    icon: "🩺",
  },
  hypertension: {
    name: "Hypertension (High Blood Pressure)",
    specialization: "Cardiology",
    symptoms: ["High blood pressure", "Headaches", "Chest pain", "Shortness of breath"],
    riskFactors: ["High sodium diet", "Stress", "Obesity", "Age"],
    treatments: ["ACE inhibitors", "Beta-blockers", "Diuretics", "Lifestyle changes"],
    icon: "💓",
  },
  asthma: {
    name: "Asthma",
    specialization: "Pulmonology",
    symptoms: ["Shortness of breath", "Wheezing", "Chest tightness", "Coughing"],
    riskFactors: ["Allergies", "Air pollution", "Family history", "Childhood illness"],
    treatments: ["Inhalers", "Bronchodilators", "Corticosteroids", "Allergen avoidance"],
    icon: "🫁",
  },
  arthritis: {
    name: "Arthritis",
    specialization: "Rheumatology",
    symptoms: ["Joint pain", "Stiffness", "Reduced mobility", "Swelling"],
    riskFactors: ["Age", "Family history", "Previous injury", "Autoimmune disorders"],
    treatments: ["NSAIDs", "Physical therapy", "Joint injections", "Surgery"],
    icon: "🦴",
  },
  thyroid: {
    name: "Thyroid Disorder",
    specialization: "Endocrinology",
    symptoms: ["Fatigue", "Weight changes", "Temperature sensitivity", "Hair loss"],
    riskFactors: ["Family history", "Gender", "Stress", "Iodine deficiency"],
    treatments: ["Levothyroxine", "Beta-blockers", "Radioactive iodine", "Surgery"],
    icon: "🔴",
  },
  cholesterol: {
    name: "High Cholesterol",
    specialization: "Cardiology",
    symptoms: ["Usually asymptomatic", "Elevated lipid levels"],
    riskFactors: ["Diet high in saturated fat", "Sedentary lifestyle", "Family history"],
    treatments: ["Statins", "Dietary changes", "Exercise", "Fibrates"],
    icon: "❤️",
  },
}

export default DISEASE_DATABASE
