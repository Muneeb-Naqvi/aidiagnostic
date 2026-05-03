// PDF Generation Utility for Prescriptions
// Uses jsPDF for generating professional prescription PDFs

import jsPDF from "jspdf"

export function generatePrescriptionPDF(prescriptionData) {
  const doc = new jsPDF()
  
  const {
    doctor = {},
    patient = {},
    prescription = {},
    clinicLogo = null,
  } = prescriptionData

  // Colors
  const primaryColor = [56, 117, 253] // #3875FD
  const darkColor = [2, 3, 51] // #020331
  const lightColor = [128, 160, 181] // #80A0B5

  let yPos = 20
  const leftMargin = 20
  const pageWidth = 210 // A4 width in mm

  // Clinic Logo
  if (clinicLogo) {
    try {
      doc.addImage(clinicLogo, "PNG", leftMargin, yPos, 25, 25)
    } catch (e) {
      console.log("Could not add logo")
    }
  }

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, "F")
  
  // Doctor Name & Clinic
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(doctor.name || "Dr. Name", leftMargin + (clinicLogo ? 30 : 0), yPos + 8)
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  if (doctor.specialization) {
    doc.text(doctor.specialization, leftMargin + (clinicLogo ? 30 : 0), yPos + 16)
  }
  if (doctor.clinicName) {
    doc.text(doctor.clinicName, leftMargin + (clinicLogo ? 30 : 0), yPos + 22)
  }
  
  // Registration Number
  doc.setFontSize(9)
  if (doctor.registrationNumber) {
    doc.text(`Reg. No: ${doctor.registrationNumber}`, pageWidth - leftMargin - 40, yPos + 8, { align: "right" })
  }
  if (doctor.licenseNumber) {
    doc.text(`License: ${doctor.licenseNumber}`, pageWidth - leftMargin - 40, yPos + 14, { align: "right" })
  }

  // Contact Info
  doc.setFontSize(8)
  let contactY = yPos + 28
  if (doctor.address) {
    doc.text(doctor.address, leftMargin + (clinicLogo ? 30 : 0), contactY)
  }
  if (doctor.phone) {
    doc.text(`Ph: ${doctor.phone}`, pageWidth - leftMargin - 40, contactY, { align: "right" })
  }

  yPos = 50

  // Patient Info Section
  doc.setFillColor(240, 245, 250)
  doc.rect(leftMargin, yPos, pageWidth - 40, 30, "F")
  
  doc.setTextColor(...darkColor)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("PATIENT INFORMATION", leftMargin + 5, yPos + 8)
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  
  const patientInfoX = leftMargin + 5
  const patientInfoY = yPos + 16
  
  doc.text(`Name: ${patient.name || "N/A"}`, patientInfoX, patientInfoY)
  doc.text(`Age: ${patient.age || "N/A"} years`, patientInfoX + 50, patientInfoY)
  doc.text(`Gender: ${patient.gender || "N/A"}`, patientInfoX + 100, patientInfoY)
  doc.text(`Date: ${prescription.date || new Date().toLocaleDateString()}`, leftMargin + 5, patientInfoY + 6)
  
  if (patient.weight) {
    doc.text(`Weight: ${patient.weight} kg`, patientInfoX + 50, patientInfoY + 6)
  }
  if (patient.bloodGroup) {
    doc.text(`Blood Group: ${patient.bloodGroup}`, patientInfoX + 100, patientInfoY + 6)
  }

  yPos += 40

  // Diagnosis Section
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DIAGNOSIS", leftMargin, yPos)
  
  doc.setDrawColor(...lightColor)
  doc.line(leftMargin, yPos + 3, pageWidth - leftMargin, yPos + 3)
  
  yPos += 10
  
  doc.setTextColor(...darkColor)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  
  // Severity badge
  if (prescription.severity) {
    const severityColors = {
      mild: [40, 167, 69],
      moderate: [255, 193, 7],
      severe: [220, 53, 69],
    }
    const sevColor = severityColors[prescription.severity] || [128, 128, 128]
    doc.setFillColor(...sevColor)
    doc.roundedRect(leftMargin, yPos - 4, 25, 8, 1, 1, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text(prescription.severity.toUpperCase(), leftMargin + 3, yPos + 1)
    doc.setTextColor(...darkColor)
    doc.setFontSize(12)
  }
  
  doc.text(prescription.diagnosis || "No diagnosis recorded", leftMargin + 30, yPos)
  
  yPos += 15

  // Medicines Section
  doc.setTextColor(...primaryColor)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("PRESCRIBED MEDICINES", leftMargin, yPos)
  
  doc.line(leftMargin, yPos + 3, pageWidth - leftMargin, yPos + 3)
  
  yPos += 10
  
  if (prescription.medicines && prescription.medicines.length > 0) {
    prescription.medicines.forEach((med, index) => {
      if (med.name) {
        doc.setTextColor(...darkColor)
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(`${index + 1}. ${med.name}`, leftMargin, yPos)
        
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(...lightColor)
        
        const medDetails = [
          med.dosage,
          med.frequency,
          med.duration
        ].filter(Boolean).join(" | ")
        
        if (medDetails) {
          doc.text(medDetails, leftMargin + 60, yPos)
        }
        
        yPos += 8
      }
    })
  } else {
    doc.setTextColor(...lightColor)
    doc.setFontSize(10)
    doc.text("No medicines prescribed", leftMargin, yPos)
    yPos += 8
  }

  yPos += 10

  // Lab Tests Section
  if (prescription.labTests && prescription.labTests.length > 0) {
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("INVESTIGATIONS / LAB TESTS", leftMargin, yPos)
    
    doc.line(leftMargin, yPos + 3, pageWidth - leftMargin, yPos + 3)
    
    yPos += 10
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(11)
    
    prescription.labTests.forEach((test, index) => {
      if (test) {
        doc.text(`• ${test}`, leftMargin + 5, yPos)
        yPos += 7
      }
    })
    
    yPos += 10
  }

  // Advice Section
  if (prescription.advice) {
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ADVICE", leftMargin, yPos)
    
    doc.line(leftMargin, yPos + 3, pageWidth - leftMargin, yPos + 3)
    
    yPos += 10
    
    doc.setTextColor(...darkColor)
    doc.setFontSize(11)
    
    const splitAdvice = doc.splitTextToSize(prescription.advice, pageWidth - 40)
    doc.text(splitAdvice, leftMargin, yPos)
    
    yPos += splitAdvice.length * 6 + 10
  }

  // Follow-up Section
  if (prescription.followUpDate) {
    doc.setTextColor(...primaryColor)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Follow-up: ${prescription.followUpDate}`, leftMargin, yPos)
    
    yPos += 10
  }

  // Notes Section
  if (prescription.notes) {
    doc.setTextColor(...lightColor)
    doc.setFontSize(10)
    const splitNotes = doc.splitTextToSize(`Note: ${prescription.notes}`, pageWidth - 40)
    doc.text(splitNotes, leftMargin, yPos)
    
    yPos += splitNotes.length * 5 + 10
  }

  // Footer - Signature
  yPos = 260
  
  doc.setDrawColor(...lightColor)
  doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos)
  
  yPos += 10
  
  // Digital Signature
  if (doctor.signature) {
    try {
      doc.addImage(doctor.signature, "PNG", leftMargin, yPos - 5, 40, 15)
    } catch (e) {
      // Draw placeholder signature
      doc.setTextColor(...darkColor)
      doc.setFontSize(14)
      doc.setFont("helvetica", "italic")
      doc.text(doctor.name || "Doctor", leftMargin, yPos + 5)
    }
  } else {
    doc.setTextColor(...darkColor)
    doc.setFontSize(14)
    doc.setFont("helvetica", "italic")
    doc.text(doctor.name || "Doctor", leftMargin, yPos + 5)
  }
  
  doc.setFontSize(9)
  doc.setTextColor(...lightColor)
  doc.text("Signature", leftMargin, yPos + 12)
  
  // Prescription ID
  doc.setFontSize(8)
  doc.text(`Rx ID: ${prescription.prescriptionId || "N/A"}`, pageWidth - leftMargin - 40, yPos)
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...lightColor)
  doc.text("Generated by Hospital Management System", leftMargin, 285)
  doc.text(`Printed: ${new Date().toLocaleString()}`, pageWidth - leftMargin - 50, 285)

  return doc
}

export function downloadPrescriptionPDF(prescriptionData, filename) {
  const doc = generatePrescriptionPDF(prescriptionData)
  doc.save(filename || `prescription-${Date.now()}.pdf`)
}

export function getPDFBlob(prescriptionData) {
  const doc = generatePrescriptionPDF(prescriptionData)
  return doc.output("blob")
}
