import crypto from 'crypto';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/env.js';

let razorpayInstance = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
}

export function isRazorpayConfigured() {
  return !!razorpayInstance;
}

export async function createOrder(amountInr, receipt = 'order_rcpt') {
  if (!razorpayInstance) {
    return {
      id: `mock_order_${Date.now()}`,
      amount: amountInr * 100,
      currency: 'INR',
      receipt,
      status: 'created',
      mock: true
    };
  }

  const options = {
    amount: amountInr * 100,
    currency: 'INR',
    receipt
  };

  return razorpayInstance.orders.create(options);
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!RAZORPAY_KEY_SECRET) {
    return true;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}
