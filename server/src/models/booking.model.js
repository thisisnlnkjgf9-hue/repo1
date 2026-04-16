import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    customerName: { type: String, required: true, default: 'Unknown' },
    customerEmail: { type: String, required: true, default: 'none@none.com' },
    customerPhone: { type: String, required: true, default: '0000000000' },
    slot: { type: String, required: true },
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    fee: { type: Number, default: 0 },
    status: { type: String, default: 'confirmed' }
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
