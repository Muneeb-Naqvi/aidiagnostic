"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLogin() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "Authentication failed")
        setIsLoading(false)
        return
      }

      localStorage.setItem("adminEmail", credentials.email)

      router.push("/admin-dashboard")
    } catch (err) {
      console.error("Admin login error:", err)
      setError("Connection error. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FFFDFE] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] sm:[background-size:20px_20px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md sm:max-w-lg md:max-w-md relative z-10"
      >
        <div className="bg-white border border-[#80A0B5]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Header */}
          <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6 text-center border-b border-[#80A0B5]/20">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#3B75FD]/10 rounded-xl mb-4 sm:mb-5 text-[#3B75FD]">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#020331] mb-1.5 sm:mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-[#80A0B5] text-xs sm:text-sm">Authorized personnel only</p>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-5 sm:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label 
                    htmlFor="email" 
                    className="text-[#020331] font-medium text-sm block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@medicare.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    disabled={isLoading}
                    className="w-full h-10 sm:h-11 px-3 sm:px-4 border border-[#80A0B5]/40 focus:border-[#3B75FD] focus:ring-2 focus:ring-[#3B75FD]/20 rounded-lg bg-white text-[#000004] placeholder:text-[#80A0B5]/70 transition-all duration-200 shadow-sm text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
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
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      disabled={isLoading}
                      className="w-full h-10 sm:h-11 px-3 sm:px-4 pr-10 sm:pr-11 border border-[#80A0B5]/40 focus:border-[#3B75FD] focus:ring-2 focus:ring-[#3B75FD]/20 rounded-lg bg-white text-[#000004] placeholder:text-[#80A0B5]/70 transition-all duration-200 shadow-sm text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80A0B5] hover:text-[#3B75FD] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50/80 border border-red-200 rounded-lg p-2.5 sm:p-3 text-red-700 text-xs sm:text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 bg-[#020433] hover:bg-[#080c45] text-white font-medium rounded-lg shadow-md shadow-[#3B75FD]/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Secure Login</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="bg-[#FFFDFE] px-5 sm:px-8 py-5 sm:py-6 border-t border-[#80A0B5]/15">
            <div className="bg-white/60 border border-[#80A0B5]/20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-[#80A0B5] uppercase tracking-wider mb-1.5 sm:mb-2">Demo Credentials</p>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#80A0B5]">Email:</span>
                  <code className="text-[#3B75FD] font-mono font-semibold bg-[#3B75FD]/5 px-1.5 sm:px-2 py-0.5 rounded select-all cursor-pointer text-xs sm:text-sm">
                    admin@medicare.com
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#80A0B5]">Password:</span>
                  <code className="text-[#3B75FD] font-mono font-semibold bg-[#3B75FD]/5 px-1.5 sm:px-2 py-0.5 rounded select-all cursor-pointer text-xs sm:text-sm">
                    Admin@123
                  </code>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#80A0B5] flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> End-to-end encrypted session
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}