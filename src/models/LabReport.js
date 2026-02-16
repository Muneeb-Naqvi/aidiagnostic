import mongoose from "mongoose"

const LabReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    reportTitle: {
      type: String,
      required: true,
      trim: true,
    },

    reportType: {
      type: String,
      enum: [
        "blood-test",
        "urine-test",
        "x-ray",
        "ultrasound",
        "mri-ct",
        "pathology",
        "other",
      ],
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      default: "application/octet-stream",
    },

    extractedText: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending-analysis", "analyzed", "failed"],
      default: "pending-analysis",
    },

    // ✅ FIXED ANALYSIS STRUCTURE
    analysis: {
      disease: { type: String },

      severity: {
        type: String,
        enum: ["mild", "moderate", "severe", "critical", "normal", "unknown"],
        default: "unknown",
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },

      recommendedDoctor: {
        type: String,
      },

      details: String,

      ranges: [
        {
          parameter: String,
          actualValue: String,
          normalRange: String,
          status: String,
        },
      ],

      suggestedSpecializations: [String],

      analyzedBy: {
        type: String,
        default: "AI",
      },

      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
)

LabReportSchema.index({ reportTitle: "text" })

export default mongoose.models.LabReport ||
  mongoose.model("LabReport", LabReportSchema)
