import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPriceInr: { type: Number, required: true },
    totalInr: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerName: { type: String, required: true, default: 'Unknown' },
    contactNumber: { type: String, required: true, default: '0000000000' },
    address: { type: String, required: true, default: 'No address' },
    pincode: { type: String, required: true, default: '000000' },
    status: { type: String, default: 'processing' },
    shipmentStatus: { type: String, default: 'packed' },
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    lineItems: [lineItemSchema],
    totalInr: { type: Number, required: true }
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model('Order', orderSchema);
