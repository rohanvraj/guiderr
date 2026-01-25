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
  key_id?: string; // optional alias; the SDK expects `key` at runtime
  order_id?: string; // optional server-created Razorpay order id
  amount?: number; // amount in paise
  currency?: string; // e.g. 'INR'
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
    // Use a loose any here because Razorpay expects fields like `key`, `amount`, `currency`, or `order_id`
    const checkoutOptions: any = {
      key: options.key_id || RAZORPAY_KEY_ID,
      name: options.name,
      description: options.description,
      image: options.image,
      prefill: options.prefill,
      notes: options.notes, // Passes through notes (including Supabase order UUID for webhook)
      theme: options.theme,
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

    // Prefer order-based checkout when an order id exists.
    // Important: Do NOT pass amount/currency alongside order_id, otherwise Razorpay may treat it as a direct payment.
    if (options.order_id) {
      checkoutOptions.order_id = options.order_id;
      delete checkoutOptions.amount;
      delete checkoutOptions.currency;
    } else if (options.amount) {
      // Fallback: amount-based checkout (paise)
      checkoutOptions.amount = options.amount;
      checkoutOptions.currency = options.currency || 'INR';
    }

    try {
      console.log('FINAL CHECKOUT OPTIONS:', checkoutOptions);
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
