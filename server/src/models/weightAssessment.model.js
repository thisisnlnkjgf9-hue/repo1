import mongoose from 'mongoose';

const weightAssessmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    prakritiAnswers: { type: Array, default: [] },
    digestionAnswers: { type: Object, default: {} },
    lifestyleAnswers: { type: Object, default: {} },
    sleepAnswers: { type: Object, default: {} },
    scores: {
      digestion: { type: Number, default: 0 },
      lifestyle: { type: Number, default: 0 },
      sleep: { type: Number, default: 0 },
      overall: { type: Number, default: 0 }
    },
    prakriti: { type: String, default: '' },
    aiReport: { type: Object, default: {} },
    status: { type: String, default: 'completed', enum: ['in-progress', 'completed'] }
  },
  { timestamps: true }
);

export const WeightAssessment =
  mongoose.models.WeightAssessment || mongoose.model('WeightAssessment', weightAssessmentSchema);
