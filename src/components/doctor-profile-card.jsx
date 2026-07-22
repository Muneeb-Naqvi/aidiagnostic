"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Clock,
  User,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorProfileCard({
  doctor,
  onBookAppointment,
  isBooking = false,
  report = null,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";
  };

  const formatExperience = (years) => {
    return years === 1 ? "1 year" : `${years} years`;
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    onBookAppointment(doctor, report);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Doctor Card - Always Visible */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#3875FD]/50 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={handleBookClick}>
        <div className="flex items-center justify-between gap-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-blue-100 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3875FD] to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {getInitials(doctor.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-black truncate">
                Dr. {doctor.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {doctor.degree && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    {doctor.degree}
                  </span>
                )}
                <span className="text-xs text-black flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {doctor.specialization}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-black">
                {doctor.experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatExperience(doctor.experience)}
                  </span>
                )}
                {doctor.gender && (
                  <span className="flex items-center gap-1 capitalize">
                    <User className="h-3 w-3" />
                    {doctor.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBookClick}
            disabled={isBooking}
            className="bg-[#3875FD] hover:bg-[#2f66e6] text-white rounded-xl px-4 py-2 font-medium flex-shrink-0 cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isBooking ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </div>

      {/* Hover Profile Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 right-0 top-full mt-2 w-full max-w-md"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#020331] to-[#0a0f4a] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                        {getInitials(doctor.name)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-bold">Dr. {doctor.name}</h4>
                      <p className="text-blue-200 text-sm">
                        {doctor.degree && `${doctor.degree}, `}{doctor.specialization}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHovered(false);
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                {/* Experience & Gender */}
                <div className="flex items-center gap-4 text-sm">
                  {doctor.experience > 0 && (
                    <div className="flex items-center gap-1.5 text-black">
                      <Award className="h-4 w-4 text-[#3875FD]" />
                      <span className="font-medium">{formatExperience(doctor.experience)}</span>
                    </div>
                  )}
                  {doctor.gender && (
                    <div className="flex items-center gap-1.5 text-black">
                      <User className="h-4 w-4 text-[#3875FD]" />
                      <span className="font-medium capitalize">{doctor.gender}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {doctor.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Phone className="h-4 w-4 text-[#3875FD]" />
                      <span>{doctor.phoneNumber}</span>
                    </div>
                  )}
                  {doctor.whatsappNumber && (
                    <div className="flex items-center gap-2 text-sm text-black">
                      <span className="text-green-500 text-base">💬</span>
                      <span>{doctor.whatsappNumber}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Mail className="h-4 w-4 text-[#3875FD]" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                  )}
                  {doctor.website && (
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Globe className="h-4 w-4 text-[#3875FD]" />
                      <a
                        href={doctor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#3875FD] truncate"
                      >
                        <span className="truncate">Website</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {doctor.bio && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm text-black line-clamp-2">{doctor.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
