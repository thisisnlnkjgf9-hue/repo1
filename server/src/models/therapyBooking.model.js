import mongoose from 'mongoose';

const therapyBookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    packageId: { type: String, default: '' },
    packageName: { type: String, default: '' },
    therapyId: { type: String, default: '' },
    therapyName: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, default: '' },
    preferredDate: { type: String, default: '' },
    totalPriceInr: { type: Number, required: true },
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    status: { type: String, default: 'confirmed', enum: ['pending', 'confirmed', 'completed', 'cancelled'] }
  },
  { timestamps: true }
);

export const TherapyBooking =
  mongoose.models.TherapyBooking || mongoose.model('TherapyBooking', therapyBookingSchema);
