import mongoose from 'mongoose';

const therapyPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, default: '' },
    badge: { type: String, default: '' },
    includes: [
      {
        day: { type: String, default: '' },
        therapies: [{ type: String }]
      }
    ],
    totalSessions: { type: Number, default: 1 },
    durationDays: { type: Number, default: 1 },
    actualPriceInr: { type: Number, required: true },
    offerPriceInr: { type: Number, required: true },
    resultPromise: { type: String, default: '' },
    extras: [{ type: String }],
    bestFor: { type: String, default: '' },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const TherapyPackage =
  mongoose.models.TherapyPackage || mongoose.model('TherapyPackage', therapyPackageSchema);
