import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title:    { type: String, default: '' },
    subtitle: { type: String, default: '' },
    label:    { type: String, default: '' },  // used for product slides (e.g. "Natural Oils")
    image:    { type: String, required: true },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    type:     { type: String, enum: ['hero', 'product'], default: 'hero' }
  },
  { timestamps: true }
);

export const HeroSlide =
  mongoose.models.HeroSlide || mongoose.model('HeroSlide', heroSlideSchema);
