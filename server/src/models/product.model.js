import mongoose from 'mongoose';

const packOfferSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price:    { type: Number, required: true },
  label:    { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true },
    category:        { type: String, required: true },
    priceInr:        { type: Number, required: true },   // selling price
    originalPrice:   { type: Number, default: 0 },       // MRP / strike-through price
    discountPercent: { type: Number, default: 0 },       // e.g. 20 → 20%
    stock:           { type: Number, default: 0 },
    tags:            [{ type: String }],
    description:     { type: String, default: '' },
    image:           { type: String, default: '' },      // primary image
    images:          [{ type: String }],                 // up to 2 extra images
    packOffers:      [packOfferSchema],                  // e.g. [{quantity:4, price:999, label:'Value Pack'}]
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
