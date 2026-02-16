"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateEmail, validatePassword } from "@/lib/utils"
import { toast } from "sonner"


export default function PatientLogin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/patients/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),

      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error || "Login failed")
        return
      }

      // Store non-sensitive user info for UI display
      localStorage.setItem("patientId", data.patient.patientId)
      localStorage.setItem("patientName", data.patient.name)

      toast.success("Login successful")
      router.replace("/patients-dashboard")
    } catch (err) {
      console.error(err)
      toast.error("Server error")
    }
  }


  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!signupData.fullName) {
      setError("Please enter your full name")
      return
    }

    if (!validateEmail(signupData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!validatePassword(signupData.password)) {
      setError("Password must be at least 8 characters with uppercase and numbers")
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match")
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
        setSuccess("Account created successfully!")
        setTimeout(() => router.push("/patients-dashboard"), 1000)
      } else {
        setError(data.error || "Error creating account")
      }
    } catch (error) {
      console.error("[Auth] Signup error:", error)
      setError("Error creating account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-blue-100/60 to-cyan-100/60 blur-3xl opacity-60" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-indigo-100/60 to-purple-100/60 blur-3xl opacity-60" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-teal-100/60 to-emerald-100/60 blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-5 transform rotate-3"
            >
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Manage your health journey with confidence</p>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 mb-6">
            <div className="flex bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 relative ${activeTab === "login" ? "text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {activeTab === "login" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Login</span>
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 relative ${activeTab === "signup" ? "text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {activeTab === "signup" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Forms Area */}
          <div className="px-8 pb-10 bg-[#FFFDFE]">
            {activeTab === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-6 max-w-md mx-auto"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-black font-medium text-sm block"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    disabled={isLoading}
                    className="w-full h-11 px-4 bg-white border border-[#80A0B5]/40 text-[#000004] placeholder:text-[#80A0B5]/60 
                     focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/15 
                     rounded-xl transition-all duration-200 text-base shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-black font-medium text-sm block"
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
                      className="w-full h-11 px-4 bg-white border border-[#80A0B5]/40 text-[#000004] placeholder:text-[#80A0B5]/60 
                       focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/15 
                       rounded-xl transition-all duration-200 pr-12 text-base shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-4 text-[#80A0B5] hover:text-[#3B75FD] transition-colors flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 text-sm text-[#80A0B5] cursor-pointer group select-none">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        disabled={isLoading}
                      />
                      <div className="w-5 h-5 border-2 border-[#80A0B5]/60 rounded-md bg-white transition-all peer-checked:bg-[#3B75FD] peer-checked:border-[#3B75FD] peer-focus:ring-2 peer-focus:ring-[#3B75FD]/30"></div>
                      <svg
                        className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="group-hover:text-[#000004] transition-colors">Remember me</span>
                  </label>

                  <a
                    href="#"
                    className="text-sm text-[#3B75FD] font-medium hover:text-[#3B75FD]/80 hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 text-red-700 text-sm flex items-center justify-center text-center shadow-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#3B75FD] hover:bg-[#2f5fd8] text-white text-base font-semibold 
                   rounded-xl shadow-md shadow-[#3B75FD]/25 hover:shadow-lg hover:shadow-[#3B75FD]/35 
                   transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                   flex items-center justify-center gap-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </Button>
              </motion.form>
            )}

            {activeTab === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignup}
                className="space-y-5 bg-[#FFFDFE] p-1"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-[#020331] font-medium text-sm block"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    disabled={isLoading}
                    className="w-full h-11 px-4 bg-white border border-[#80A0B5]/30 text-[#000004] 
                   placeholder:text-[#80A0B5]/60 focus:border-[#3B75FD] focus:ring-4 
                   focus:ring-[#3B75FD]/15 rounded-xl transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="signupEmail"
                    className="text-[#020331] font-medium text-sm block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    disabled={isLoading}
                    className="w-full h-11 px-4 bg-white border border-[#80A0B5]/30 text-[#000004] 
                   placeholder:text-[#80A0B5]/60 focus:border-[#3B75FD] focus:ring-4 
                   focus:ring-[#3B75FD]/15 rounded-xl transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="age"
                      className="text-[#020331] font-medium text-sm block"
                    >
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="00"
                      value={signupData.age}
                      onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                      disabled={isLoading}
                      className="w-full h-11 px-4 bg-white border border-[#80A0B5]/30 text-[#000004] 
                     placeholder:text-[#80A0B5]/60 focus:border-[#3B75FD] focus:ring-4 
                     focus:ring-[#3B75FD]/15 rounded-xl transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="gender"
                      className="text-[#020331] font-medium text-sm block"
                    >
                      Gender
                    </Label>
                    <div className="relative">
                      <select
                        id="gender"
                        className="w-full h-11 px-4 bg-white border border-[#80A0B5]/30 text-[#000004] 
                       rounded-xl focus:border-[#3B75FD] focus:ring-4 focus:ring-[#3B75FD]/15 
                       appearance-none transition-all duration-200 cursor-pointer disabled:opacity-60"
                        value={signupData.gender}
                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                        disabled={isLoading}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#80A0B5]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="signupPassword"
                    className="text-[#020331] font-medium text-sm block"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      disabled={isLoading}
                      className="w-full h-11 px-4 pr-11 bg-white border border-[#80A0B5]/30 text-[#000004] 
                     placeholder:text-[#80A0B5]/60 focus:border-[#3B75FD] focus:ring-4 
                     focus:ring-[#3B75FD]/15 rounded-xl transition-all duration-200"
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

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[#020331] font-medium text-sm block"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    className="w-full h-11 px-4 bg-white border border-[#80A0B5]/30 text-[#000004] 
                   placeholder:text-[#80A0B5]/60 focus:border-[#3B75FD] focus:ring-4 
                   focus:ring-[#3B75FD]/15 rounded-xl transition-all duration-200"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50/80 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-green-50/80 border border-green-200 rounded-xl p-3 text-green-700 text-sm text-center font-medium"
                  >
                    {success}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#3B75FD] hover:bg-[#2f5cd9] text-white text-base font-semibold 
                 rounded-xl shadow-lg shadow-[#3B75FD]/25 hover:shadow-xl hover:shadow-[#3B75FD]/35 
                 transition-all duration-300 mt-3 disabled:opacity-60 flex items-center justify-center gap-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
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
          Secure Health Portal • 2026 Medicare
        </motion.p>
      </motion.div>
    </div>
  )
}

