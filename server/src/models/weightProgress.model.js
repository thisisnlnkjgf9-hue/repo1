import mongoose from 'mongoose';

const weightProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    weight: { type: Number, default: 0 },
    waist: { type: Number, default: 0 },
    energy: { type: Number, default: 0, min: 1, max: 10 },
    digestionScore: { type: Number, default: 0, min: 0, max: 100 },
    sleepHours: { type: Number, default: 0 },
    waterGlasses: { type: Number, default: 0 },
    exerciseMinutes: { type: Number, default: 0 },
    mealFollowed: { type: Boolean, default: false },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

weightProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WeightProgress =
  mongoose.models.WeightProgress || mongoose.model('WeightProgress', weightProgressSchema);
