"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Plus, Trash2, Download, Printer, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function PrescriptionModal({ isOpen, onClose, patientName }) {
  const [prescription, setPrescription] = useState({
    date: new Date().toISOString().split("T")[0],
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    notes: "",
    advice: "",
  })

  const handleAddMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [...prescription.medicines, { name: "", dosage: "", frequency: "", duration: "" }],
    })
  }

  const handleRemoveMedicine = (index) => {
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, i) => i !== index),
    })
  }

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescription.medicines]
    updatedMedicines[index][field] = value
    setPrescription({ ...prescription, medicines: updatedMedicines })
  }

  const handlePrint = () => window.print()

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020331]/70 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FFFDFD] shadow-2xl"
      >
        {/* ================= Header ================= */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#80A0B5]/40 bg-[#FFFDFD] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3875FD] flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#020331]">
                AI Digital Prescription
              </h2>
              <p className="text-sm text-[#80A0B5]">
                Patient: {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#80A0B5]/20 transition-colors"
          >
            <X className="w-6 h-6 text-[#000004]" />
          </button>
        </div>

        {/* ================= Content ================= */}
        <div className="p-8 space-y-6">
          {/* Prescription Info */}
          <Card className="border border-[#3875FD]/30 bg-[#3875FD]/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#80A0B5]">
                    PRESCRIPTION DATE
                  </p>
                  <input
                    type="date"
                    value={prescription.date}
                    onChange={(e) =>
                      setPrescription({ ...prescription, date: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2 text-[#000004]"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#80A0B5]">
                    PATIENT NAME
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#020331]">
                    {patientName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicines */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#020331]">
                Prescribed Medicines
              </h3>
              <Button
                onClick={handleAddMedicine}
                className="flex items-center gap-2 bg-[#3875FD] text-white hover:bg-[#3875FD]/90"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-4">
              {prescription.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#80A0B5]/40 p-4 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[#000004]">
                        Medicine Name
                      </Label>
                      <Input
                        value={medicine.name}
                        onChange={(e) =>
                          handleMedicineChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[#000004]">
                        Dosage
                      </Label>
                      <Input
                        value={medicine.dosage}
                        onChange={(e) =>
                          handleMedicineChange(index, "dosage", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="rounded-lg border border-[#80A0B5]/40 px-3 py-2 text-[#000004]"
                      value={medicine.frequency}
                      onChange={(e) =>
                        handleMedicineChange(index, "frequency", e.target.value)
                      }
                    >
                      <option value="">Frequency</option>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Thrice daily</option>
                      <option>Every 6 hours</option>
                      <option>As needed</option>
                    </select>

                    <Input
                      placeholder="Duration"
                      value={medicine.duration}
                      onChange={(e) =>
                        handleMedicineChange(index, "duration", e.target.value)
                      }
                    />
                  </div>

                  {prescription.medicines.length > 1 && (
                    <button
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-red-600 hover:bg-red-500/10 p-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-[#000004]">Medical Notes</Label>
            <textarea
              rows={3}
              className="mt-2 w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2"
              value={prescription.notes}
              onChange={(e) =>
                setPrescription({ ...prescription, notes: e.target.value })
              }
            />
          </div>

          {/* Advice */}
          <div>
            <Label className="text-[#000004]">Patient Advice</Label>
            <textarea
              rows={2}
              className="mt-2 w-full rounded-lg border border-[#80A0B5]/40 px-3 py-2"
              value={prescription.advice}
              onChange={(e) =>
                setPrescription({ ...prescription, advice: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-[#80A0B5]/40 pt-6">
            <Button
              onClick={handlePrint}
              className="flex-1 flex items-center gap-2 bg-[#80A0B5]/20 text-[#020331]"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>

            <Button className="flex-1 flex items-center gap-2 bg-[#3875FD] text-white">
              <Download className="w-4 h-4" />
              Save & Send
            </Button>

            <Button
              onClick={onClose}
              className="flex-1 border border-[#80A0B5]/40"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
