// Drug Interaction Database
// Comprehensive list of common drug interactions for prescription safety

export const drugInteractions = {
  // Pain relievers
  "paracetamol": {
    interactions: [
      { drug: "warfarin", severity: "moderate", effect: "Increased risk of bleeding" },
      { drug: "alcohol", severity: "high", effect: "Liver damage risk" },
    ],
    contraindicated: ["alcohol"],
  },
  "ibuprofen": {
    interactions: [
      { drug: "aspirin", severity: "moderate", effect: "Reduced aspirin effectiveness" },
      { drug: "warfarin", severity: "high", effect: "Increased bleeding risk" },
      { drug: "lithium", severity: "moderate", effect: "Increased lithium levels" },
      { drug: "methotrexate", severity: "high", effect: "Toxic methotrexate levels" },
    ],
    contraindicated: [],
  },
  "aspirin": {
    interactions: [
      { drug: "warfarin", severity: "high", effect: "Significantly increased bleeding risk" },
      { drug: "ibuprofen", severity: "moderate", effect: "Reduced cardioprotective effects" },
      { drug: "methotrexate", severity: "high", effect: "Toxic methotrexate levels" },
    ],
    contraindicated: [],
  },
  
  // Antibiotics
  "amoxicillin": {
    interactions: [
      { drug: "warfarin", severity: "moderate", effect: "Increased anticoagulant effect" },
      { drug: "allopurinol", severity: "moderate", effect: "Increased rash risk" },
    ],
    contraindicated: [],
  },
  "azithromycin": {
    interactions: [
      { drug: "warfarin", severity: "moderate", effect: "Increased bleeding risk" },
      { drug: "digoxin", severity: "moderate", effect: "Increased digoxin levels" },
      { drug: "antacids", severity: "low", effect: "Reduced absorption" },
    ],
    contraindicated: [],
  },
  "ciprofloxacin": {
    interactions: [
      { drug: "theophylline", severity: "high", effect: "Toxic theophylline levels" },
      { drug: "warfarin", severity: "high", effect: "Increased bleeding risk" },
      { drug: "tizanidine", severity: "contraindicated", effect: "Dangerously low blood pressure" },
      { drug: "antacids", severity: "moderate", effect: "Reduced absorption" },
    ],
    contraindicated: ["tizanidine"],
  },
  "metronidazole": {
    interactions: [
      { drug: "alcohol", severity: "high", effect: "Disulfiram-like reaction" },
      { drug: "warfarin", severity: "high", effect: "Increased bleeding risk" },
      { drug: "lithium", severity: "moderate", effect: "Increased lithium levels" },
    ],
    contraindicated: ["alcohol"],
  },
  
  // Cardiovascular
  "amlodipine": {
    interactions: [
      { drug: "simvastatin", severity: "moderate", effect: "Increased statin levels" },
    ],
    contraindicated: [],
  },
  "lisinopril": {
    interactions: [
      { drug: "potassium", severity: "moderate", effect: "Hyperkalemia risk" },
      { drug: "spironolactone", severity: "high", effect: "Hyperkalemia risk" },
      { drug: "ibuprofen", severity: "moderate", effect: "Reduced antihypertensive effect" },
    ],
    contraindicated: [],
  },
  "metoprolol": {
    interactions: [
      { drug: "fluoxetine", severity: "moderate", effect: "Increased metoprolol levels" },
      { drug: "verapamil", severity: "high", effect: "Bradycardia risk" },
    ],
    contraindicated: [],
  },
  "warfarin": {
    interactions: [
      { drug: "aspirin", severity: "high", effect: "Increased bleeding risk" },
      { drug: "ibuprofen", severity: "high", effect: "Increased bleeding risk" },
      { drug: "amoxicillin", severity: "moderate", effect: "Increased anticoagulant effect" },
      { drug: "azithromycin", severity: "moderate", effect: "Increased bleeding risk" },
      { drug: "ciprofloxacin", severity: "high", effect: "Increased bleeding risk" },
      { drug: "metronidazole", severity: "high", effect: "Increased bleeding risk" },
      { drug: "vitamin k", severity: "moderate", effect: "Reduced warfarin effect" },
    ],
    contraindicated: [],
  },
  "digoxin": {
    interactions: [
      { drug: "azithromycin", severity: "moderate", effect: "Increased digoxin levels" },
      { drug: "verapamil", severity: "moderate", effect: "Increased digoxin levels" },
      { drug: "amiodarone", severity: "high", effect: "Toxic digoxin levels" },
    ],
    contraindicated: [],
  },
  
  // Diabetes
  "metformin": {
    interactions: [
      { drug: "alcohol", severity: "moderate", effect: "Lactic acidosis risk" },
      { drug: "contrast dye", severity: "high", effect: "Lactic acidosis risk" },
    ],
    contraindicated: ["alcohol"],
  },
  "glipizide": {
    interactions: [
      { drug: "aspirin", severity: "low", effect: "Enhanced hypoglycemic effect" },
      { drug: "alcohol", severity: "moderate", effect: "Hypoglycemia risk" },
    ],
    contraindicated: [],
  },
  
  // Mental Health
  "fluoxetine": {
    interactions: [
      { drug: "tramadol", severity: "high", effect: "Serotonin syndrome risk" },
      { drug: "metoprolol", severity: "moderate", effect: "Increased metoprolol levels" },
      { drug: "maois", severity: "contraindicated", effect: "Serotonin syndrome" },
    ],
    contraindicated: ["maois", "phenelzine", "tranylcypromine"],
  },
  "sertraline": {
    interactions: [
      { drug: "tramadol", severity: "high", effect: "Serotonin syndrome risk" },
      { drug: "maois", severity: "contraindicated", effect: "Serotonin syndrome" },
    ],
    contraindicated: ["maois"],
  },
  "tramadol": {
    interactions: [
      { drug: "fluoxetine", severity: "high", effect: "Serotonin syndrome risk" },
      { drug: "sertraline", severity: "high", effect: "Serotonin syndrome risk" },
      { drug: "alcohol", severity: "high", effect: "CNS depression" },
    ],
    contraindicated: [],
  },
  
  // Others
  "prednisone": {
    interactions: [
      { drug: "ibuprofen", severity: "moderate", effect: "Increased GI bleeding risk" },
      { drug: "aspirin", severity: "moderate", effect: "Reduced aspirin effectiveness" },
    ],
    contraindicated: [],
  },
  "levothyroxine": {
    interactions: [
      { drug: "calcium", severity: "moderate", effect: "Reduced absorption" },
      { drug: "iron", severity: "moderate", effect: "Reduced absorption" },
      { drug: "antacids", severity: "moderate", effect: "Reduced absorption" },
    ],
    contraindicated: [],
  },
}

// Medicine suggestions based on common diagnoses
export const diagnosisMedicines = {
  "common cold": [
    { name: "Paracetamol 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "5 days" },
    { name: "Cetirizine 10mg", dosage: "10mg", frequency: "Once daily", duration: "5 days" },
  ],
  "viral fever": [
    { name: "Paracetamol 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "5 days" },
    { name: "ORS", dosage: "1 packet", frequency: "As needed", duration: "3 days" },
  ],
  "bacterial infection": [
    { name: "Amoxicillin 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "7 days" },
  ],
  "urinary tract infection": [
    { name: "Nitrofurantoin 100mg", dosage: "100mg", frequency: "Twice daily", duration: "7 days" },
    { name: "Phenazopyridine 100mg", dosage: "100mg", frequency: "Thrice daily", duration: "3 days" },
  ],
  "gastroenteritis": [
    { name: "Metronidazole 400mg", dosage: "400mg", frequency: "Thrice daily", duration: "5 days" },
    { name: "ORS", dosage: "1 packet", frequency: "As needed", duration: "3 days" },
    { name: "Domperidone 10mg", dosage: "10mg", frequency: "Thrice daily", duration: "5 days" },
  ],
  "hypertension": [
    { name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
    { name: "Lisinopril 10mg", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
  ],
  "diabetes mellitus type 2": [
    { name: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily", duration: "30 days" },
  ],
  "allergic rhinitis": [
    { name: "Cetirizine 10mg", dosage: "10mg", frequency: "Once daily", duration: "14 days" },
    { name: "Montelukast 10mg", dosage: "10mg", frequency: "Once daily", duration: "14 days" },
  ],
  "migraine": [
    { name: "Sumatriptan 50mg", dosage: "50mg", frequency: "As needed", duration: "PRN" },
    { name: "Paracetamol 500mg", dosage: "500mg", frequency: "As needed", duration: "PRN" },
  ],
  "asthma": [
    { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed", duration: "30 days" },
    { name: "Budesonide Inhaler", dosage: "200mcg", frequency: "Twice daily", duration: "30 days" },
  ],
  "gerd": [
    { name: "Omeprazole 20mg", dosage: "20mg", frequency: "Once daily", duration: "14 days" },
    { name: "Domperidone 10mg", dosage: "10mg", frequency: "Thrice daily", duration: "14 days" },
  ],
  "diarrhea": [
    { name: "Loperamide 2mg", dosage: "2mg", frequency: "As needed", duration: "2 days" },
    { name: "ORS", dosage: "1 packet", frequency: "As needed", duration: "3 days" },
  ],
}

// Check for drug interactions
export function checkDrugInteractions(medicines) {
  const interactions = []
  const medicineNames = medicines
    .map(m => m.name.toLowerCase().trim())
    .filter(name => name)
  
  for (let i = 0; i < medicineNames.length; i++) {
    for (let j = i + 1; j < medicineNames.length; j++) {
      const med1 = medicineNames[i]
      const med2 = medicineNames[j]
      
      // Check each medicine in database
      for (const [dbMed, data] of Object.entries(drugInteractions)) {
        if (med1.includes(dbMed) || dbMed.includes(med1)) {
          for (const interaction of data.interactions) {
            if (med2.includes(interaction.drug) || interaction.drug.includes(med2)) {
              interactions.push({
                drug1: med1,
                drug2: med2,
                severity: interaction.severity,
                effect: interaction.effect,
              })
            }
          }
        }
      }
    }
  }
  
  return interactions
}

// Get medicine suggestions based on diagnosis
export function getMedicineSuggestions(diagnosis) {
  if (!diagnosis) return []
  
  const lowerDiagnosis = diagnosis.toLowerCase()
  
  for (const [key, medicines] of Object.entries(diagnosisMedicines)) {
    if (lowerDiagnosis.includes(key)) {
      return medicines
    }
  }
  
  return []
}

// Severity color mapping
export const severityColors = {
  mild: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  moderate: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  severe: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
}
