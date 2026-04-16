import mongoose from 'mongoose';

const symptomSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    disease: { type: String, required: true },
    generatedQuestions: { type: Array, default: [] },
    answers: { type: Array, default: [] },
    analysis: { type: Object, default: {} }
  },
  { timestamps: true }
);

export const SymptomSession =
  mongoose.models.SymptomSession || mongoose.model('SymptomSession', symptomSessionSchema);
