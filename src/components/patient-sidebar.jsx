"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  Pill,
  Brain,
} from "lucide-react"

export function PatientSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/patients-dashboard", icon: LayoutDashboard },
    { label: "My Reports", href: "/patients-dashboard?tab=reports", icon: FileText },
    { label: "Upload Report", href: "/patients-dashboard?tab=upload", icon: Plus },
    { label: "Doctors", href: "/patients-dashboard?tab=doctors", icon: Users },
    { label: "Prescriptions", href: "/patients-dashboard?tab=prescriptions", icon: Pill },
  ]

  const handleLogout = () => {
    localStorage.removeItem("patientToken")
    localStorage.removeItem("patientEmail")
    router.push("/patients-login")
  }

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 h-screen fixed left-0 top-0 flex flex-col
                 bg-[#FFFDFD] border-r border-[#80A0B5]/40"
    >
      {/* ================= Logo / Header ================= */}
      <div className="p-6 border-b border-[#80A0B5]/40 flex items-center gap-3">
        <div className="w-11 h-11 bg-[#3875FD] text-white rounded-xl flex items-center justify-center shadow-md">
          <Brain className="w-6 h-6" />
        </div>

        <div>
          <h2 className="font-bold text-[#020331] leading-tight">
            MediCare AI
          </h2>
          <p className="text-xs text-[#80A0B5]">
            Patient Portal
          </p>
        </div>
      </div>

      {/* ================= Navigation ================= */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-[#3875FD] text-white shadow-lg"
                    : "text-[#000004] hover:bg-[#80A0B5]/20"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-[#3875FD]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ================= Footer ================= */}
      <div className="p-4 border-t border-[#80A0B5]/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                     text-[#000004] font-medium
                     hover:bg-red-500/10 hover:text-red-600
                     transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}

export default PatientSidebar