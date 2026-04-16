import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'anonymous' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
