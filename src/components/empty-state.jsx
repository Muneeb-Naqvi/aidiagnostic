"use client"

import { motion } from "framer-motion"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default", // "default" | "diagnosis" | "search" | "ai"
}) {
  // Medical-themed empty state variants
  const variants = {
    default: {
      iconColor: "#80A0B5",
      titleColor: "#000004",
      descColor: "#80A0B5",
      bgAccent: "from-[#3875FD]/5 to-transparent",
    },
    diagnosis: {
      iconColor: "#3875FD",
      titleColor: "#000004",
      descColor: "#80A0B5",
      bgAccent: "from-[#3875FD]/8 to-[#3875FD]/2",
    },
    search: {
      iconColor: "#80A0B5",
      titleColor: "#000004",
      descColor: "#80A0B5",
      bgAccent: "from-transparent via-[#80A0B5]/5 to-transparent",
    },
    ai: {
      iconColor: "#3875FD",
      titleColor: "#020331",
      descColor: "#80A0B5",
      bgAccent: "from-[#3875FD]/10 via-[#3875FD]/5 to-transparent",
    },
  }

  const style = variants[variant] || variants.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        flex flex-col items-center justify-center
        text-center py-16 px-6
        rounded-2xl border border-[#80A0B5]/20
        bg-gradient-to-br ${style.bgAccent}
        backdrop-blur-[1px]
      `}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#3875FD]/5 rounded-full blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#3875FD]/5 rounded-full blur-3xl" />
      </div>

      {Icon && (
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#3875FD]/5 rounded-full blur-xl" />
          <Icon
            className="relative w-20 h-20 mx-auto"
            style={{ color: style.iconColor }}
          />
        </div>
      )}

      <h3
        className="text-2xl md:text-3xl font-bold mb-3 tracking-tight"
        style={{ color: style.titleColor }}
      >
        {title}
      </h3>

      <p
        className="text-base max-w-md mb-8 leading-relaxed"
        style={{ color: style.descColor }}
      >
        {description}
      </p>

      {action && (
        <div className="relative z-10">
          {action}
        </div>
      )}
    </motion.div>
  )
}