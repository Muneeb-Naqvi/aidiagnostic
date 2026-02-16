/**
 * Generate unique doctor ID
 * @returns {string} Doctor ID (DR...)
 */
export function generateDoctorId() {
  return `DR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

/**
 * Generate unique patient ID
 * @returns {string} Patient ID (PT...)
 */
export function generatePatientId() {
  return `PT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

/**
 * Format date to readable format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format date with time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date with time
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 100) {
  return text.length > length ? text.substring(0, length) + "..." : text
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
