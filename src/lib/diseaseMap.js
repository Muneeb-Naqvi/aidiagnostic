export const diseaseMap = {
  // Cardiovascular
  "Heart Disease": "Cardiologist",
  "Hypertension": "Cardiologist",
  "Arrhythmia": "Cardiologist",
  "Coronary Artery Disease": "Cardiologist",
  "Heart Failure": "Cardiologist",
  
  // Diabetes & Endocrine
  "Diabetes": "Endocrinologist",
  "Diabetes Type 1": "Endocrinologist",
  "Diabetes Type 2": "Endocrinologist",
  "Thyroid Disease": "Endocrinologist",
  "Hyperthyroidism": "Endocrinologist",
  "Hypothyroidism": "Endocrinologist",
  
  // Blood & Hematology
  "Anemia": "Hematologist",
  "Hemophilia": "Hematologist",
  "Leukemia": "Hematologist",
  "Lymphoma": "Hematologist",
  "Thrombocytopenia": "Hematologist",
  
  // Respiratory
  "Asthma": "Pulmonologist",
  "COPD": "Pulmonologist",
  "Pneumonia": "Pulmonologist",
  "Tuberculosis": "Pulmonologist",
  "Bronchitis": "Pulmonologist",
  "Lung Cancer": "Pulmonologist",
  
  // Mental Health
  "Depression": "Psychiatrist",
  "Anxiety": "Psychiatrist",
  "Bipolar Disorder": "Psychiatrist",
  "Schizophrenia": "Psychiatrist",
  "PTSD": "Psychiatrist",
  
  // Neurology
  "Migraine": "Neurologist",
  "Epilepsy": "Neurologist",
  "Parkinson's Disease": "Neurologist",
  "Alzheimer's Disease": "Neurologist",
  "Stroke": "Neurologist",
  "Multiple Sclerosis": "Neurologist",
  
  // Orthopedics
  "Arthritis": "Orthopedist",
  "Osteoporosis": "Orthopedist",
  "Fracture": "Orthopedist",
  "Back Pain": "Orthopedist",
  "Knee Problems": "Orthopedist",
  
  // Gastroenterology
  "Gastritis": "Gastroenterologist",
  "GERD": "Gastroenterologist",
  "Ulcer": "Gastroenterologist",
  "Crohn's Disease": "Gastroenterologist",
  "IBS": "Gastroenterologist",
  "Liver Disease": "Gastroenterologist",
  
  // Nephrology
  "Kidney Disease": "Nephrologist",
  "Chronic Kidney Disease": "Nephrologist",
  "Kidney Stones": "Nephrologist",
  "Urinary Tract Infection": "Urologist",
  
  // Oncology
  "Cancer": "Oncologist",
  "Breast Cancer": "Oncologist",
  "Prostate Cancer": "Oncologist",
  
  // Dermatology
  "Skin Cancer": "Dermatologist",
  "Psoriasis": "Dermatologist",
  "Eczema": "Dermatologist",
  "Acne": "Dermatologist",
  
  // Dentistry
  "Tooth Pain": "Dentist",
  "Cavities": "Dentist",
  "Gum Disease": "Dentist",
  
  // General/Default
  "General Consultation": "General Practitioner",
  "Normal": "General Practitioner",
  "Healthy": "General Practitioner",
};

/**
 * Get specialization(s) for a detected disease
 * @param {string} disease - The detected disease name
 * @returns {string|string[]} - The recommended specialization(s)
 */
export const getSpecializationForDisease = (disease) => {
  if (!disease) return "General Practitioner";
  
  // Exact match
  if (diseaseMap[disease]) return diseaseMap[disease];
  
  // Partial match (case-insensitive)
  for (const [key, value] of Object.entries(diseaseMap)) {
    if (disease.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(disease.toLowerCase())) {
      return value;
    }
  }
  
  // Default fallback
  return "General Practitioner";
};
