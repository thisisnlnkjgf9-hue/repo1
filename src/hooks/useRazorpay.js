import { api } from '../api';

export function useRazorpay() {
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  const pay = async ({ amount, onSuccess, onDismiss, onError, description = 'Nouryum Payment' }) => {
    try {
      const { order, key } = await api.createPaymentOrder({ amount, receipt: `rcpt_${Date.now()}` });

      const activeKey = RAZORPAY_KEY || key;

      if (!activeKey) {
        throw new Error('Razorpay key is missing. Please contact support.');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet and try again.');
      }

      if (!order?.id) {
        throw new Error('Unable to initialize payment order. Please try again.');
      }

      if (order?.mock) {
        throw new Error('Payment gateway is not configured correctly.');
      }

      const options = {
        key: activeKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Nouryum',
        description,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
          } catch {
            if (onError) {
              onError(new Error('Payment verification failed. Amount not charged successfully.'));
            }
            return;
          }

          if (onSuccess) {
            onSuccess(response);
          }
        },
        modal: {
          ondismiss: () => {
            if (onDismiss) {
              onDismiss();
            }
          }
        },
        theme: {
          color: '#9ba418'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        if (onError) {
          onError(new Error('Payment failed. No order was placed.'));
        }
      });
      rzp.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return { pay };
}
