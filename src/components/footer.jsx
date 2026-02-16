"use client"

import { Heart, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-24 bg-[#020331] text-[#80A0B5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#3875FD]/10 border border-[#3875FD]/20">
                <Heart className="w-6 h-6 text-[#3875FD]" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                MediCare
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#80A0B5]/90 max-w-xs">
              Modern healthcare platform connecting hospitals, doctors, 
              patients and AI-powered diagnostics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Our Services", href: "/services" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[#3875FD] hover:underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h4>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#3875FD] mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:support@medicare.pk"
                  className="hover:text-[#3875FD] transition-colors"
                >
                  medicaldiagnostic@medicare.pk
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#3875FD] mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+9221123456789"
                  className="hover:text-[#3875FD] transition-colors"
                >
                  +92 305 8813045
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3875FD] mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">
                  Medical Diagnostic, Kohinoor<br />
                  Faisalabad, Punjab, Pakistan
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h4>

            <ul className="space-y-3 text-sm">
              {[
                "Help & FAQs",
                "AI Diagnosis Guide",
                "Privacy Policy",
                "Terms of Service",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#3875FD] hover:underline underline-offset-4"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#3875FD]/10 text-center">
          <p className="text-sm text-[#80A0B5]">
            © {new Date().getFullYear()} MediCare. All rights reserved.
          </p>
          
          <p className="mt-2 text-xs text-[#80A0B5]/80">
            Empowering Healthcare with Artificial Intelligence
          </p>
        </div>

      </div>
    </footer>
  )
}