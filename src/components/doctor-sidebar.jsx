"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, LayoutDashboard, Users, FileText, Plus } from "lucide-react"

export function DoctorSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/doctor-dashboard", icon: LayoutDashboard },
    { label: "My Patients", href: "/doctor-dashboard?tab=patients", icon: Users },
    { label: "Lab Reports", href: "/doctor-dashboard?tab=reports", icon: FileText },
    { label: "Write Prescription", href: "/doctor-dashboard?tab=prescription", icon: Plus },
  ]

  const handleLogout = () => {
    localStorage.removeItem("doctorToken")
    localStorage.removeItem("doctorId")
    router.push("/doctor-login")
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 bg-[#030433] border-r border-gray-700/40
                 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-20"
    >
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3B75FD] text-white rounded-lg flex items-center justify-center font-bold shadow-md">
          D
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">MediCare</h2>
          <p className="text-xs text-gray-400">Doctor Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href.includes("?tab=") && pathname.startsWith("/doctor-dashboard"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#070c44] text-white shadow-md"
                  : "bg-[#070c44] text-gray-200 hover:bg-[#0a104f]"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-[#3B82F6]"
                    : "text-gray-400 group-hover:text-[#3B75FD]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-gray-700/50 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 
                     hover:bg-[#0a104f] font-medium transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}