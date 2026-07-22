"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User,
  Edit2,
  Save,
  X,
  Droplet,
  AlertTriangle,
  Pill,
  Stethoscope,
  Phone,
  MapPin,
  Heart,
  Activity,
  Weight,
  Ruler,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
  Building2,
  Download,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Swal from "sweetalert2"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]

const MedicalProfile = ({ patientId }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "other",
    bloodGroup: "",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    medicalHistory: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      alternatePhone: "",
      address: ""
    },
    weight: 0,
    height: 0,
    bmi: 0
  })

  const [tempProfile, setTempProfile] = useState(profile)

  useEffect(() => {
    if (patientId) {
      fetchMedicalProfile()
    }
  }, [patientId])

  const fetchMedicalProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/patients/${patientId}/medical-profile`)
      const data = await res.json()
      
      if (data.success) {
        setProfile(data.data)
        setTempProfile(data.data)
      } else {
        toast.error(data.error || "Failed to load medical profile")
      }
    } catch (error) {
      console.error("Error fetching medical profile:", error)
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate required emergency contact fields
      if (!tempProfile.emergencyContact.name || 
          !tempProfile.emergencyContact.relationship || 
          !tempProfile.emergencyContact.phone) {
        toast.error("Emergency contact name, relationship, and phone are required")
        return
      }

      const res = await fetch(`/api/patients/${patientId}/medical-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempProfile)
      })
      
      const data = await res.json()
      
      if (data.success) {
        setProfile(data.data)
        setEditing(false)
        toast.success("Medical profile updated successfully")
        
        // Recalculate BMI if weight/height changed
        if (tempProfile.weight && tempProfile.height) {
          const heightInM = tempProfile.height / 100
          const bmi = (tempProfile.weight / (heightInM * heightInM)).toFixed(1)
          if (data.data.bmi !== bmi) {
            await fetch(`/api/patients/${patientId}/medical-profile`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bmi: parseFloat(bmi) })
            })
          }
        }
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving medical profile:", error)
      toast.error("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setEditing(false)
  }

  const addItem = (field) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeItem = (field, index) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateItem = (field, index, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addMedication = () => {
    setTempProfile(prev => ({
      ...prev,
      currentMedications: [...prev.currentMedications, {
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        prescribedBy: "",
        notes: ""
      }]
    }))
  }

  const updateMedication = (index, field, value) => {
    setTempProfile(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const removeMedication = (index) => {
    setTempProfile(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
{/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#020331]">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-black flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4" />
              Electronic Health Record
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              window.open(`/api/patients/${patientId}/ehr-report`, "_blank")
            }}
            variant="outline"
            className="gap-2 border-[#3875FD] text-[#3875FD] hover:bg-[#3875FD] hover:text-white"
          >
            <Download className="w-4 h-4" />
            Download EHR
          </Button>
          {!editing ? (
            <Button
              onClick={() => setEditing(true)}
              className="gap-2 bg-gradient-to-r from-[#3875FD] to-indigo-600 hover:from-[#3875FD]/90 hover:to-indigo-600/90"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-500/90 hover:to-emerald-600/90"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
</>
           )}
         </div>
       </div>
      </motion.div>
    )
}

export default MedicalProfile;
