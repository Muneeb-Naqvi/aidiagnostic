"use client"

import { motion } from "framer-motion"
import { Bell, Settings, User } from "lucide-react"

export function AdminHeader({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-[#0A0A0F]/70 sticky top-0 z-30 shadow-sm"
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A0A0F] dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification with red dot */}
          <button 
            className="p-2.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#3B82F6]" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0F172A] rounded-full"></span>
          </button>

          {/* Settings */}
          <button 
            className="p-2.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
          </button>

          {/* User/Profile */}
          <button 
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white text-sm font-medium shadow-sm">
              A
            </div>
            {/* Optional: show name on larger screens */}
            {/* <span className="hidden sm:inline text-sm font-medium text-[#0A0A0F] dark:text-gray-200 group-hover:text-[#3B82F6] transition-colors">
              Admin
            </span> */}
          </button>
        </div>
      </div>
    </motion.div>
  )
}