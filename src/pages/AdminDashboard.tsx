import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllOrders, getOrderItems, markOrderAsDelivered, Order, OrderItem } from '../utils/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);

  const ADMIN_PASSWORD = 'guiderr123';

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      loadOrders();
    } else {
      alert('Invalid password');
      setAdminPassword('');
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      const itemsMap: Record<string, OrderItem[]> = {};
      for (const order of ordersData) {
        itemsMap[order.id] = await getOrderItems(order.id);
      }
      setOrderItemsMap(itemsMap);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const updated = await markOrderAsDelivered(orderId);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      alert('Order marked as delivered');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  useEffect(() => {
    if (!showAuthModal && isAuthenticated) {
      loadOrders();
    }
  }, [showAuthModal, isAuthenticated]);

  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Portal</h2>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all mb-4"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-all"
            >
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
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-slate-600">Manage orders and deliveries</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse mx-auto mb-4"></div>
              <p className="text-slate-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-slate-600 font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const items = orderItemsMap[order.id] || [];
                const isDelivered = order.delivery_status === 'delivered';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{order.buyer_name}</h3>
                            {isDelivered ? (
                              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Delivered
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-1">{order.buyer_email}</p>
                          <p className="text-slate-600 text-sm">
                            Order ID: <span className="font-mono text-xs">{order.razorpay_order_id}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-bold text-slate-900">
                            ₹{(order.total_amount / 100).toLocaleString('en-IN')}
                          </p>
                          <p className="text-slate-600 text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Products</p>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div key={item.id} className="text-sm text-slate-700">
                                <p className="font-medium">{item.product_title}</p>
                                <p className="text-slate-500">₹{(item.price / 100).toLocaleString('en-IN')}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-600 font-semibold mb-2">Payment Details</p>
                          <div className="space-y-1 text-sm text-slate-700">
                            <p>Status: <span className="font-semibold capitalize">{order.payment_status}</span></p>
                            {order.razorpay_payment_id && (
                              <p>Payment ID: <span className="font-mono text-xs">{order.razorpay_payment_id}</span></p>
                            )}
                            {order.referral_code && (
                              <p>Referral: <span className="font-semibold capitalize">{order.referral_code}</span></p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={`mailto:${order.buyer_email}?subject=Your Guiderr Digital Product&body=Dear ${order.buyer_name},%0A%0AThank you for your purchase! Your digital product is attached.%0A%0ABest regards,%0AGuiderr Team`}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-all"
                        >
                          <Mail className="w-4 h-4" />
                          Send Email
                        </a>

                        <button
                          onClick={() => copyToClipboard(order.buyer_email)}
                          className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
                        >
                          Copy Email
                        </button>

                        {!isDelivered && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
