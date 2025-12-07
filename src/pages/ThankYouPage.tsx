import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Download, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOrderByRazorpayId, getOrderItems } from '../utils/supabase';
import { Order, OrderItem } from '../utils/supabase';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const razorpayOrderId = searchParams.get('order_id');

  useEffect(() => {
    if (!razorpayOrderId) {
      setError('No order found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await getOrderByRazorpayId(razorpayOrderId);
        if (!orderData) {
          setError('Order not found');
          return;
        }

        setOrder(orderData);
        const itemsData = await getOrderItems(orderData.id);
        setItems(itemsData);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [razorpayOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your order...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-6">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30"></div>
                <CheckCircle className="w-24 h-24 text-green-500 relative" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Payment Successful!
            </h1>

            <p className="text-xl text-slate-600 mb-8">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 mb-8 border border-slate-100 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Order Details
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-600 text-sm">Order ID</p>
                    <p className="text-slate-900 font-mono text-sm break-all">{razorpayOrderId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Email</p>
                    <p className="text-slate-900">{order.buyer_email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Name</p>
                    <p className="text-slate-900">{order.buyer_name}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Amount Paid
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                      ₹{(order.total_amount / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {order.referral_code && (
                    <div>
                      <p className="text-slate-600 text-sm">Referred by</p>
                      <p className="text-slate-900 font-semibold capitalize">{order.referral_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-4">
                Purchased Items
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{item.product_title}</p>
                      <p className="text-slate-600 text-sm">Product ID: {item.product_id}</p>
                    </div>
                    <p className="font-semibold text-slate-900">₹{(item.price / 100).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8 animate-fade-in-up">
            <div className="flex gap-4">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Check Your Email</h3>
                <p className="text-blue-800 mb-4">
                  Your ebook(s) and digital product(s) will be sent to <span className="font-semibold">{order.buyer_email}</span> within <span className="font-semibold">2-4 hours</span>.
                </p>
                <p className="text-blue-700 text-sm">
                  Please check your spam/promotions folder if you don't see the email in your inbox. Our support team manually verifies and sends all orders.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-100 rounded-xl p-6">
              <div className="flex gap-3 mb-3">
                <Download className="w-5 h-5 text-slate-700" />
                <h4 className="font-semibold text-slate-900">What to Expect</h4>
              </div>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>✓ Email confirmation of your payment</li>
                <li>✓ Download link or access credentials</li>
                <li>✓ Instant access to digital products</li>
                <li>✓ Lifetime access to purchased content</li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-xl p-6">
              <div className="flex gap-3 mb-3">
                <Mail className="w-5 h-5 text-slate-700" />
                <h4 className="font-semibold text-slate-900">Questions?</h4>
              </div>
              <p className="text-sm text-slate-700 mb-3">
                Contact our support team for any issues with delivery or access.
              </p>
              <a
                href="mailto:support@guiderr.com"
                className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-slate-700"
              >
                support@guiderr.com →
              </a>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
