import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { openRazorpayCheckout, loadRazorpayScript } from '../utils/razorpay';
import {
  createOrder,
  addOrderItems,
  updateOrderPayment,
} from '../utils/supabase';
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

  const totalAmount = items.reduce((sum, item) => sum + item.ebook.price, 0);

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

    setLoading(true);
    setError('');

    try {
      await loadRazorpayScript();

      const razorpayOrderId = `ORDER_${Date.now()}`;

      const orderResponse = await createOrder({
        razorpay_order_id: razorpayOrderId,
        buyer_email: buyerInfo.email,
        buyer_name: buyerInfo.name,
        total_amount: totalAmount * 100, // Convert to paise
      });

      await addOrderItems(
        orderResponse.id,
        items.map((item) => ({
          product_id: item.ebook.id,
          product_title: item.ebook.title,
          price: item.ebook.price * 100, // Convert to paise
        }))
      );

      await openRazorpayCheckout({
        order_id: razorpayOrderId,
        name: 'Guiderr - Digital Products',
        description: `${items.length} ebook${items.length > 1 ? 's' : ''}`,
        prefill: {
          name: buyerInfo.name,
          email: buyerInfo.email,
        },
        notes: {
          order_id: orderResponse.id,
        },
        theme: {
          color: '#1e293b',
        },
        handler: async (response) => {
          try {
            await updateOrderPayment(orderResponse.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              payment_status: 'completed',
            });

            clearCart();
            navigate(`/thank-you?order_id=${razorpayOrderId}`);
          } catch (err) {
            console.error('Failed to update payment:', err);
            setError('Payment recorded but failed to update. Please contact support.');
          }
        },
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.ebook.id} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-900 text-sm">{item.ebook.title}</p>
                    <p className="text-slate-600 text-xs">₹{item.ebook.price.toLocaleString('en-IN')}</p>
                  </div>
                ))}
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
