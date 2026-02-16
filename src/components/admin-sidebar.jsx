"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, LayoutDashboard, Users, CheckCircle, Plus } from "lucide-react"

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
    { label: "Doctor Requests", href: "/admin-dashboard?tab=requests", icon: Users },
    { label: "Approved Doctors", href: "/admin-dashboard?tab=approved", icon: CheckCircle },
    { label: "Add Doctor", href: "/admin-dashboard?tab=add-doctor", icon: Plus },
  ]

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminEmail")
    router.push("/admin-login")
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 bg-[#020332] dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800/70 
                 h-screen fixed left-0 top-0 flex flex-col shadow-sm z-20"
    >
      {/* Logo / Brand */}
      <div className="p-6 border-b border-[#0a1350]-200 dark:border-gray-800/70 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3B82F6] text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
          M
        </div>
        <div>
          <h2 className="font-bold text-lg text-white dark:text-gray-100">MediCare</h2>
          <p className="text-xs text-[#64748B] dark:text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
                          (item.href.includes("?tab=") && pathname.startsWith("/admin-dashboard"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#0a1350] text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-[#3B82F6]" : "text-[#64748B] dark:text-gray-400 group-hover:text-[#3B82F6]"  
                }`} 
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-[#0a1350]-200 dark:border-gray-800/70 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white 
                     hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}