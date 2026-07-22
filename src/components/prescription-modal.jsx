"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Plus, Trash2, Printer, Brain, Save, Loader2, CheckCircle, 
  Upload, FileText, Calendar, AlertTriangle, ChevronDown, ChevronUp,
  Send, Mail, MessageSquare, Bell, Lightbulb, Sparkles, Eye, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import Swal from 'sweetalert2'
import { 
  checkDrugInteractions, 
  getMedicineSuggestions, 
  severityColors 
} from "@/utils/drug-interactions"
import { generateAIDiagnosis, getFallbackDiagnosis } from "@/utils/ai-diagnosis"
import { downloadPrescriptionPDF } from "@/utils/pdf-generator"

export function PrescriptionModal({
  isOpen,
  onClose,
  patientName,
  patientId,
  patientData,
  doctorId,
  doctorName,
  doctorData,
  appointmentId,
  onSuccess,
}) {
  // State for all prescription data
  const [prescription, setPrescription] = useState({
    date: "",
    // Patient Details
    patientAge: patientData?.age || "",
    patientGender: patientData?.gender || "",
    patientWeight: patientData?.weight || "",
    patientBloodGroup: patientData?.bloodGroup || "",
    // Diagnosis
    diagnosis: "",
    severity: "moderate",
    symptoms: [],
    // Medicines
    medicines: [{ 
      name: "", 
      dosage: "", 
      frequency: "", 
      duration: "",
      instructions: ""
    }],
    // Lab Tests
    labTests: [""],
    // Additional
    advice: "",
    notes: "",
    followUpDate: "",
    // Attachments
    attachments: [],
    // Notifications
    sendToPatient: true,
    notificationMethods: {
      email: true,
      whatsapp: true,
      inApp: true,
    },
  })

  // UI State
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAIDiagnosis, setShowAIDiagnosis] = useState(false)
  const [aiDiagnosis, setAIDiagnosis] = useState(null)
  const [drugInteractions, setDrugInteractions] = useState([])
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    patientInfo: true,
    diagnosis: true,
    medicines: true,
    labTests: false,
    advice: false,
  })

  // Local patient data fetched directly when needed
  const [localPatient, setLocalPatient] = useState(null)

  // Doctor data from props or localStorage
  const doctor = doctorData || {}

  // Combined patient data from parent prop or local fetch
  const resolvedPatient = patientData || localPatient
  
  // Blood group options
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // Comprehensive medicine database with alphabetical organization
  const medicinesList = [
    // A
    { name: "Acetaminophen 500mg", category: "Pain" }, { name: "Acetylcysteine 200mg", category: "Mucolytic" }, 
    { name: "Acyclovir 400mg", category: "Antiviral" }, { name: "Albendazole 400mg", category: "Anthelmintic" },
    { name: "Albuterol Inhaler", category: "Bronchodilator" }, { name: "Allopurinol 100mg", category: "Antigout" },
    { name: "Amlodipine 5mg", category: "Antihypertensive" }, { name: "Amoxicillin 500mg", category: "Antibiotic" },
    { name: "Aspirin 75mg", category: "Antiplatelet" }, { name: "Atorvastatin 10mg", category: "Statin" },
    { name: "Azithromycin 250mg", category: "Antibiotic" },
    // B
    { name: "Baclofen 10mg", category: "Muscle Relaxant" }, { name: "Bisoprolol 5mg", category: "Beta Blocker" },
    { name: "Budesonide Inhaler", category: "Corticosteroid" },
    // C
    { name: "Calcium Carbonate 500mg", category: "Supplement" }, { name: "Captopril 25mg", category: "ACE Inhibitor" },
    { name: "Cetirizine 10mg", category: "Antihistamine" }, { name: "Ciprofloxacin 500mg", category: "Antibiotic" },
    { name: "Clindamycin 150mg", category: "Antibiotic" }, { name: "Clopidogrel 75mg", category: "Antiplatelet" },
    // D
    { name: "Dexamethasone 0.5mg", category: "Corticosteroid" }, { name: "Diazepam 5mg", category: "Benzodiazepine" },
    { name: "Diclofenac 50mg", category: "NSAID" }, { name: "Digoxin 0.25mg", category: "Cardiac Glycoside" },
    { name: "Domperidone 10mg", category: "Prokinetic" }, { name: "Doxycycline 100mg", category: "Antibiotic" },
    // E
    { name: "Erythromycin 250mg", category: "Antibiotic" }, { name: "Esomeprazole 20mg", category: "PPI" },
    // F
    { name: "Famotidine 20mg", category: "H2 Blocker" }, { name: "Fluconazole 150mg", category: "Antifungal" },
    { name: "Fluoxetine 20mg", category: "SSRI" }, { name: "Folic Acid 5mg", category: "Supplement" },
    // G
    { name: "Gabapentin 300mg", category: "Anticonvulsant" }, { name: "Glimepiride 1mg", category: "Antidiabetic" },
    { name: "Glipizide 5mg", category: "Antidiabetic" }, { name: "Glyburide 5mg", category: "Antidiabetic" },
    // H
    { name: "Hydrochlorothiazide 25mg", category: "Diuretic" }, { name: "Hydrocortisone 10mg", category: "Corticosteroid" },
    // I
    { name: "Ibuprofen 400mg", category: "NSAID" }, { name: "Iron Supplement", category: "Supplement" },
    // L
    { name: "Lansoprazole 30mg", category: "PPI" }, { name: "Levocetirizine 5mg", category: "Antihistamine" },
    { name: "Levofloxacin 500mg", category: "Antibiotic" }, { name: "Levothyroxine 50mg", category: "Thyroid" },
    { name: "Lisinopril 10mg", category: "ACE Inhibitor" }, { name: "Loperamide 2mg", category: "Antidiarrheal" },
    { name: "Loratadine 10mg", category: "Antihistamine" }, { name: "Losartan 50mg", category: "ARB" },
    // M
    { name: "Metformin 500mg", category: "Antidiabetic" }, { name: "Methotrexate 10mg", category: "DMARD" },
    { name: "Metronidazole 400mg", category: "Antibiotic" }, { name: "Montelukast 10mg", category: "Leukotriene Antagonist" },
    // N
    { name: "Naproxen 250mg", category: "NSAID" }, { name: "Nifedipine 10mg", category: "Calcium Channel Blocker" },
    { name: "Nitrofurantoin 100mg", category: "Antibiotic" },
    // O
    { name: "Omeprazole 20mg", category: "PPI" }, { name: "Ondansetron 4mg", category: "Antiemetic" },
    // P
    { name: "Pantoprazole 40mg", category: "PPI" }, { name: "Paracetamol 500mg", category: "Analgesic" },
    { name: "Phenazopyridine 100mg", category: "Urinary Analgesic" }, { name: "Prednisone 10mg", category: "Corticosteroid" },
    { name: "Propranolol 40mg", category: "Beta Blocker" },
    // R
    { name: "Rabeprazole 20mg", category: "PPI" }, { name: "Ramipril 5mg", category: "ACE Inhibitor" },
    { name: "Ranitidine 150mg", category: "H2 Blocker" }, { name: "Risperidone 2mg", category: "Antipsychotic" },
    { name: "Rosuvastatin 10mg", category: "Statin" },
    // S
    { name: "Salbutamol Inhaler", category: "Bronchodilator" }, { name: "Sertraline 50mg", category: "SSRI" },
    { name: "Simvastatin 20mg", category: "Statin" }, { name: "Spironolactone 25mg", category: "Diuretic" },
    // T
    { name: "Tamsulosin 0.4mg", category: "Alpha Blocker" }, { name: "Terbinafine 250mg", category: "Antifungal" },
    { name: "Theophylline 200mg", category: "Bronchodilator" }, { name: "Tramadol 50mg", category: "Analgesic" },
    // V
    { name: "Valproic Acid 200mg", category: "Anticonvulsant" }, { name: "Verapamil 40mg", category: "Calcium Channel Blocker" },
    { name: "Vitamin B Complex", category: "Supplement" }, { name: "Vitamin D 1000 IU", category: "Supplement" },
    // W
    { name: "Warfarin 5mg", category: "Anticoagulant" },
    // Z
    { name: "Zinc Sulfate 20mg", category: "Supplement" }, { name: "Zopiclone 7.5mg", category: "Hypnotic" },
  ].sort((a, b) => a.name.localeCompare(b.name))

  const [medicineSearchTerm, setMedicineSearchTerm] = useState("")
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null)

  const filteredMedicines = medicinesList.filter(med =>
    med.name.toLowerCase().includes(medicineSearchTerm.toLowerCase())
  )
  
  // Common lab tests
  const commonLabTests = [
    "CBC", "LFT", "RFT", "Lipid Profile", "Thyroid Profile", 
    "HbA1c", "Urine Routine", "ECG", "Chest X-Ray", "Ultrasound"
  ]

  // Severity options
  const severityLevels = [
    { value: "mild", label: "Mild", color: "bg-green-500" },
    { value: "moderate", label: "Moderate", color: "bg-yellow-500" },
    { value: "severe", label: "Severe", color: "bg-red-500" },
  ]

  // Medicine frequency options
  const frequencyOptions = [
    "Once daily", "Twice daily", "Thrice daily", "Four times daily",
    "Every 6 hours", "Every 8 hours", "Every 12 hours", "As needed", "Before meal", "After meal"
  ]

   // Fetch full patient details using patientId if not already provided via patientData
   useEffect(() => {
     if (!patientId) return

     // If parent already provided patientData, skip fetching
     if (patientData) return

     const controller = new AbortController()
     const fetchPatient = async () => {
       try {
         const res = await fetch(`/api/patients/${patientId}`, { signal: controller.signal })
         const data = await res.json()
         if (data.success) {
           setLocalPatient(data.data)
         } else {
           console.error("Failed to fetch patient details:", data.error)
         }
       } catch (err) {
         if (err.name !== 'AbortError') console.error("Error fetching patient:", err)
       }
     }
     fetchPatient()
     return () => controller.abort()
   }, [patientId, patientData])

   // Populate prescription fields when patient data is available
   useEffect(() => {
     if (!resolvedPatient) return

     const calculateAge = (dob) => {
       if (!dob) return ""
       const birthDate = new Date(dob)
       const today = new Date()
       let age = today.getFullYear() - birthDate.getFullYear()
       const monthDiff = today.getMonth() - birthDate.getMonth()
       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
         age--
       }
       return age.toString()
     }

     setPrescription(prev => ({
       ...prev,
       date: new Date().toISOString().split("T")[0],
       patientAge: resolvedPatient.age || resolvedPatient.patientAge || calculateAge(resolvedPatient.dateOfBirth) || "",
       patientGender: resolvedPatient.gender || resolvedPatient.patientGender || "",
       patientWeight: resolvedPatient.weight || "",
       patientBloodGroup: resolvedPatient.bloodGroup || "",
     }))
   }, [resolvedPatient])

  // Check for drug interactions when medicines change
  useEffect(() => {
    const interactions = checkDrugInteractions(prescription.medicines)
    setDrugInteractions(interactions)
  }, [prescription.medicines])

  // Get AI suggestions when diagnosis changes
  useEffect(() => {
    if (prescription.diagnosis) {
      const suggestions = getMedicineSuggestions(prescription.diagnosis)
      if (suggestions.length > 0) {
        setShowMedicineSuggestions(true)
      }
    }
  }, [prescription.diagnosis])

  // Handlers
  const handleAddMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { 
        name: "", 
        dosage: "", 
        frequency: "", 
        duration: "",
        instructions: ""
      }],
    })
  }

  const handleRemoveMedicine = (index) => {
    if (prescription.medicines.length > 1) {
      setPrescription({
        ...prescription,
        medicines: prescription.medicines.filter((_, i) => i !== index),
      })
    }
  }

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescription.medicines]
    updatedMedicines[index][field] = value
    setPrescription({ ...prescription, medicines: updatedMedicines })
  }

  const handleAddLabTest = () => {
    setPrescription({
      ...prescription,
      labTests: [...prescription.labTests, ""],
    })
  }

  const handleRemoveLabTest = (index) => {
    if (prescription.labTests.length > 1) {
      setPrescription({
        ...prescription,
        labTests: prescription.labTests.filter((_, i) => i !== index),
      })
    }
  }

  const handleLabTestChange = (index, value) => {
    const updatedTests = [...prescription.labTests]
    updatedTests[index] = value
    setPrescription({ ...prescription, labTests: updatedTests })
  }

  const handleApplyMedicineSuggestions = (suggestions) => {
    const newMedicines = suggestions.map(sugg => ({
      name: sugg.name,
      dosage: sugg.dosage,
      frequency: sugg.frequency,
      duration: sugg.duration,
      instructions: sugg.reason || ""
    }))
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines.filter(m => m.name), ...newMedicines]
    }))
    setShowMedicineSuggestions(false)
    toast.success("Medicine suggestions applied!")
  }

  const handleGenerateAIDiagnosis = async () => {
    setAiLoading(true)
    try {
      const patientInfo = {
        name: patientName,
        age: prescription.patientAge,
        gender: prescription.patientGender,
        weight: prescription.patientWeight,
        bloodGroup: prescription.patientBloodGroup,
        allergies: resolvedPatient?.allergies || [],
        medicalHistory: resolvedPatient?.medicalHistory || [],
        currentMedications: resolvedPatient?.currentMedications || [],
      }

      const result = await generateAIDiagnosis(
        patientInfo, 
        prescription.symptoms,
        []
      )
      
      setAIDiagnosis(result)
      setShowAIDiagnosis(true)
      
      // Apply AI diagnosis
      if (result.primaryDiagnosis) {
        setPrescription(prev => ({
          ...prev,
          diagnosis: result.primaryDiagnosis,
          severity: result.severity || "moderate",
        }))
      }
      
      if (result.recommendedMedicines?.length > 0) {
        handleApplyMedicineSuggestions(result.recommendedMedicines)
      }
      
      if (result.recommendedTests?.length > 0) {
        setPrescription(prev => ({
          ...prev,
          labTests: [...prev.labTests.filter(t => t), ...result.recommendedTests]
        }))
      }
      
      if (result.lifestyleAdvice?.length > 0) {
        setPrescription(prev => ({
          ...prev,
          advice: prev.advice + (prev.advice ? "\n" : "") + result.lifestyleAdvice.join(". ")
        }))
      }
      
      if (result.followUpDays) {
        const followUpDate = new Date()
        followUpDate.setDate(followUpDate.getDate() + result.followUpDays)
        setPrescription(prev => ({
          ...prev,
          followUpDate: followUpDate.toISOString().split("T")[0]
        }))
      }
      
      toast.success("AI diagnosis generated successfully!")
    } catch (error) {
      console.error("AI Diagnosis error:", error)
      // Use fallback
      const fallback = getFallbackDiagnosis(prescription.symptoms.join(", ") || prescription.diagnosis)
      setAIDiagnosis(fallback)
      setShowAIDiagnosis(true)
      setPrescription(prev => ({
        ...prev,
        diagnosis: fallback.primaryDiagnosis,
        severity: fallback.severity,
      }))
      toast.warning("Using offline diagnosis suggestions")
    } finally {
      setAiLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }))
    setPrescription(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }))
    setFileInputKey(prev => prev + 1)
  }

  const handleRemoveAttachment = (index) => {
    setPrescription(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePrint = () => {
    const pdfData = {
      doctor: {
        name: doctorName || doctor?.name,
        specialization: doctor?.specialization,
        clinicName: doctor?.clinicName,
        clinicAddress: doctor?.clinicAddress,
        clinicPhone: doctor?.clinicPhone,
        registrationNumber: doctor?.registrationNumber,
        licenseNumber: doctor?.licenseNumber,
        digitalSignature: doctor?.digitalSignature,
      },
      patient: {
        name: patientName,
        age: prescription.patientAge,
        gender: prescription.patientGender,
        weight: prescription.patientWeight,
        bloodGroup: prescription.patientBloodGroup,
      },
      prescription: {
        date: prescription.date,
        diagnosis: prescription.diagnosis,
        severity: prescription.severity,
        medicines: prescription.medicines.filter(m => m.name),
        labTests: prescription.labTests.filter(t => t),
        advice: prescription.advice,
        notes: prescription.notes,
        followUpDate: prescription.followUpDate,
      }
    }
    downloadPrescriptionPDF(pdfData, `prescription-${patientName}-${prescription.date}.pdf`)
  }

  const handleSave = async () => {
    const validMedicines = prescription.medicines.filter((m) => m.name.trim())
    if (validMedicines.length === 0) {
      toast.error("Please add at least one medicine")
      return
    }
    if (!prescription.diagnosis.trim()) {
      toast.error("Please enter a diagnosis")
      return
    }

    // Show warning for severe drug interactions
    const severeInteractions = drugInteractions.filter(i => i.severity === "high" || i.severity === "contraindicated")
    if (severeInteractions.length > 0) {
      const result = await Swal.fire({
        icon: 'warning',
        title: `⚠️ ${severeInteractions.length} Severe Drug Interaction(s) Detected!`,
        html: `<ul class="text-left">${severeInteractions.map(i => `<li><strong>${i.drug1} + ${i.drug2}</strong>: ${i.effect}</li>`).join('')}</ul><br>Do you want to proceed anyway?`,
        showCancelButton: true,
        confirmButtonColor: '#F59E0B',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Proceed Anyway',
        cancelButtonText: 'Cancel',
        width: 600
      })
      if (!result.isConfirmed) return
    }

    setSaving(true)
    try {
      const doctorIdToUse = doctorId || localStorage.getItem("doctorId")
      if (!doctorIdToUse) {
        throw new Error("Doctor ID is missing. Please log in again.")
      }
      if (!patientId) {
        throw new Error("Patient ID is missing. Please select a patient.")
      }
      console.log("[PrescriptionModal] Saving prescription...", {
        doctorId: doctorIdToUse,
        doctorName,
        patientId,
        patientName,
        diagnosis: prescription.diagnosis,
        medicines: validMedicines,
      })

       console.log("[PrescriptionModal] Sending data:", {
         doctorId: doctorIdToUse,
         patientId,
         medicinesCount: validMedicines.length
       })
       
       const res = await fetch("/api/prescriptions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: doctorIdToUse,
            doctorName: doctorName || doctor?.name || "Doctor",
            doctorSpecialization: doctor?.specialization || "",
            clinicName: doctor?.clinicName || "",
            clinicAddress: doctor?.clinicAddress || "",
            clinicPhone: doctor?.clinicPhone || "",
            registrationNumber: doctor?.registrationNumber || "",
            digitalSignature: doctor?.digitalSignature || null,
            patientId,
            patientName: patientName || "Patient",
            patientAge: prescription.patientAge,
            patientGender: prescription.patientGender,
            patientWeight: prescription.patientWeight,
            patientBloodGroup: prescription.patientBloodGroup,
            appointmentId: appointmentId || null,
            medicines: validMedicines,
            diagnosis: prescription.diagnosis,
            severity: prescription.severity,
            labTests: prescription.labTests.filter(t => t.trim()),
            advice: prescription.advice,
            notes: prescription.notes,
            followUpDate: prescription.followUpDate || null,
            attachments: prescription.attachments || [],
            sendToPatient: prescription.sendToPatient,
            notificationMethods: prescription.notificationMethods || { email: true, inApp: true, whatsapp: true },
            issuedDate: prescription.date,
          }),
       })
       
       console.log("[PrescriptionModal] Response status:", res.status)
       
       if (!res.ok) {
         const errorText = await res.text()
         console.error("[PrescriptionModal] Server error:", errorText)
         throw new Error(`Server error: ${res.status}`)
       }
       
       const data = await res.json()
       console.log("[PrescriptionModal] Response:", data)

       if (!data.success) throw new Error(data.error || "Failed to save prescription")

      setSaved(true)
      toast.success("Prescription saved successfully!")
      onSuccess?.(data.data)
      
      // Reset form state completely
      setPrescription({
        date: new Date().toISOString().split("T")[0],
        patientAge: "",
        patientGender: "",
        patientWeight: "",
        patientBloodGroup: "",
        diagnosis: "",
        severity: "moderate",
        symptoms: [],
        medicines: [{ 
          name: "", 
          dosage: "", 
          frequency: "", 
          duration: "",
          instructions: ""
        }],
        labTests: [""],
        advice: "",
        notes: "",
        followUpDate: "",
        attachments: [],
        sendToPatient: true,
        notificationMethods: {
          email: true,
          whatsapp: true,
          inApp: true,
        },
      })
      
      setTimeout(() => {
        setSaved(false)
        setDrugInteractions([])
        setAiDiagnosis(null)
        setShowAIDiagnosis(false)
        setShowMedicineSuggestions(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error("Prescription save error:", err)
      toast.error(err.message || "Failed to save prescription")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020331]/70 p-4"
    >
<motion.div
  initial={{ scale: 0.95, y: 30 }}
  animate={{ scale: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="w-full max-w-4xl max-h-[95vh] md:max-h-[95vh] overflow-y-auto rounded-2xl bg-[#FFFDFD] shadow-2xl m-2 md:m-0"
>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#80A0B5]/40 bg-[#FFFDFD] px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3875FD] flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#020331]">Digital Prescription</h2>
              <p className="text-sm text-black">Patient: {patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateAIDiagnosis}
              disabled={aiLoading}
              variant="outline"
              className="flex items-center gap-2 border-[#3875FD] text-[#3875FD] hover:bg-[#3875FD]/10"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {aiLoading ? "Analyzing..." : "AI Diagnosis"}
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#80A0B5]/20 transition-colors"
            >
              <X className="w-6 h-6 text-[#000004]" />
            </button>
          </div>
        </div>


        {/* Drug Interactions Warning */}
        <AnimatePresence>
          {drugInteractions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-red-200 bg-red-50"
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-red-800">Drug Interactions Detected</h3>
                </div>
                <div className="space-y-1">
                  {drugInteractions.map((interaction, index) => (
                    <p key={index} className={`text-sm ${
                      interaction.severity === "high" || interaction.severity === "contraindicated"
                        ? "text-red-700 font-semibold"
                        : "text-yellow-700"
                    }`}>
                      {interaction.drug1} + {interaction.drug2}: {interaction.effect}
                      <Badge className={`ml-2 ${
                        interaction.severity === "contraindicated" ? "bg-red-600" :
                        interaction.severity === "high" ? "bg-red-500" : "bg-yellow-500"
                      }`}>
                        {interaction.severity.toUpperCase()}
                      </Badge>
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
           <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Tabs defaultValue="prescription" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prescription">Prescription</TabsTrigger>
              <TabsTrigger value="patient">Patient Info</TabsTrigger>
              <TabsTrigger value="tests">Lab Tests</TabsTrigger>
            </TabsList>

            {/* Prescription Tab */}
            <TabsContent value="prescription" className="space-y-6 mt-6">
              {/* Date & Severity */}
              <Card className="border border-[#3875FD]/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#000004] font-semibold">Prescription Date *</Label>
                      <input
                        type="date"
                        value={prescription.date}
                        onChange={(e) => setPrescription({ ...prescription, date: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2 text-[#000004]"
                      />
                    </div>
                    <div>
                      <Label className="text-[#000004] font-semibold">Severity Level</Label>
                      <Select 
                        value={prescription.severity}
                        onValueChange={(value) => setPrescription({ ...prescription, severity: value })}
                      >
                        <SelectTrigger className="mt-2 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {severityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${level.color}`} />
                                {level.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#000004] font-semibold">Follow-up Date</Label>
                      <input
                        type="date"
                        value={prescription.followUpDate}
                        onChange={(e) => setPrescription({ ...prescription, followUpDate: e.target.value })}
                        className="mt-2 w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2 text-[#000004]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis */}
              <Card className="">
                <CardContent className="pt-6">
                  <Label className="text-[#000004] font-semibold mb-2 block">Clinical Diagnosis *</Label>
                  <textarea
                    placeholder="Enter patient diagnosis (e.g., Acute Pharyngitis)..."
                    value={prescription.diagnosis}
                    onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#80A0B5]/40 bg-white px-3 py-2 text-[#000004] text-sm focus:outline-none focus:ring-2 focus:ring-[#3875FD]/30 focus:border-[#3875FD] mb-4 resize-none"
                  />
                  
                  {/* Medicine Suggestions */}
                  {showMedicineSuggestions && prescription.diagnosis && (
                    <div className="mt-4 p-4 bg-[#3875FD]/5 rounded-lg">
                      <h4 className="font-semibold text-[#020331] mb-2">Suggested Medicines for {prescription.diagnosis}</h4>
                      <div className="space-y-2">
                        {getMedicineSuggestions(prescription.diagnosis).map((sugg, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div>
                              <p className="font-medium">{sugg.name}</p>
                              <p className="text-sm text-black">{sugg.dosage} - {sugg.frequency} for {sugg.duration}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleApplyMedicineSuggestions([sugg])}
                              className="bg-[#3875FD] text-white"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medicines */}
              <Card className="border border-[#3875FD]/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#020331]">Prescribed Medicines</CardTitle>
                    <Button
                      onClick={handleAddMedicine}
                      className="flex items-center gap-2 bg-[#3875FD] text-white hover:bg-[#3875FD]/90"
                    >
                      <Plus className="w-4 h-4" />
                      Add Medicine
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescription.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-[#80A0B5]/40 p-4 space-y-3 bg-white"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <Label className="text-xs text-[#000004]">Medicine Name</Label>
                            <div className="relative">
                              <Input
                                placeholder="Search medicine..."
                                value={medicine.name}
                                onChange={(e) => {
                                  handleMedicineChange(index, "name", e.target.value)
                                  setMedicineSearchTerm(e.target.value)
                                  setActiveMedicineIndex(index)
                                  setShowMedicineDropdown(true)
                                }}
                                onFocus={() => {
                                  setActiveMedicineIndex(index)
                                  setShowMedicineDropdown(true)
                                }}
                                onBlur={() => setTimeout(() => setShowMedicineDropdown(false), 200)}
                              />
                              {/* Medicine Dropdown */}
                              {showMedicineDropdown && activeMedicineIndex === index && filteredMedicines.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-[#80A0B5]/40 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {filteredMedicines.slice(0, 10).map((med, i) => (
                                    <div
                                      key={i}
                                      className="px-4 py-2 hover:bg-[#3875FD]/10 cursor-pointer flex items-center justify-between"
                                      onClick={() => {
                                        handleMedicineChange(index, "name", med.name)
                                        setShowMedicineDropdown(false)
                                        setMedicineSearchTerm("")
                                      }}
                                    >
                                      <span className="font-medium text-[#020331]">{med.name}</span>
                                      <span className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                                        {med.category}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-[#000004]">Frequency</Label>
                            <Select
                              value={medicine.frequency}
                              onValueChange={(value) => handleMedicineChange(index, "frequency", value)}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {frequencyOptions.map((freq) => (
                                  <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-[#000004]">Duration</Label>
                            <Input
                              placeholder="e.g. 7 days"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            />
                          </div>
                        </div>

                        {prescription.medicines.length > 1 && (
                          <button
                            onClick={() => handleRemoveMedicine(index)}
                            className="text-red-600 hover:bg-red-500/10 p-2 rounded-lg flex items-center gap-1 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advice */}
              <Card className="border border-[#3875FD]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#020331]">Patient Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    rows={3}
                    placeholder="Advice for the patient..."
                    className="w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2 focus:outline-none focus:border-[#3875FD]"
                    value={prescription.advice}
                    onChange={(e) => setPrescription({ ...prescription, advice: e.target.value })}
                  />
                </CardContent>
              </Card>

              {/* Notes */}
             
            </TabsContent>

            {/* Patient Info Tab */}
            <TabsContent value="patient" className="space-y-6 mt-6">
              <Card className="border border-[#3875FD]/30">
                <CardHeader>
                  <CardTitle className="text-lg text-[#020331]">Patient Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#000004] font-semibold">Patient Name</Label>
                      <p className="text-lg font-bold text-[#020331]">{patientName}</p>
                    </div>
                      <div>
                        <Label className="text-[#000004] font-semibold">Age (years)</Label>
                        <Input
                          type="number"
                          placeholder="Age"
                          value={prescription.patientAge}
                          onChange={(e) => setPrescription({ ...prescription, patientAge: e.target.value })}
                          readOnly={!!(resolvedPatient?.age || resolvedPatient?.patientAge || resolvedPatient?.dateOfBirth)}
                          className={resolvedPatient?.age || resolvedPatient?.patientAge || resolvedPatient?.dateOfBirth ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                      </div>
                     <div>
                       <Label className="text-[#000004] font-semibold">Gender</Label>
                       <Select
                         value={prescription.patientGender}
                         onValueChange={(value) => setPrescription({ ...prescription, patientGender: value })}
                          disabled={!!(resolvedPatient?.gender || resolvedPatient?.patientGender)}
                        >
                          <SelectTrigger className={`bg-white ${resolvedPatient?.gender || resolvedPatient?.patientGender ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                           <SelectValue placeholder="Select gender" />
                         </SelectTrigger>
                         <SelectContent className="bg-white">
                           <SelectItem value="male">Male</SelectItem>
                           <SelectItem value="female">Female</SelectItem>
                           <SelectItem value="other">Other</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                    <div>
                      <Label className="text-[#000004] font-semibold">Weight (kg)</Label>
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={prescription.patientWeight}
                        onChange={(e) => setPrescription({ ...prescription, patientWeight: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-[#000004] font-semibold">Blood Group</Label>
                      <Select
                        value={prescription.patientBloodGroup}
                        onValueChange={(value) => setPrescription({ ...prescription, patientBloodGroup: value })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {bloodGroups.map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Patient Allergies Warning */}
                  {resolvedPatient?.allergies?.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-800">Known Allergies</h4>
                      </div>
                      <p className="mt-1 text-red-700">{resolvedPatient.allergies.join(", ")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Doctor Info Preview */}
              <Card className="border border-[#3875FD]/30">
                <CardHeader>
                  <CardTitle className="text-lg text-[#020331]">Prescribing Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label className="text-black text-sm">Doctor Name</Label>
                       <p className="font-semibold text-[#020331]">{doctorName || doctor?.name || "Dr. Name"}</p>
                     </div>
                     <div>
                       <Label className="text-black text-sm">Specialization</Label>
                       <p className="font-semibold text-[#020331]">{doctor?.specialization || "General Practitioner"}</p>
                     </div>
                     <div className="col-span-2">
                       <Label className="text-black text-sm">Hospital / Clinic</Label>
                       <p className="font-semibold text-[#020331]">
                          {resolvedPatient?.hospitalName || resolvedPatient?.hospital || doctor?.clinicName || "Not specified"}
                       </p>
                     </div>
                     <div>
                       <Label className="text-black text-sm">Reg. Number</Label>
                       <p className="font-semibold text-[#020331]">{doctor?.registrationNumber || doctor?.licenseNumber || "N/A"}</p>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Tests Tab */}
            <TabsContent value="tests" className="space-y-6 mt-6">
              <Card className="border border-[#3875FD]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#020331]">Investigations / Lab Tests</CardTitle>
                    <Button
                      onClick={handleAddLabTest}
                      className="flex items-center gap-2 bg-[#3875FD] text-white hover:bg-[#3875FD]/90"
                    >
                      <Plus className="w-4 h-4" />
                      Add Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quick Add Common Tests */}
                  <div className="mb-4">
                    <Label className="text-sm text-black">Quick Add Common Tests:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonLabTests.map((test) => (
                        <Badge
                          key={test}
                          variant="outline"
                          className="cursor-pointer hover:bg-[#3875FD]/10"
                          onClick={() => {
                            if (!prescription.labTests.includes(test)) {
                              setPrescription(prev => ({
                                ...prev,
                                labTests: [...prev.labTests.filter(t => t), test]
                              }))
                            }
                          }}
                        >
                          + {test}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prescription.labTests.map((test, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          placeholder="Enter test name"
                          value={test}
                          onChange={(e) => handleLabTestChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {prescription.labTests.length > 1 && (
                          <button
                            onClick={() => handleRemoveLabTest(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-6 mt-6">
              
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 border-t border-[#80A0B5]/40 pt-6">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2 border-[#80A0B5]/40 text-[#020331]"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 flex items-center justify-center gap-2 bg-[#3875FD] text-white hover:bg-[#2c5cd8] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save & Send to Patient
                </>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="border border-[#80A0B5]/40"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PrescriptionModal







