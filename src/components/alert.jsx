"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateEmail, validatePassword } from "@/lib/utils"

export default function PatientLogin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Login form
  const [loginData, setLoginData] = useState({ email: "", password: "" })

  // Sign up form
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
  })

  // Show success/error alerts using SweetAlert2
  const showAlert = (icon, title, text, timer = 3000) => {
    Swal.fire({
      icon,
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      customClass: {
        popup: "swal-medical",
      },
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateEmail(loginData.email)) {
      showAlert("error", "Invalid Email", "Please enter a valid email address")
      return
    }

    if (!loginData.password) {
      showAlert("error", "Missing Password", "Please enter your password")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/patients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("patientToken", `patient-session-${Date.now()}`)
        localStorage.setItem("patientEmail", data.patient.email)
        localStorage.setItem("patientId", data.patient.patientId)
        localStorage.setItem("patientName", data.patient.name)

        showAlert("success", "Welcome back!", "Login successful", 1800)

        setTimeout(() => {
          router.push("/patients-dashboard")
        }, 1800)
      } else {
        showAlert("error", "Login Failed", data.error || "Invalid credentials")
      }
    } catch (error) {
      console.error("[Auth] Login error:", error)
      showAlert("error", "Something went wrong", "Error logging in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    if (!signupData.fullName) {
      showAlert("error", "Missing Name", "Please enter your full name")
      return
    }

    if (!validateEmail(signupData.email)) {
      showAlert("error", "Invalid Email", "Please enter a valid email address")
      return
    }

    if (!validatePassword(signupData.password)) {
      showAlert(
        "error",
        "Weak Password",
        "Password must be at least 8 characters with uppercase and numbers"
      )
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      showAlert("error", "Password Mismatch", "Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.fullName,
          email: signupData.email,
          dateOfBirth: new Date(new Date().getFullYear() - Number.parseInt(signupData.age), 0, 1),
          gender: signupData.gender,
          password: signupData.password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("patientToken", `patient-session-${Date.now()}`)
        localStorage.setItem("patientEmail", data.data.email)
        localStorage.setItem("patientId", data.data.patientId)
        localStorage.setItem("patientName", data.data.name)

        showAlert("success", "Account Created!", "Welcome to your health portal", 2200)

        setTimeout(() => {
          router.push("/patients-dashboard")
        }, 2200)
      } else {
        showAlert("error", "Signup Failed", data.error || "Error creating account")
      }
    } catch (error) {
      console.error("[Auth] Signup error:", error)
      showAlert("error", "Error", "Could not create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-[#80A0B5]/30 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3875FD]/10 rounded-full mb-4">
              <Heart className="w-8 h-8 text-[#3875FD]" />
            </div>
            <h1 className="text-3xl font-bold text-[#000004] mb-2">Patient Portal</h1>
            <p className="text-[#80A0B5]">Access your health records & AI-powered insights</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-[#80A0B5]/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 px-4 rounded font-medium text-sm transition-all duration-300 ${
                activeTab === "login"
                  ? "bg-[#3875FD] text-white shadow-md"
                  : "text-[#000004] hover:bg-[#80A0B5]/20"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2.5 px-4 rounded font-medium text-sm transition-all duration-300 ${
                activeTab === "signup"
                  ? "bg-[#3875FD] text-white shadow-md"
                  : "text-[#000004] hover:bg-[#80A0B5]/20"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-[#000004]">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={isLoading}
                  className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-[#000004]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoading}
                    className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80A0B5] hover:text-[#3875FD]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#80A0B5] cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#80A0B5]/50" disabled={isLoading} />
                  Remember me
                </label>
                <a href="#" className="text-sm text-[#3875FD] font-medium hover:underline">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#3875FD] hover:bg-[#2b5ed8] text-white flex items-center justify-center gap-2 py-2.5 transition-colors"
                disabled={isLoading}
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* ... same signup fields as before ... */}
              <div>
                <Label htmlFor="fullName" className="text-[#000004]">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  disabled={isLoading}
                  className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20"
                />
              </div>

              <div>
                <Label htmlFor="signupEmail" className="text-[#000004]">Email Address</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  disabled={isLoading}
                  className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age" className="text-[#000004]">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={signupData.age}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                    disabled={isLoading}
                    className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-[#000004]">Gender</Label>
                  <select
                    id="gender"
                    className="w-full h-10 px-3 py-2 bg-white border border-[#80A0B5]/50 rounded-md focus:border-[#3875FD] focus:ring-[#3875FD]/20 text-[#000004] disabled:opacity-50"
                    value={signupData.gender}
                    onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                    disabled={isLoading}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="signupPassword" className="text-[#000004]">Password</Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    disabled={isLoading}
                    className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80A0B5] hover:text-[#3875FD]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-[#000004]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  className="border-[#80A0B5]/50 focus:border-[#3875FD] focus:ring-[#3875FD]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#3875FD] hover:bg-[#2b5ed8] text-white flex items-center justify-center gap-2 py-2.5 transition-colors"
                disabled={isLoading}
              >
                <UserPlus className="w-5 h-5" />
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-[#80A0B5] mt-6">
            Are you a doctor?{" "}
            <a href="/doctor-login" className="text-[#3875FD] font-medium hover:underline">
              Doctor Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}