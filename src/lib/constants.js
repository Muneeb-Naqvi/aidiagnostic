// Medical specializations (Complete List)
export const SPECIALIZATIONS = [
  "Anesthesiology",
  "Cardiology",
  "Cardiothoracic Surgery",
  "Dermatology",
  "Endocrinology",
  "ENT / Otolaryngology",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Gynecology",
  "Hematology",
  "Infectious Diseases",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology / Respiratory",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Vascular Surgery",
  "Emergency Medicine",
  "Family Medicine",
  "General Physician",
  "Pathology",
  "Pharmacology",
  "Physiotherapy",
  "Sports Medicine",
  "Dentistry",
  "Nutrition & Dietetics"
]

// Disease suggestions based on analysis
export const DISEASE_DATABASE = {
  diabetes: {
    name: "Type 2 Diabetes",
    specialization: "Endocrinology",
    symptoms: ["High blood sugar", "Fatigue", "Increased thirst", "Frequent urination"],
    icon: "🩺",
  },
  hypertension: {
    name: "Hypertension",
    specialization: "Cardiology",
    symptoms: ["High blood pressure", "Headaches", "Chest pain"],
    icon: "💓",
  },
  asthma: {
    name: "Asthma",
    specialization: "Respiratory",
    symptoms: ["Shortness of breath", "Wheezing", "Chest tightness"],
    icon: "🫁",
  },
  arthritis: {
    name: "Arthritis",
    specialization: "Orthopedics",
    symptoms: ["Joint pain", "Stiffness", "Reduced mobility"],
    icon: "🦴",
  },
}

// Admin credentials
export const ADMIN_CREDENTIALS = {
  email: "admin@medicare.com",
  password: "Admin@123",
}

export const DOCTOR_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
}

// Function to generate Doctor ID
export function generateDoctorId() {
  return "DR" + Date.now().toString(36).toUpperCase()
}
