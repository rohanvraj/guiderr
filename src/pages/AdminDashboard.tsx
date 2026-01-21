import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EbookManager from '../components/admin/EbookManager';
import OrdersPanel from '../components/admin/OrdersPanel';
import PartnersAnalytics from '../components/admin/PartnersAnalytics';
import { authenticateAdmin } from '../utils/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'partners'>('orders');

  // Check for existing session in localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      alert('Please enter both email and password');
      return;
    }

    // Establish authenticated session with Supabase
    const authResult = await authenticateAdmin(adminEmail, adminPassword);
    
    if (authResult.success) {
      setIsAuthenticated(true);
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('adminEmail', adminEmail);
      localStorage.setItem('adminToken', adminPassword);
      setAdminEmail('');
      setAdminPassword('');
      console.log('✅ Admin authenticated successfully');
    } else {
      alert('Failed to authenticate: ' + (authResult.error || 'Invalid credentials'));
      setAdminPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminToken');
    setAdminEmail('');
    setAdminPassword('');
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-slate-900" />
              <h2 className="text-3xl font-bold text-slate-900 ml-2">Admin Access</h2>
            </div>
            <p className="text-slate-600 mb-6 text-center text-sm">
              Enter your Supabase admin credentials
            </p>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Admin password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all mb-4"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-slate-100 text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-all"
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-lg text-slate-600 mt-2">Manage orders and products</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'products'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'partners'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partners & Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {activeTab === 'orders' && <OrdersPanel />}
            {activeTab === 'products' && <EbookManager />}
            {activeTab === 'partners' && <PartnersAnalytics />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
