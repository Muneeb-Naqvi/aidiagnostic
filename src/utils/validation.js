/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Email validity
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const result = {
    isValid: true,
    errors: [],
  }

  if (password.length < 8) {
    result.errors.push("Password must be at least 8 characters")
    result.isValid = false
  }
  if (!/[A-Z]/.test(password)) {
    result.errors.push("Password must contain uppercase letter")
    result.isValid = false
  }
  if (!/[a-z]/.test(password)) {
    result.errors.push("Password must contain lowercase letter")
    result.isValid = false
  }
  if (!/[0-9]/.test(password)) {
    result.errors.push("Password must contain number")
    result.isValid = false
  }

  return result
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Phone validity
 */
export function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10,}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

/**
 * Validate required fields
 * @param {Object} fields - Fields to validate
 * @returns {Array} Array of missing field names
 */
export function validateRequiredFields(fields) {
  return Object.entries(fields)
    .filter(([_, value]) => !value || value.trim() === "")
    .map(([key, _]) => key)
}
