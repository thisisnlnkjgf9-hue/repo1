import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    youtubeUrl:  { type: String, required: true }, // full YouTube URL or embed URL
    isActive:    { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Podcast =
  mongoose.models.Podcast || mongoose.model('Podcast', podcastSchema);
