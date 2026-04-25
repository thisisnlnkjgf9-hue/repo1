import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const HeroSlide =
  mongoose.models.HeroSlide || mongoose.model('HeroSlide', heroSlideSchema);
