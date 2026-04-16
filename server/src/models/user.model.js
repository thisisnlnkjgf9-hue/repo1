import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    age: { type: Number, default: 0 },
    prakriti: { type: String, default: null },
    healthProfile: { type: Object, default: {} },
    authProvider: { type: String, default: 'email' },
    assessmentReports: [
      {
        type: { type: String, enum: ['prakriti', 'digestion', 'lifestyle', 'sleep', 'weight-full'] },
        assessmentId: { type: String },
        summary: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    weightGoal: {
      targetWeight: { type: Number, default: 0 },
      targetWaist: { type: Number, default: 0 },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model('User', userSchema);
