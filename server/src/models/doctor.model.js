import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qualifications: { type: String, required: true },
    specialization: { type: String, required: true },
    yearsExperience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Doctor =
  mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
