export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateDoctorId() {
  return "DR" + Date.now().toString(36).toUpperCase()
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatTime(time) {
  return new Date(`1970-01-01 ${time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function parseJwt(token) {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )
  return JSON.parse(jsonPayload)
}

export function generatePatientId() {
  return "PT" + Date.now().toString(36).toUpperCase()
}

export function generatePrescriptionId() {
  return "RX" + Date.now().toString(36).toUpperCase()
}

export function getInitials(firstName, lastName) {
  return (firstName?.charAt(0) + lastName?.charAt(0))?.toUpperCase() || "U"
}

export function isValidDiseaseSpecialization(disease) {
  const validSpecializations = [
    "cardiology",
    "neurology",
    "gastroenterology",
    "dermatology",
    "pulmonology",
    "nephrology",
    "orthopedics",
    "oncology",
  ]
  return validSpecializations.includes(disease?.toLowerCase())
}

export function getSpecializationForDisease(disease) {
  const diseaseMap = {
    "heart disease": "cardiology",
    diabetes: "endocrinology",
    asthma: "pulmonology",
    arthritis: "orthopedics",
    eczema: "dermatology",
    migraines: "neurology",
    hypertension: "cardiology",
  }
  return diseaseMap[disease?.toLowerCase()] || "general medicine"
}
