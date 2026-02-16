// Medical specializations
export const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Gastroenterology",
  "Psychiatry",
  "Oncology",
  "Respiratory",
  "Endocrinology",
  "Nephrology",
  "Rheumatology",
  "Ophthalmology",
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
