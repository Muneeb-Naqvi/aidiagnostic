"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Main spinning ring - Medical Blue */}
      <motion.div
        className="w-14 h-14 rounded-full border-4 border-[#80A0B5]/30 border-t-[#3875FD]"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Inner subtle pulse ring - gives AI/futuristic medical feel */}
      <motion.div
        className="absolute w-10 h-10 rounded-full border-2 border-[#3875FD]/40"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 2.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Tiny center dot - represents AI "thinking" / scanning */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-[#3875FD]"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Optional: Very subtle outer glow (medical scanner vibe) */}
      <motion.div
        className="absolute w-20 h-20 rounded-full bg-[#3875FD]/10 blur-xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}