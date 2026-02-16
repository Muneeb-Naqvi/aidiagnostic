"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Stethoscope, Eye, EyeOff, LogIn, Send, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SPECIALIZATIONS } from "@/lib/constants"

export default function DoctorLogin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Login form state
  const [loginData, setLoginData] = useState({ identifier: "", password: "" })

  // Request access form state
  const [requestData, setRequestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!loginData.identifier || !loginData.password) {
      setError("Please enter Doctor ID/Email and password")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/doctors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginData.identifier,
          password: loginData.password,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Invalid credentials")
        setIsLoading(false)
        return
      }

      localStorage.setItem("doctorId", data.doctor.doctorId)
      localStorage.setItem("doctorName", data.doctor.name)
      localStorage.setItem("doctorSpecialization", data.doctor.specialization)
      setSuccess("Login successful! Redirecting to dashboard...")

      setTimeout(() => {
        router.push("/doctor-dashboard")
      }, 1000)
    } catch (err) {
      console.error("[Auth] Doctor login error:", err)
      setError("Connection error. Please try again.")
      setIsLoading(false)
    }
  }

  const handleRequestAccess = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!requestData.firstName || !requestData.lastName || !requestData.email || !requestData.phone) {
      setError("Please fill in all required fields")
      return
    }

    if (!requestData.specialization) {
      setError("Please select a specialization")
      return
    }

    if (!requestData.licenseNumber) {
      setError("Please enter your license number")
      return
    }

    if (!requestData.password || requestData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (requestData.password !== requestData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          email: requestData.email,
          phone: requestData.phone,
          specialization: requestData.specialization,
          licenseNumber: requestData.licenseNumber,
          password: requestData.password,
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Failed to submit request")
        setIsLoading(false)
        return
      }

      setSuccess("Request submitted successfully! Admin will review your request.")
      setRequestData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
        licenseNumber: "",
        password: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        setActiveTab("login")
      }, 2000)
    } catch (err) {
      console.error("[Auth] Request access error:", err)
      setError("Connection error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0F6F8] flex items-center justify-center p-4 font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]"></div>
        <div className="absolute -top-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-100/50 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-3xl opacity-60"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg shadow-cyan-600/20 mb-5"
            >
              <Stethoscope className="w-8 h-8 text-white relative z-10" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Doctor Portal</h1>
            <p className="text-gray-500 text-sm">Access your medical dashboard</p>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 mb-6">
            <div className="flex bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 relative ${activeTab === "login" ? "text-cyan-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {activeTab === "login" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Login
                </span>
              </button>
              <button
                onClick={() => setActiveTab("request")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 relative ${activeTab === "request" ? "text-cyan-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {activeTab === "request" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Request Access
                </span>
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="px-8 pb-10">
            {activeTab === "login" && (
              <motion.form
  key="login"
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 10 }}
  transition={{ duration: 0.2 }}
  onSubmit={handleLogin}
  className="space-y-6 w-full max-w-md mx-auto" // improved overall spacing & centering
>
  <div className="space-y-2">
    <Label 
      htmlFor="identifier" 
      className="text-[#020331] font-medium text-sm block"
    >
      Doctor ID or Email
    </Label>
    <Input
      id="identifier"
      type="text"
      placeholder="Doctor ID or Email..."
      value={loginData.identifier}
      onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] 
                 placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/15 
                 rounded-xl transition-all duration-200 text-base shadow-sm"
    />
  </div>

  <div className="space-y-2">
    <Label 
      htmlFor="password" 
      className="text-[#020331] font-medium text-sm block"
    >
      Password
    </Label>
    <div className="relative">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        disabled={isLoading}
        className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] 
                   placeholder:text-[#80A0B5]/70 
                   focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/15 
                   rounded-xl transition-all duration-200 pr-12 text-base shadow-sm"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-0 top-0 h-full px-4 text-[#80A0B5] hover:text-[#3B75FD] 
                   transition-colors flex items-center justify-center"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>

  {error && (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 text-red-700 text-sm 
                 flex items-center justify-center gap-2 text-center font-medium"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
    </motion.div>
  )}

  {success && (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50/80 border border-green-200 rounded-xl p-3.5 text-green-700 text-sm 
                 flex items-center justify-center gap-2 text-center font-medium"
    >
      <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
    </motion.div>
  )}

  <Button
    type="submit"
    className="w-full h-11 bg-[#3B75FD] hover:bg-[#2f5fd1] text-white text-base font-semibold 
               rounded-xl shadow-md shadow-[#3B75FD]/25 hover:shadow-lg hover:shadow-[#3B75FD]/35 
               transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 
               disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
               flex items-center justify-center gap-2.5"
    disabled={isLoading}
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>Authenticating...</span>
      </>
    ) : (
      <>
        <LogIn className="w-5 h-5" />
        <span>Secure Login</span>
      </>
    )}
  </Button>
</motion.form>
            )}

            {activeTab === "request" && (
              <motion.form
  key="request"
  initial={{ opacity: 0, x: 10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -10 }}
  transition={{ duration: 0.2 }}
  onSubmit={handleRequestAccess}
  className="space-y-6"
>
  <div className="space-y-2">
    <Label htmlFor="firstName" className="text-[#020331] font-medium text-sm block">
      First Name
    </Label>
    <Input
      id="firstName"
      type="text"
      placeholder="firstName"
      value={requestData.firstName}
      onChange={(e) => setRequestData({ ...requestData, firstName: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="lastName" className="text-[#020331] font-medium text-sm block">
      Last Name
    </Label>
    <Input
      id="lastName"
      type="text"
      placeholder="lastName"
      value={requestData.lastName}
      onChange={(e) => setRequestData({ ...requestData, lastName: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="reqEmail" className="text-[#020331] font-medium text-sm block">
      Email Address
    </Label>
    <Input
      id="reqEmail"
      type="email"
      placeholder="doctor@hospital.com"
      value={requestData.email}
      onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="phone" className="text-[#020331] font-medium text-sm block">
      Phone Number
    </Label>
    <Input
      id="phone"
      type="tel"
      placeholder="0300-0000000"
      value={requestData.phone}
      onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="specialization" className="text-[#020331] font-medium text-sm block">
      Specialization
    </Label>
    <div className="relative">
      <select
        id="specialization"
        value={requestData.specialization}
        onChange={(e) => setRequestData({ ...requestData, specialization: e.target.value })}
        className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] 
                   rounded-xl text-base focus:outline-none focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 
                   appearance-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        disabled={isLoading}
      >
        <option value="" className="text-[#80A0B5]">Select...</option>
        {SPECIALIZATIONS.map((spec) => (
          <option key={spec} value={spec}>
            {spec}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#80A0B5]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>

  <div className="space-y-2">
    <Label htmlFor="licenseNumber" className="text-[#020331] font-medium text-sm block">
      License Number
    </Label>
    <Input
      id="licenseNumber"
      type="text"
      placeholder="LIC-12345"
      value={requestData.licenseNumber}
      onChange={(e) => setRequestData({ ...requestData, licenseNumber: e.target.value })}
      disabled={isLoading}
      className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                 focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="reqPassword" className="text-[#020331] font-medium text-sm block">
        Password
      </Label>
      <div className="relative">
        <Input
          id="reqPassword"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={requestData.password}
          onChange={(e) => setRequestData({ ...requestData, password: e.target.value })}
          disabled={isLoading}
          className="w-full h-11 px-4 pr-11 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                     focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-0 h-full px-4 text-[#80A0B5] hover:text-[#3B75FD] transition-colors flex items-center justify-center"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="confirmPassword" className="text-[#020331] font-medium text-sm block">
        Confirm Password
      </Label>
      <Input
        id="confirmPassword"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={requestData.confirmPassword}
        onChange={(e) => setRequestData({ ...requestData, confirmPassword: e.target.value })}
        disabled={isLoading}
        className="w-full h-11 px-4 bg-[#FFFDFE] border border-[#80A0B5] text-[#020331] placeholder:text-[#80A0B5]/70 
                   focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/20 rounded-xl text-base 
                   transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  </div>

  {error && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-50/80 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center flex items-center justify-center gap-2"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  )}

  {success && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-green-50/80 border border-green-200 rounded-xl p-3 text-green-700 text-sm text-center flex items-center justify-center gap-2"
    >
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      <span>{success}</span>
    </motion.div>
  )}

  <Button
    type="submit"
    className="w-full h-11 bg-[#3B75FD] hover:bg-[#2f5cd1] text-white text-base font-semibold 
               rounded-xl shadow-lg shadow-[#3B75FD]/30 hover:shadow-xl hover:shadow-[#3B75FD]/40 
               transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
    disabled={isLoading}
  >
    {isLoading ? (
      <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>Processing...</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <Send className="w-4 h-4" />
        <span>Submit Request</span>
      </div>
    )}
  </Button>
</motion.form>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          Secure Medical Professional Portal • 2024 Medicare
        </motion.p>
      </motion.div>
    </div>
  )
}

