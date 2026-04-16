import mongoose from 'mongoose';

const therapySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    bestFor: [{ type: String }],
    duration: { type: String, required: true },
    priceInr: { type: Number, required: true },
    icon: { type: String, default: '🌿' }
  },
  { timestamps: true }
);

export const Therapy =
  mongoose.models.Therapy || mongoose.model('Therapy', therapySchema);
