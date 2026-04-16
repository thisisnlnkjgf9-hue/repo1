import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    disease: { type: String, default: '' },
    message: { type: String, required: true },
    reply: { type: String, required: true }
  },
  { timestamps: true }
);

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
