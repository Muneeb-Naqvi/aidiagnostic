"use client"

import { motion } from "framer-motion"
import {
  User,
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
  FileText,
  Building2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PatientMedicalProfile = ({ patient }) => {
  if (!patient) return null

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-700 border-red-200",
      "A-": "bg-red-50 text-red-600 border-red-100",
      "B+": "bg-blue-100 text-blue-700 border-blue-200",
      "B-": "bg-blue-50 text-blue-600 border-blue-100",
      "AB+": "bg-purple-100 text-purple-700 border-purple-200",
      "AB-": "bg-purple-50 text-purple-600 border-purple-100",
      "O+": "bg-green-100 text-green-700 border-green-200",
      "O-": "bg-green-50 text-green-600 border-green-100",
    }
    return colors[bloodGroup] || "bg-gray-100 text-black border-gray-200"
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null
    const heightInM = height / 100
    return (weight / (heightInM * heightInM)).toFixed(1)
  }

  const bmi = calculateBMI(patient.weight, patient.height)
  const bmiCategory = bmi ? (
    bmi < 18.5 ? "Underweight" :
    bmi < 25 ? "Normal" :
    bmi < 30 ? "Overweight" : "Obese"
  ) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Patient Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-black flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4" />
            ID: {patient.patientId}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-black">
            {patient.dateOfBirth && <span>DOB: {formatDate(patient.dateOfBirth)}</span>}
            {patient.gender && <span className="capitalize">Gender: {patient.gender}</span>}
            {patient.email && <span>{patient.email}</span>}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-600 flex items-center gap-1">
              <Droplet className="w-3 h-3" /> Blood Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.bloodGroup ? (
              <Badge className={`${getBloodGroupColor(patient.bloodGroup)} text-sm font-bold`}>
                {patient.bloodGroup}
              </Badge>
            ) : (
              <span className="text-sm text-black">Not set</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.allergies.slice(0, 2).map((allergy, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs py-0 px-1.5">
                    {allergy}
                  </Badge>
                ))}
                {patient.allergies.length > 2 && (
                  <span className="text-xs text-black">+{patient.allergies.length - 2} more</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-black">None</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-purple-600 flex items-center gap-1">
              <Heart className="w-3 h-3" /> Chronic Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.chronicConditions?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.chronicConditions.slice(0, 2).map((cond, idx) => (
                  <Badge key={idx} className="text-xs py-0 px-1.5 bg-purple-100 text-purple-700 border-purple-200">
                    {cond}
                  </Badge>
                ))}
                {patient.chronicConditions.length > 2 && (
                  <span className="text-xs text-black">+{patient.chronicConditions.length - 2} more</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-black">None</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Activity className="w-3 h-3" /> BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bmi ? (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-black">{bmi}</span>
                <span className={`text-xs ${bmiCategory === "Normal" ? "text-green-600" : "text-amber-600"}`}>
                  {bmiCategory}
                </span>
              </div>
            ) : (
              <span className="text-sm text-black">N/A</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Measurements */}
        {(patient.weight || patient.height) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Physical Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {patient.weight && (
                <div className="flex justify-between">
                  <span className="text-black">Weight</span>
                  <span className="font-medium">{patient.weight} kg</span>
                </div>
              )}
              {patient.height && (
                <div className="flex justify-between">
                  <span className="text-black">Height</span>
                  <span className="font-medium">{patient.height} cm</span>
                </div>
              )}
              {bmi && (
                <div className="flex justify-between">
                  <span className="text-black">BMI</span>
                  <span className="font-medium">{bmi} ({bmiCategory})</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {patient.emergencyContact && patient.emergencyContact.name && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Name</span>
                <span className="font-medium">{patient.emergencyContact.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Relationship</span>
                <span className="font-medium">{patient.emergencyContact.relationship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Phone</span>
                <span className="font-medium">{patient.emergencyContact.phone}</span>
              </div>
              {patient.emergencyContact.alternatePhone && (
                <div className="flex justify-between">
                  <span className="text-black">Alt. Phone</span>
                  <span className="font-medium">{patient.emergencyContact.alternatePhone}</span>
                </div>
              )}
              {patient.emergencyContact.address && (
                <div className="flex justify-between">
                  <span className="text-black">Address</span>
                  <span className="font-medium text-right max-w-[60%]">{patient.emergencyContact.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Allergies Section */}
      <Card className={patient.allergies?.length > 0 ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"}>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.allergies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, idx) => (
                <Badge key={idx} variant="destructive" className="text-sm py-1 px-3">
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium">No known allergies</p>
          )}
        </CardContent>
      </Card>

      {/* Chronic Conditions Section */}
      <Card className={patient.chronicConditions?.length > 0 ? "border-orange-200 bg-orange-50/30" : "border-gray-200"}>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700">
            <Heart className="w-4 h-4" />
            Chronic Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.chronicConditions?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.chronicConditions.map((condition, idx) => (
                <Badge key={idx} className="bg-orange-100 text-orange-700 border-orange-200 text-sm py-1 px-3">
                  {condition}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black">No chronic conditions recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-700">
            <Pill className="w-4 h-4" />
            Current Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.currentMedications?.length > 0 ? (
            <div className="space-y-3">
              {patient.currentMedications.map((med, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-black">{med.name}</h4>
                    <p className="text-sm text-black">
                      {med.dosage && <span className="mr-3">{med.dosage}</span>}
                      {med.frequency && <span>{med.frequency}</span>}
                    </p>
                    {med.startDate && (
                      <p className="text-xs text-black mt-1">Since {formatDate(med.startDate)}</p>
                    )}
                    {med.prescribedBy && (
                      <p className="text-xs text-blue-600 mt-1">Prescribed by: {med.prescribedBy}</p>
                    )}
                    {med.notes && (
                      <p className="text-sm text-black italic mt-2">"{med.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Pill className="w-10 h-10 text-black mx-auto mb-2" />
              <p className="text-sm text-black">No current medications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Doctors */}
      {patient.assignedDoctors?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700">
              <Stethoscope className="w-4 h-4" />
              Assigned Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patient.assignedDoctors.map((doctor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-black" />
                    <div>
                      <p className="font-medium text-black">Dr. {doctor.doctorName}</p>
                      <p className="text-sm text-black">{doctor.specialization || "General"}</p>
                    </div>
                  </div>
                  {doctor.assignedDate && (
                    <span className="text-xs text-black">{formatDate(doctor.assignedDate)}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default PatientMedicalProfile
