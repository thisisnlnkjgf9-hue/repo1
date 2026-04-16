import mongoose from 'mongoose';

const reportUploadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    reportFileName: { type: String, required: true },
    reportFileType: { type: String, default: 'application/octet-stream' },
    reportFileSize: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ReportUpload =
  mongoose.models.ReportUpload || mongoose.model('ReportUpload', reportUploadSchema);
