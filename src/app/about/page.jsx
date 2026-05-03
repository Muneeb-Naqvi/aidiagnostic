"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Heart,
  Award,
  Zap,
  Users,
  Brain,
  Stethoscope,         
  Activity,
  ShieldCheck
} from "lucide-react"

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFDFD] text-[#020331]">
        {/* Hero-like Section */}
        <section className="relative py-16 px-5 sm:py-20 md:py-28 lg:py-32 overflow-hidden bg-gradient-to-br from-[#020331] to-[#000004]">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(56,117,253,0.15),transparent_50%)]" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 sm:mb-6">
                About <span className="text-[#3875FD]">MediCare</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Revolutionizing healthcare with{" "}
                <span className="text-[#3875FD] font-semibold">AI-powered diagnostics</span>,
                expert doctors and patient-first technology
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 px-5 sm:py-16 md:py-20 lg:py-24 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[#80A0B5]/30 p-6 sm:p-8 md:p-10 lg:p-12 mb-12 sm:mb-16"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="bg-[#3875FD]/10 p-3 sm:p-4 rounded-xl">
                  <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#3875FD]" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#020331]">Our Mission</h2>
              </div>
              <p className="text-base sm:text-lg text-[#020331]/80 leading-relaxed mb-5 sm:mb-6">
                To make world-class healthcare accessible to everyone by combining
                <span className="text-[#3875FD] font-medium"> expert medical professionals</span> with
                cutting-edge <span className="text-[#3875FD] font-medium">AI diagnostics</span> and
                seamless digital experience.
              </p>
              <p className="text-base sm:text-lg text-[#020331]/80">
                We are building the future of medicine — preventive, personalized, and always patient-centered.
              </p>
            </motion.div>

            {/* Core Values / Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7 mb-16 sm:mb-20">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Diagnosis",
                  description: "Advanced AI analyzes symptoms, lab reports & images for faster, more accurate insights.",
                  color: "#3875FD"
                },
                {
                  icon: Stethoscope,
                  title: "Expert Medical Team",
                  description: "Board-certified specialists across 30+ fields available 24/7.",
                  color: "#3875FD"
                },
                {
                  icon: ShieldCheck,
                  title: "Complete Data Security",
                  description: "Military-grade encryption & HIPAA compliant health records protection.",
                  color: "#3875FD"
                },
                {
                  icon: Activity,
                  title: "Preventive Health Focus",
                  description: "Early detection through smart monitoring & personalized health plans.",
                  color: "#3875FD"
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.7 }}
                    className="bg-white rounded-2xl shadow-lg border border-[#80A0B5]/20 p-6 sm:p-7 hover:shadow-xl hover:border-[#3875FD]/30 transition-all duration-300 group"
                  >
                    <div className="bg-[#3875FD]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#3875FD]/20 transition-colors">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#3875FD]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#020331] mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-sm sm:text-base text-[#020331]/70 leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Our Story / Vision */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#3875FD]/5 via-[#80A0B5]/5 to-[#3875FD]/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 border border-[#3875FD]/20 shadow-xl"
            >
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#020331] mb-6 sm:mb-8">
                  Building the Future of Healthcare
                </h2>

                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-[#020331]/80">
                  <p>
                    Founded in 2024 in Karachi, <span className="font-semibold text-[#3875FD]">MediCare</span> was born
                    from a simple yet powerful idea: no one should compromise on quality healthcare due to distance, time, or cost.
                  </p>

                  <p>
                    Today we combine the <strong>wisdom of experienced doctors</strong> with
                    <strong> state-of-the-art AI diagnostic tools</strong> to deliver faster, smarter,
                    and more affordable healthcare across Pakistan and beyond.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}