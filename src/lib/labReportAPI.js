// src/lib/LabReportAPI.js
import connectDB from "@/lib/db";
import LabReport from "@/models/LabReport";

const LabReportAPI = {
  async getAll({ patientId }) {
    await connectDB();
    return LabReport.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();
  },

  async createReport(data) {
    await connectDB();
    const report = new LabReport({
      patientId: data.patientId,
      reportTitle: data.reportTitle,
      reportType: data.reportType,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      status: "pending-analysis",
      createdAt: new Date(),
    });
    await report.save();
    return report;
  },

  async getPendingReports(patientId) {
    await connectDB();
    return LabReport.find({ patientId, status: "pending-analysis" }).lean();
  },

  async updateAnalysis(reportId, analysisData) {
    await connectDB();
    const updatePayload = {
      status: "analyzed",
      analysis: {
        ...analysisData,
        analyzedAt: new Date()
      },
      updatedAt: new Date()
    };

    // If we're updating extracted text, it should be top-level or handled separately
    if (analysisData.extractedText) {
      updatePayload.extractedText = analysisData.extractedText;
      delete analysisData.extractedText;
    }

    return LabReport.findByIdAndUpdate(
      reportId,
      updatePayload,
      { new: true }
    );
  },

  async getReportById(reportId) {
    await connectDB();
    return LabReport.findById(reportId).lean();
  }
};

export default LabReportAPI;