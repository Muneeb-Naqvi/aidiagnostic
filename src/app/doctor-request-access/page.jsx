"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SPECIALIZATIONS } from "@/lib/constants"
import Swal from "sweetalert2"
import { Eye, EyeOff, ArrowLeft, User, Mail, Phone, FileCheck, Briefcase, Lock } from "lucide-react"

export default function DoctorRequestAccess() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    doctorEmail: "",
    phoneNumber: "",
    whatsappNumber: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
    password: "",
    confirmPassword: ""
  })

  // Pakistan Phone Number Validation
  const validatePhoneNumber = (phone) => {
    const pakistanRegex = /^\+92[0-9]{10}$/
    return pakistanRegex.test(phone)
  }

  // Email Validation (no fake domains)
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const fakeDomains = ['tempmail', '10minutemail', 'throwaway', 'fakeemail', 'dispostable', 'yopmail', 'guerrillamail', 'mailinator']
    const isValidFormat = emailRegex.test(email)
    const isNotFake = !fakeDomains.some(domain => email.toLowerCase().includes(domain))
    return isValidFormat && isNotFake
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Full Validations
    if (!formData.firstName || formData.firstName.length < 2) {
      Swal.fire({ icon: 'error', title: 'Invalid Name', text: 'Please enter a valid first name', confirmButtonColor: '#EF4444' })
      return
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      Swal.fire({ icon: 'error', title: 'Invalid Name', text: 'Please enter a valid last name', confirmButtonColor: '#EF4444' })
      return
    }
    if (!validateEmail(formData.doctorEmail)) {
      Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid professional email address. Temporary/fake emails are not allowed.', confirmButtonColor: '#EF4444' })
      return
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      Swal.fire({ icon: 'error', title: 'Invalid Phone Number', text: 'Please enter valid Pakistan number format: +923001234567', confirmButtonColor: '#EF4444' })
      return
    }
    if (!formData.specialization) {
      Swal.fire({ icon: 'error', title: 'Select Specialization', text: 'Please select your specialization', confirmButtonColor: '#EF4444' })
      return
    }
    if (!formData.licenseNumber || formData.licenseNumber.length < 4) {
      Swal.fire({ icon: 'error', title: 'Invalid License', text: 'Please enter your valid PMDC license number', confirmButtonColor: '#EF4444' })
      return
    }
    if (!formData.password || formData.password.length < 8) {
      Swal.fire({ icon: 'error', title: 'Weak Password', text: 'Password must be at least 8 characters long', confirmButtonColor: '#EF4444' })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Password Mismatch', text: 'Passwords do not match', confirmButtonColor: '#EF4444' })
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/doctor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Request Submitted!',
          text: 'Your doctor access request has been submitted. You will receive email confirmation once admin reviews your application.',
          confirmButtonColor: '#10B981',
          timer: 5000,
          timerProgressBar: true
        })
        setTimeout(() => router.push("/doctor-login"), 5000)
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Failed to submit request', confirmButtonColor: '#EF4444' })
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Network error. Please try again.', confirmButtonColor: '#EF4444' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/doctor-login")}
          className="text-white mb-4 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
            <CardTitle className="text-2xl text-center">Doctor Access Request</CardTitle>
            <p className="text-blue-100 text-center mt-2">Apply for doctor portal access</p>
          </CardHeader>
          
          <CardContent className="pt-8 pb-8 px-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Professional Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="doctor.name@hospital.com"
                    value={formData.doctorEmail}
                    onChange={(e) => setFormData({ ...formData, doctorEmail: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-slate-500">Temporary or fake email addresses are not accepted</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number (Pakistan)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="+923001234567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="pl-10"
                      maxLength={13}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="+923001234567"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    maxLength={13}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialization</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <select
                    className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500/20"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  >
                    <option value="">Select your Specialization</option>
                    {SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PMDC License Number</Label>
                  <div className="relative">
                    <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="PMDC-12345"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    min="0"
                    max="70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="text-amber-800">
                  <strong>Note:</strong> After submitting this request, admin will review your application. You will receive email notification once your account is approved or rejected.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? "Submitting Request..." : "Submit Access Request"}
              </Button>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}