import mongoose from 'mongoose';

const sitePageSchema = new mongoose.Schema(
  {
    slug:    { type: String, required: true, unique: true }, // 'about' | 'contact' | 'tnc'
    title:   { type: String, default: '' },
    content: { type: String, default: '' },   // rich-text / markdown stored as HTML or plain text
  },
  { timestamps: true }
);

export const SitePage =
  mongoose.models.SitePage || mongoose.model('SitePage', sitePageSchema);
