import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllPartners, Partner } from '../utils/supabase';

export default function PartnersManagement() {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);

  // Check for existing session in localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPartners();
    }
  }, [isAuthenticated]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await getAllPartners();
      setPartners(data);
    } catch (error) {
      console.error('Failed to load partners:', error);
      alert('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';
    
    if (!ADMIN_PASSWORD) {
      alert('Admin password not configured');
      return;
    }

    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminSession', 'true');
      setAdminPassword('');
    } else {
      alert('Invalid password');
      setAdminPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
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
              Enter your admin password to access partner management
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter admin password"
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
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-slate-900">Partner Directory</h1>
              <p className="text-lg text-slate-600 mt-2">View affiliate partners and their referral codes</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>🔒 Read-Only View:</strong> To add or modify partners, use your <strong>Supabase Dashboard</strong>. 
              This page displays live partner data for reference and analytics tracking.
            </p>
          </div>

          {/* Partners List - Read Only */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <h2 className="text-2xl font-bold">
                Active Partners ({partners.length})
              </h2>
              <p className="text-slate-300 mt-1">Share referral links with your partners</p>
            </div>

            {loading && (
              <div className="p-8 text-center text-slate-600">
                Loading partners...
              </div>
            )}

            {!loading && partners.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-slate-600 mb-4">No partners yet.</p>
                <p className="text-sm text-slate-500">
                  Add your first partner in the Supabase Dashboard, then they'll appear here.
                </p>
              </div>
            )}

            {!loading && partners.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Partner Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Referral Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        UPI
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Commission Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Referral Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {partners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{partner.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                            {partner.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-sm">
                          {partner.upi_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {partner.commission_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-3 py-2 bg-slate-100 rounded-lg text-slate-900 font-mono text-xs break-all">
                            ?ref={partner.code}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Reference Card */}
          {partners.length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">📋 Quick Reference</h3>
              <p className="text-sm text-slate-700 mb-4">
                Share these referral links with your partners:
              </p>
              <div className="space-y-2">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="font-semibold text-slate-900">{partner.name}</span>
                    <code className="px-3 py-1 bg-slate-100 rounded text-slate-900 font-mono text-xs">
                      ?ref={partner.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

