"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, Calendar, ShieldCheck, User, ArrowLeft, Loader2, Landmark } from "lucide-react"
import Swal from "sweetalert2"

function MockPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")
  const patientId = searchParams.get("patientId")

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Card Form States
  const [cardholderName, setCardholderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")

  // Fetch appointment detail
  useEffect(() => {
    if (!appointmentId) {
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "Appointment ID is missing.",
        confirmButtonColor: "#3B82F6",
      }).then(() => {
        router.push("/patients-dashboard")
      })
      return
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/payments/mock-pay?appointmentId=${appointmentId}`)
        const data = await res.json()
        if (data.success) {
          setAppointment(data.data)
          // Set cardholder name default
          setCardholderName(data.data.patientName || "")
        } else {
          throw new Error(data.error || "Failed to load appointment details")
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load appointment details. Please try again.",
          confirmButtonColor: "#EF4444",
        }).then(() => {
          router.push("/patients-dashboard")
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [appointmentId, router])

  // Handle Card Number Input (Auto-spacing)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 16) value = value.slice(0, 16)
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value
    setCardNumber(formatted)
  }

  // Handle Expiry Date Input (MM/YY Auto-slash)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 4) value = value.slice(0, 4)
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`
    }
    setExpiryDate(value)
  }

  // Handle CVC Input
  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 3) value = value.slice(0, 3)
    setCvc(value)
  }

  const handleCancel = () => {
    router.push(`/patients-dashboard?payment=cancelled&appointmentId=${appointmentId}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cardholderName.trim() || cardNumber.length < 19 || expiryDate.length < 5 || cvc.length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter valid credit card details.",
        confirmButtonColor: "#F59E0B",
      })
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/payments/mock-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          cardholderName,
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiryDate,
          cvc,
        }),
      })

      const data = await res.json()

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: `Payment of Rs. ${appointment.fee} processed successfully!`,
          confirmButtonColor: "#10B981",
          timer: 2500,
          timerProgressBar: true,
        })
        router.push(`/patients-dashboard?payment=success&appointmentId=${appointmentId}`)
      } else {
        throw new Error(data.error || "Payment processing failed")
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.message || "An error occurred during payment processing.",
        confirmButtonColor: "#EF4444",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020331] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-[#3875FD] animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-300">Retrieving checkout details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020331] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl">
        
        {/* Left Column: Order Summary */}
        <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
          <div>
            <button 
              onClick={handleCancel}
              className="flex items-center text-slate-400 hover:text-white transition-colors gap-2 text-sm font-medium mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <h2 className="text-2xl font-black text-white tracking-tight">Checkout</h2>
            <p className="text-slate-400 text-sm mt-2">Mock Payment Integration Portal</p>

            <div className="mt-8 space-y-6">
              {/* Doctor details */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-[#3875FD]/20 text-[#3875FD] flex items-center justify-center font-bold text-xl">
                  Dr
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consulting Specialist</p>
                  <p className="text-lg font-bold text-white mt-0.5">{appointment?.doctorName}</p>
                </div>
              </div>

              {/* Schedule details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-slate-300">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Appointment Date</span>
                  <span className="font-semibold text-white">
                    {appointment?.scheduledDate ? new Date(appointment.scheduledDate).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-300">
                  <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /> Time Slot</span>
                  <span className="font-semibold text-white">{appointment?.scheduledTime || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Amount</p>
                <p className="text-3xl font-black text-[#3875FD] mt-1">Rs. {appointment?.fee}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE MOCK PAY
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Card Checkout Form */}
        <div className="flex flex-col justify-center">
          {/* Live Credit Card Preview */}
          <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl mb-8 overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 opacity-30 pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <Landmark className="w-8 h-8 opacity-80" />
              <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur">MOCK PAY</div>
            </div>
            
            <div className="z-10">
              {/* Card Number */}
              <div className="text-lg sm:text-xl font-mono tracking-widest text-slate-100">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
            </div>

            <div className="flex justify-between items-end z-10">
              {/* Cardholder name */}
              <div className="min-w-0 pr-4">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Cardholder Name</p>
                <p className="font-bold text-sm truncate uppercase tracking-wider">{cardholderName || "CARDHOLDER NAME"}</p>
              </div>
              
              {/* Expiration date */}
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Expires</p>
                <p className="font-bold text-sm font-mono tracking-widest">{expiryDate || "MM/YY"}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cardholder Name */}
            <div>
              <label htmlFor="cardholder" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cardholder Name
              </label>
              <input
                id="cardholder"
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#3875FD] focus:ring-1 focus:ring-[#3875FD]/30 transition-all"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardnumber" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  id="cardnumber"
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#3875FD] focus:ring-1 focus:ring-[#3875FD]/30 transition-all font-mono tracking-wider"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiration Date */}
              <div>
                <label htmlFor="expiry" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#3875FD] focus:ring-1 focus:ring-[#3875FD]/30 transition-all font-mono tracking-widest text-center"
                  required
                />
              </div>

              {/* CVV/CVC */}
              <div>
                <label htmlFor="cvc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  CVC / CVV
                </label>
                <input
                  id="cvc"
                  type="password"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="•••"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#3875FD] focus:ring-1 focus:ring-[#3875FD]/30 transition-all font-mono tracking-widest text-center"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-[#3875FD] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#3875FD]/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay Rs. {appointment?.fee} &amp; Confirm</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors py-2 font-medium"
            >
              Cancel Payment
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020331] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-[#3875FD] animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-300">Loading checkout portal...</p>
      </div>
    }>
      <MockPaymentContent />
    </Suspense>
  )
}
