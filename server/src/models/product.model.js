import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    priceInr: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    tags: [{ type: String }],
    description: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
