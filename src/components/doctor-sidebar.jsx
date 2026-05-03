"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  LayoutDashboard,
  Users,
  FileText,
  Plus,
  Calendar,
  Menu,
  X,
} from "lucide-react";

export function DoctorSidebar({ pendingCount = 0 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   const menuItems = [
     { id: "overview", label: "Dashboard", icon: LayoutDashboard },
     { id: "availability", label: "Availability", icon: Calendar },
     { id: "appointments", label: "Appointments", icon: Calendar },
     { id: "patients", label: "My Patients", icon: Users },
    //  { id: "reports", label: "Lab Reports", icon: FileText },
     { id: "prescription", label: "Write Prescription", icon: Plus },
   ];

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorId");
    router.push("/doctor-login");
  };

  // Close mobile menu when clicking outside or navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-menu-btn md:hidden"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-[80] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-72 bg-gradient-to-b from-[#020331] to-[#0a0f4a] border-r shadow-xl
                   h-screen fixed left-0 top-0 flex flex-col z-[90]
                   ${mobileMenuOpen ? "translate-x-0 md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ borderColor: "rgba(56,117,253,0.18)" }}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B75FD] text-white rounded-lg flex items-center justify-center font-bold shadow-md">
            D
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">MediCare</h2>
            <p className="text-xs text-gray-400">Doctor Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
           {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = item.id === "overview" 
               ? activeTab === "overview" 
               : activeTab === item.id;

             return (
               <button
                 key={item.id}
                 onClick={() => {
                   if (item.id === "overview") {
                     router.push("/doctor-dashboard");
                   } else {
                     router.push(`/doctor-dashboard?tab=${item.id}`);
                   }
                   setMobileMenuOpen(false);
                 }}
                 className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-full text-left ${
                   isActive
                     ? "bg-[#3B75FD]/20 text-white border border-[#3B75FD]/30 shadow-md"
                     : "text-gray-200 hover:bg-[#0a104f]"
                 }`}
               >
                 <Icon
                   className={`w-5 h-5 transition-colors ${
                     isActive
                       ? "text-[#3B75FD]"
                       : "text-gray-400 group-hover:text-[#3B75FD]"
                   }`}
                 />
                 <span className="flex-1">{item.label}</span>
                 {item.id === "appointments" && pendingCount > 0 && (
                   <span className="ml-auto w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                     {pendingCount}
                   </span>
                 )}
               </button>
             );
           })}
        </nav>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-gray-700/50 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 
                     hover:bg-[#0a104f] font-medium transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
