"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedStat({
  value,
  label,
  icon: Icon,
  color = "primary",
  unit = "",
}) {
  const [count, setCount] = useState(0)
  const numValue = Number.parseFloat(value) // better support for decimals

  useEffect(() => {
    if (!numValue) return

    const duration = 1800 // total animation time in ms
    const steps = 60
    const increment = numValue / steps
    let current = 0
    let stepCount = 0

    const timer = setInterval(() => {
      current += increment
      stepCount++

      if (stepCount >= steps || current >= numValue) {
        setCount(numValue)
        clearInterval(timer)
      } else {
        setCount(Number(current.toFixed(1)))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numValue])

  // Medical-oriented color variants
  const colorStyles = {
    primary: {
      text: "text-[#3875FD]",
      icon: "text-[#3875FD]",
      bg: "bg-[#3875FD]/8",
    },
    success: {
      text: "text-emerald-600",
      icon: "text-emerald-600",
      bg: "bg-emerald-50/70",
    },
    patients: {
      text: "text-[#3875FD]",
      icon: "text-[#3875FD]",
      bg: "bg-[#3875FD]/10",
    },
    diagnosis: {
      text: "text-indigo-600",
      icon: "text-indigo-600",
      bg: "bg-indigo-50/70",
    },
    warning: {
      text: "text-amber-600",
      icon: "text-amber-600",
      bg: "bg-amber-50/70",
    },
  }

  const style = colorStyles[color] || colorStyles.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        flex flex-col items-center p-5 rounded-xl
        ${style.bg}
        border border-[#80A0B5]/20
        backdrop-blur-[1px]
        shadow-sm hover:shadow-md transition-shadow duration-300
      `}
    >
      {/* Subtle background accent */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-60 blur-xl" />

      {Icon && (
        <div className={`mb-3 rounded-full p-2.5 ${style.bg}`}>
          <Icon className={`w-7 h-7 ${style.icon} opacity-90`} />
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <motion.div
          className={`text-4xl md:text-5xl font-bold tracking-tight ${style.text}`}
        >
          {count.toLocaleString()}
        </motion.div>

        {unit && (
          <span className="text-xl font-medium text-[#80A0B5]">{unit}</span>
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-[#000004]/80">{label}</p>
    </motion.div>
  )
}