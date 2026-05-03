"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  ArrowRight,
  Shield,
  Stethoscope,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Brain,
  Baby,
  Eye,
  Bone,
  Activity,
  Pill,
  Menu,
  X,
  Cpu,
  Scan,
  Zap,
  BarChart3,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Starfield } from "@/components/starfield"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const slides = [
    {
      title: "AI-Powered Medical Diagnostics",
      subtitle: "Smarter Decisions. Faster Insights. Better Outcomes.",
      stats: ["AI-Enhanced Accuracy", "Real-Time Analysis", "Secure Diagnostics"],
      image:
        "https://plus.unsplash.com/premium_photo-1764687902308-52f2f22d5f2d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Intelligent Disease Detection",
      subtitle: "Spot patterns and risks earlier with AI precision.",
      image:
        "https://images.unsplash.com/photo-1606206873764-fd15e242df52?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "24/7 AI-Assisted Consultations",
      subtitle: "Connect with doctors supported by intelligent insights.",
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Smart Digital Health Records",
      subtitle: "AI-organized, instantly accessible medical history.",
      image:
        "https://images.unsplash.com/photo-1586448646505-e7bcafcd83a1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Predictive Health Insights",
      subtitle: "Anticipate health trends before they become issues.",
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Rapid AI Diagnostic Support",
      subtitle: "Faster clarity in urgent and routine cases alike.",
      image:
        "https://images.unsplash.com/photo-1758404958502-44f156617bae?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "AI-Enhanced Prescription Management",
      subtitle: "Intelligent tracking and reminders for your treatment.",
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Trustworthy AI-Augmented Care",
      subtitle: "Where artificial intelligence meets human expertise.",
      image:
        "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?auto=format&fit=crop&w=1600&q=80",
    },
  ]

  const aiFeatures = [
    { title: "AI Disease Detection", icon: Scan, desc: "Advanced pattern recognition" },
    { title: "Intelligent Reports", icon: BarChart3, desc: "Clear, structured insights" },
    { title: "Predictive Analysis", icon: Zap, desc: "Forecast health risks" },
    { title: "Smart Monitoring", icon: Activity, desc: "Continuous intelligent tracking" },
  ]

  const services = [
    { title: "Cardiology", icon: Heart },
    { title: "Neurology", icon: Brain },
    { title: "Pediatrics", icon: Baby },
    { title: "Orthopedics", icon: Bone },
    { title: "General Medicine", icon: Stethoscope },
    { title: "Diagnostics", icon: Activity },
  ]

  const doctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiologist", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80" },
    { name: "Dr. Michael Chen", specialty: "Pediatrician", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80" },
    { name: "Dr. Emily Rodriguez", specialty: "Neurologist", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80" },
    { name: "Dr. John Doe", specialty: "Cardiologist", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80" },
    { name: "Dr. Jane Smith", specialty: "Radiologist", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80" },
    { name: "Dr. David Patel", specialty: "General Physician", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80" },
  ]

  const testimonials = [
    { name: "Aisha Khan", content: "The AI insights helped detect my condition much earlier. Truly life-changing." },
    { name: "Rahul Sharma", content: "Fast, accurate reports and very easy to understand. Highly recommend." },
    { name: "Priya Patel", content: "Doctors + AI combination gives me complete confidence in my care." },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Full-screen mobile/desktop menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#020331] flex items-center justify-center"
          >
            <div className="relative w-full max-w-4xl px-8 py-12 text-center">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-8 right-8 text-[#3B75FD] hover:text-white transition"
              >
              </button>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-white mb-16"
              >
                Menu
              </motion.h2>

              <nav className="flex flex-col gap-10 text-2xl md:text-3xl">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About" },
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/contact", label: "Contact" },
                  { href: "/patients-login", label: "Patient" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      className={`block py-3 transition ${
                        item.isCta
                          ? "text-[#3B75FD] font-semibold hover:text-white"
                          : "text-white hover:text-[#3B75FD]"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hamburger trigger */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-6 right-6 z-50 p-4 bg-white/10 backdrop-blur-md rounded-full shadow-xl border border-white/10 hover:bg-white/20 transition-all"
      >
        {isMenuOpen ? (
          <X className="w-7 h-7 text-[#3B75FD]" />
        ) : (
          <Menu className="w-7 h-7 text-[#3B75FD]" />
        )}
      </button>

      <main className="bg-[#FFFDFE] text-[#000004] relative overflow-x-hidden">
        {/* Starfield Background - Calming Interactive Animation */}
        <Starfield starCount={120} speed={0.015} mouseInfluence={0.03} className="opacity-60" />

        {/* Subtle global AI pulse background */}
        <div className="fixed inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B75FD]/5 via-transparent to-[#3B75FD]/5 animate-pulse-slow" />
        </div>

        {/* ================= HERO ================= */}
        <section className="relative h-screen overflow-hidden">
  {/* Background images - always mounted, crossfade opacity */}
  <div className="absolute inset-0 z-0">
    {slides.map((slide, index) => (
      <div
        key={index}
        className={`absolute inset-0 transition-opacity duration-1400 ease-out ${
          index === currentSlide ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover brightness-95 contrast-[1.08] transition-transform duration-700 scale-105 group-hover:scale-110"
          // Preload hint (optional but helps)
          loading={index <= 2 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020331]/40 via-transparent to-[#020331]/20" />
      </div>
    ))}
  </div>

  {/* Content - updates instantly or with subtle fade */}
  <div className="relative z-10 h-full flex items-center justify-center px-6 text-center">
    <div className="max-w-5xl">
      <h1
        key={currentSlide} // re-mount for animation
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-[#020331] transition-opacity duration-800"
        style={{ opacity: currentSlide === currentSlide ? 1 : 0.7 }} // optional subtle fade
      >
        {slides[currentSlide].title}
      </h1>

      <p className="text-xl md:text-3xl mb-12 text-[#000004] opacity-90 font-light transition-opacity duration-800">
        {slides[currentSlide].subtitle}
      </p>

      {slides[currentSlide].stats && (
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
          {slides[currentSlide].stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#3B75FD]">{s.split(" ")[0]}</p>
              <p className="text-base md:text-lg opacity-80 mt-1">{s.split(" ").slice(1).join(" ")}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Button className="bg-[#3B75FD] hover:bg-[#2f5ed8] text-white px-10 py-7 rounded-2xl text-xl shadow-lg shadow-[#3B75FD]/25 transition-all hover:shadow-xl hover:shadow-[#3B75FD]/40">
          <Link href="/patients-login" className="flex items-center gap-3">
            Start Diagnosis <Cpu className="w-6 h-6" />
          </Link>
        </Button>
        <Button
  variant="outline"
  className="
    border-[#80A0B5]
    bg-[#F5F6F8]
    text-[#020331]
    hover:bg-[#EBEDF0]
    px-10 py-7
    rounded-2xl
    text-xl
  "
>
  <Link href="/about">Discover AI Care</Link>
</Button>


      </div>
    </div>
  </div>

  {/* Dots navigation */}
  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-5">
    {slides.map((_, i) => (
      <button
        key={i}
        onClick={() => setCurrentSlide(i)}
        className={`h-3.5 rounded-full transition-all duration-500 ${
          i === currentSlide
            ? "w-14 bg-[#3B75FD] shadow-lg shadow-[#3B75FD]/50"
            : "w-3.5 bg-[#80A0B5]/50 hover:bg-[#80A0B5]/80"
        }`}
      />
    ))}
  </div>
</section>

        {/* AI Features */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-[#020331]">
              Artificial Intelligence in Medicine
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aiFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm border border-[#80A0B5]/20 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-[#3B75FD]/10 transition-all group"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3B75FD]/10 flex items-center justify-center group-hover:bg-[#3B75FD]/20 transition-colors">
                    <feature.icon className="w-10 h-10 text-[#3B75FD]" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-[#020331]">{feature.title}</h3>
                  <p className="text-[#000004] opacity-75">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Health Care Solutions */}
        <section className="py-24 px-6 bg-[#FFFDFE]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-[#020331]">
              Comprehensive Medical Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.06, y: -8 }}
                    className="bg-white rounded-2xl shadow-md border border-[#80A0B5]/20 p-10 text-center transition hover:shadow-xl hover:shadow-[#3B75FD]/15"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#3B75FD]/10 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-10 h-10 text-[#3B75FD]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#020331]">{service.title}</h3>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why Trust Us */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=1200&q=80"
                alt="AI medical interface"
                className="rounded-3xl shadow-2xl w-full h-[520px] object-cover border border-[#80A0B5]/30"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-10 text-[#020331]">
                AI-Augmented Trustworthy Care
              </h2>

              <ul className="space-y-8 mb-12">
                <li className="flex items-start gap-6">
                  <Shield className="w-8 h-8 text-[#3B75FD] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-[#020331]">AI-Verified Diagnostics</h4>
                    <p className="text-[#000004] opacity-80">Multiple validation layers for confidence</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <Cpu className="w-8 h-8 text-[#3B75FD] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-[#020331]">Data-Driven Accuracy</h4>
                    <p className="text-[#000004] opacity-80">Continuously learning intelligence</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <Activity className="w-8 h-8 text-[#3B75FD] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold text-[#020331]">Clinically Assisted Intelligence</h4>
                    <p className="text-[#000004] opacity-80">Human expertise + AI precision</p>
                  </div>
                </li>
              </ul>

              <Button className="bg-[#3B75FD] hover:bg-[#2f5ed8] text-white px-10 py-7 rounded-2xl text-lg shadow-lg">
                Learn About Our AI
              </Button>
            </div>
          </div>
        </section>

        {/* Doctors */}
        <section className="py-24 px-6 bg-[#FFFDFE]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-[#020331]">
              Our Expert Medical Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {doctors.map((doctor, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-3xl shadow-lg border border-[#80A0B5]/20 overflow-hidden relative group"
                >
                  <div className="absolute top-4 right-4 bg-[#3B75FD]/90 text-white text-xs font-medium px-3 py-1 rounded-full z-10 backdrop-blur-sm">
                    AI-Assisted Care
                  </div>
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="p-8">
                    <h3 className="text-2xl font-semibold mb-2 text-[#020331]">{doctor.name}</h3>
                    <p className="text-[#3B75FD] font-medium mb-6">{doctor.specialty}</p>
                    <Button
                      variant="outline"
                      className="w-full border-[#3B75FD]/40 text-[#020331] hover:bg-[#3B75FD]/10 rounded-2xl"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-20 text-[#020331]">
              Patient Experiences
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/70 backdrop-blur-sm border border-[#80A0B5]/20 rounded-3xl p-10 shadow-md hover:shadow-xl transition-all"
                >
                  <p className="italic text-xl mb-8 text-[#000004] leading-relaxed">"{t.content}"</p>
                  <p className="font-bold text-[#020331] text-lg">{t.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-[#020331] text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">
              Begin Your AI-Supported Health Journey
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              Get intelligent insights and expert care in one place.
            </p>

            <div className="flex flex-wrap justify-center gap-10 mb-12 text-lg">
              <div className="flex items-center gap-4">
                <Phone className="w-7 h-7" />
                <span>+92 305 8813045</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-7 h-7" />
                <span>ai-care@med diagnostics.com</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-7 h-7" />
                <span>Medical Diagnostic</span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-white text-[#020331] hover:bg-gray-100 px-12 py-8 rounded-2xl text-xl shadow-2xl"
            >
              <Link href="/patients-login" className="flex items-center gap-4">
                Start Now <Cpu className="w-7 h-7" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}











// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   Heart,
//   ArrowRight,
//   Shield,
//   TrendingUp,
//   Stethoscope,
//   FileText,
//   Clock,
//   ChevronLeft,
//   ChevronRight,
//   Phone,
//   Mail,
//   MapPin,
//   Calendar,
// } from "lucide-react"

// import { Navbar } from "@/components/navbar"
// import { Footer } from "@/components/footer"
// import { Button } from "@/components/ui/button"

// export default function Home() {
//   const [currentSlide, setCurrentSlide] = useState(0)

//   const slides = [
//     {
//       title: "Your Health, Our Top Priority",
//       subtitle: "Access trusted doctors and quality healthcare anytime, anywhere.",
//       stats: ["250+ Expert Doctors", "5K+ Happy Patients", "12K+ Appointments"],
//       image:
//         "https://images.unsplash.com/photo-1580281657521-7b8d4a1f9b7a?auto=format&fit=crop&w=1600&q=80",
//     },
//     {
//       title: "Book Doctor Appointments Instantly",
//       subtitle: "Schedule in-clinic or online consultations in just a few clicks.",
//       image:
//         "https://images.unsplash.com/photo-1606206873764-fd15e242df52?auto=format&fit=crop&w=1600&q=80",
//     },
//     {
//       title: "24/7 Online Medical Consultations",
//       subtitle: "Talk to certified doctors through secure video and chat calls.",
//       image:
//         "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80",
//     },
//     {
//       title: "Secure Digital Health Records",
//       subtitle:
//         "Store, access, and manage your medical history safely in one place.",
//       image:
//         "https://images.unsplash.com/photo-1581092919534-0a6b6c7c1f2b?auto=format&fit=crop&w=1600&q=80",
//     },
//   ]




// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.js file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
