import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { openRazorpayCheckout, loadRazorpayScript } from '../utils/razorpay';
import {
  createOrder,
  getProductByName,
  Product,
  updateOrderWithPayment,
} from '../utils/supabase';
import { createRazorpayOrderViaEdgeFunction } from '../utils/edgeFunction';
import { CartItem } from '../context/CartContext';

interface CheckoutFlowProps {
  items: CartItem[];
  onClose: () => void;
}

export default function CheckoutFlow({ items, onClose }: CheckoutFlowProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '' });
  const [showBuyerForm, setShowBuyerForm] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState('');

  // Fetch product data from Supabase on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setProductLoading(true);
        // Fetch the first product from cart to get updated pricing/info from Supabase
        const firstItem = items[0];
        if (!firstItem) {
          setProductError('No items in cart');
          return;
        }

        // Query Supabase products table by product name
        const productData = await getProductByName(firstItem.ebook.title);
        setProduct(productData);
      } catch (err: any) {
        console.error('Failed to fetch product:', err);
        setProductError(err.message || 'Failed to load product information');
      } finally {
        setProductLoading(false);
      }
    };

    if (items.length > 0) {
      fetchProduct();
    }
  }, [items]);

  if (!items.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-slate-600 mb-6">No items in cart</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Use product pricing from Supabase if available, fallback to cart items
  const totalAmount = product
    ? product.price_in_rupees * items.length
    : items.reduce((sum, item) => sum + item.ebook.price, 0);

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerInfo.name.trim() || !buyerInfo.email.trim()) {
      setError('Please enter your name and email');
      return;
    }
    setShowBuyerForm(false);
  };

  const handlePayment = async () => {
    if (!buyerInfo.email || !buyerInfo.name) {
      setError('Please enter your details');
      return;
    }

    if (!product) {
      setError('Product information not loaded. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script. Check network, CSP, and that https://checkout.razorpay.com is reachable.');
      }

      // Convert amount to paise (e.g., ₹100 = 10000 paise)
      // Ensure integer precision for database insert and Razorpay API
      const amountInPaise = Math.round(product.price_in_rupees * 100);

      // 1. Call Edge Function to create Razorpay order
      console.log('[CHECKOUT] Initiating payment', {
        product_id: product.id,
        product_name: product.name,
        amount_in_rupees: product.price_in_rupees,
        amount_in_paise: amountInPaise,
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        items_count: items.length,
      });

      const razorpayOrder = await createRazorpayOrderViaEdgeFunction({
        amount_paise: amountInPaise,
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        notes: {
          items_count: items.length,
          timestamp: new Date().toISOString(),
        },
      });

      console.log('[CHECKOUT] Order created successfully:', razorpayOrder);

      // Use delivery link from Supabase product table
      const deliveryLink = product.delivery_link;

      // 2. Check for active referral code in sessionStorage
      const referralCode = sessionStorage.getItem('active_referral') || undefined;

      // 3. Pass delivery link and referral code into the order creation
      // Create order record BEFORE opening Razorpay (persist tracking + token)
      console.log('[CHECKOUT] About to insert order to Supabase', {
        razorpay_order_id: razorpayOrder.id,
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        total_amount_paise: amountInPaise,
        total_amount_paise_type: typeof amountInPaise,
        is_integer: Number.isInteger(amountInPaise),
        notes_length: deliveryLink?.length || 0,
        referral_code: referralCode,
      });

      const orderResponse = await createOrder({
        razorpay_order_id: razorpayOrder.id,
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        total_amount_paise: amountInPaise,
        notes: deliveryLink,
        referral_code: referralCode,
      });

      console.log('[CHECKOUT] Order inserted successfully to Supabase', {
        order_id: orderResponse.id,
        public_token: orderResponse.public_token,
        public_token_length: orderResponse.public_token?.length || 0,
        razorpay_order_id: orderResponse.razorpay_order_id,
      });
      // Note: addOrderItems and updateOrderPayment would violate RLS for anonymous users
      // These operations are deferred to:
      // 1. Razorpay webhook (server-side with auth)
      // 2. Admin functions (authenticated)
      // The order is created; items and payment status will be linked after verification

      console.log('DEBUG: What is the Order ID?', razorpayOrder?.id);

      await openRazorpayCheckout({
        // Use Razorpay order ID from Edge Function
        order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Guiderr - Digital Products',
        description: `${items.length} ebook${items.length > 1 ? 's' : ''}`,
        prefill: {
          name: buyerInfo.name,
          email: buyerInfo.email,
        },
        notes: {
          // Critical: Supabase product UUID and order UUID for webhook handshake
          product_id: product.id,
          order_id: orderResponse.id,
        },
        theme: {
          color: '#1e293b',
        },
        handler: async (response) => {
          try {
            // Basic verification: ensure Razorpay returned a payment id
            if (!response || !response.razorpay_payment_id) {
              console.error('Invalid payment response from Razorpay:', response);
              setError('Payment failed: no payment confirmation received. Please contact support.');
              return;
            }

            // Persist payment details to Supabase BEFORE any state changes or redirect
            await updateOrderWithPayment({
              razorpay_order_id: razorpayOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
            });

            // Note: updateOrderPayment would violate RLS for anonymous users
            // Payment status and items will be updated via:
            // 1. Razorpay webhook (server-side with auth)
            // 2. Admin verification and processing
            // Store payment ID locally for reference
            console.log('Payment received:', response.razorpay_payment_id);

            clearCart();
            // Redirect using public_token for secure guest access to order
            navigate(`/thank-you?token=${orderResponse.public_token}`);
          } catch (err) {
            console.error('Payment handler error:', err);
            setError('Payment succeeded but database sync failed. Please contact support.');
          }
        },
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Extract error message safely
      let errorMessage = 'Payment failed. Please try again or contact support.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Provide more specific error messages
      if (errorMessage.includes('Edge Function')) {
        setError(`Backend error: ${errorMessage}`);
      } else if (errorMessage.includes('Razorpay')) {
        setError(`Payment error: ${errorMessage}`);
      } else if (errorMessage.includes('Invalid response') || errorMessage.includes('No order ID')) {
        setError(`Backend communication error: ${errorMessage}. Please try again or contact support.`);
      } else if (errorMessage.includes('status')) {
        setError(`Server error: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">Secure Checkout</h2>
          <p className="text-slate-300 text-sm mt-1">
            {items.length} item{items.length > 1 ? 's' : ''} in cart
          </p>
        </div>

        <div className="p-6 space-y-6">
          {showBuyerForm ? (
            <form onSubmit={handleBuyerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                Continue to Payment
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {productLoading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Loading product information...
                </div>
              )}

              {productError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {productError}
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {product ? (
                  // Display product data from Supabase
                  items.map((item) => (
                    <div key={item.ebook.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                      <p className="text-slate-600 text-xs">₹{product.price_in_rupees.toLocaleString('en-IN')}</p>
                    </div>
                  ))
                ) : (
                  // Fallback to cart items if product not loaded
                  items.map((item) => (
                    <div key={item.ebook.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-900 text-sm">{item.ebook.title}</p>
                      <p className="text-slate-600 text-xs">₹{item.ebook.price.toLocaleString('en-IN')}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {loading ? 'Processing...' : 'Pay Now with Razorpay'}
              </button>

              <button
                onClick={() => setShowBuyerForm(true)}
                className="w-full py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Edit Details
              </button>
            </div>
          )}
        </div>

        {!showBuyerForm && (
          <div className="px-6 pb-6 text-center text-xs text-slate-500">
            Secured by Razorpay. We never store your card details.
          </div>
        )}
      </div>
    </div>
  );
}
