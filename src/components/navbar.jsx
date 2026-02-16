"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, HeartPulse, Brain } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "AI Diagnosis", href: "/ai-diagnosis" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFDFD]/95 backdrop-blur border-b border-[#80A0B5]/40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* ================= Desktop Logo ================= */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-2 font-bold text-xl text-[#3875FD]"
        >
          <HeartPulse className="w-6 h-6" />
          <span>MediCare AI</span>
        </Link>

        {/* ================= Desktop Menu ================= */}
        <div className="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#000004] font-medium hover:text-[#3875FD] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* ================= Mobile Hamburger ONLY ================= */}
        <button
          className="md:hidden ml-auto p-2 text-[#020331]"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* ================= Mobile Full Dropdown ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full h-screen bg-[#020331] z-50 md:hidden"
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex flex-col items-center justify-center h-full gap-8 text-lg">
              <div className="flex items-center gap-2 text-[#3875FD] text-2xl font-bold">
                <Brain className="w-7 h-7" />
                <span>MediCare AI</span>
              </div>

              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[#FFFDFD] hover:text-[#80A0B5] transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}

              <p className="text-sm text-[#80A0B5] mt-6">
                AI-Powered Medical Diagnosis & Care
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
