"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from 'sweetalert2'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Stethoscope,
  Bot,
  Clock,
  ShieldCheck
} from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Contact form submitted:", formData)
      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you! Our team will get back to you within 24 hours.',
        confirmButtonColor: '#3B75FD',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true
      })
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsSubmitting(false)
    }, 1200)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFDFD] text-[#020331]">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 md:py-28 bg-gradient-to-br from-[#020331] to-[#000004] overflow-hidden">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,117,253,0.2),transparent_60%)]" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 sm:mb-6">
                Contact <span className="text-[#3875FD]">MediCare</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                We're here 24/7 — talk to our medical team, AI assistant, or support staff
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
              {[
                {
                  icon: Stethoscope,
                  title: "Medical Emergency",
                  value: "Call 24/7 Helpline",
                  detail: "+92 321 1234567",
                  href: "tel:+923211234567",
                  color: "#3875FD"
                },
                {
                  icon: Bot,
                  title: "AI Health Assistant",
                  value: "Instant Symptom Check",
                  detail: "Available Now",
                  href: "/ai-assistant",
                  color: "#3875FD"
                },
                {
                  icon: Clock,
                  title: "Response Time",
                  value: "Usually within",
                  detail: "4–12 hours",
                  href: "#",
                  color: "#3875FD"
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={index}
                    href={item.href}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="bg-white rounded-2xl shadow-lg border border-[#80A0B5]/20 p-6 sm:p-8 text-center hover:shadow-xl hover:border-[#3875FD]/40 transition-all group"
                  >
                    <div className="bg-[#3875FD]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 group-hover:bg-[#3875FD]/20 transition-colors">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#3875FD]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#020331] mb-2">{item.title}</h3>
                    <p className="text-[#3875FD] font-medium mb-1 text-base sm:text-lg">{item.value}</p>
                    <p className="text-[#020331]/70 text-sm sm:text-base">{item.detail}</p>
                  </motion.a>
                )
              })}
            </div>

            {/* Main Contact Form + Side Info */}
            <div className="grid gap-10 lg:gap-12 lg:grid-cols-5 items-start">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-[#80A0B5]/30 p-6 sm:p-8 md:p-10"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="bg-[#3875FD]/10 p-3 sm:p-4 rounded-xl">
                    <Send className="w-7 h-7 sm:w-8 sm:h-8 text-[#3875FD]" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#020331]">Send us a Message</h2>
                    <p className="text-[#020331]/70 mt-1 text-sm sm:text-base">
                      We'll respond as soon as possible
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Dr. Ahmed Khan / Patient Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full border-[#80A0B5]/40 focus:border-[#3875FD] focus:ring-[#3875FD]/20 focus:ring-offset-0 h-11 sm:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full border-[#80A0B5]/40 focus:border-[#3875FD] focus:ring-[#3875FD]/20 focus:ring-offset-0 h-11 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Appointment query / Lab report concern / AI diagnosis help"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full border-[#80A0B5]/40 focus:border-[#3875FD] focus:ring-[#3875FD]/20 focus:ring-offset-0 h-11 sm:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Your Message
                    </Label>
                    <textarea
                      id="message"
                      rows={6}
                      className="w-full rounded-lg border border-[#80A0B5]/40 focus:border-[#3875FD] focus:ring-[#3875FD]/20 focus:ring-offset-0 px-3 sm:px-4 py-3 text-base resize-none bg-white min-h-[140px] sm:min-h-[160px]"
                      placeholder="Describe your concern, upload report reference, or ask about AI-powered diagnosis..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-[#3875FD] hover:bg-[#2e63e0] text-white py-6 sm:py-6 text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 transition-all duration-200 h-14 sm:h-14 ${
                      isSubmitting ? "opacity-80 cursor-wait" : "hover:shadow-md"
                    }`}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Side Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 bg-gradient-to-br from-[#3875FD]/5 to-[#80A0B5]/5 rounded-2xl p-6 sm:p-8 border border-[#3875FD]/20 order-first lg:order-last"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-[#020331] mb-5 sm:mb-6">Why Contact Us?</h3>

                <div className="space-y-5 sm:space-y-6 text-[#020331]/80 text-sm sm:text-base">
                  <div className="flex gap-3 sm:gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#3875FD] mt-0.5 flex-shrink-0" />
                    <p>100% secure communication & HIPAA compliant</p>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <Bot className="w-6 h-6 text-[#3875FD] mt-0.5 flex-shrink-0" />
                    <p>AI can pre-analyze your query for faster response</p>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <Clock className="w-6 h-6 text-[#3875FD] mt-0.5 flex-shrink-0" />
                    <p>Most messages answered within 4–12 hours</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}