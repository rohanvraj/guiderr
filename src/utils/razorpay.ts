declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_dummy';

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export interface RazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  key_id?: string; // Optional, will be set by openRazorpayCheckout if not provided
  order_id: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  return new Promise<void>((resolve, reject) => {
    const checkoutOptions: RazorpayCheckoutOptions = {
      key_id: RAZORPAY_KEY_ID,
      ...options,
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        },
      },
      handler: (response: any) => {
        options.handler(response);
        resolve();
      },
    };

    try {
      const rzp = new window.Razorpay(checkoutOptions);
      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
}

export function getCommissionAmount(price: number, referralCode?: string): number {
  if (!referralCode) return 0;
  return Math.round(price * 0.1);
}
