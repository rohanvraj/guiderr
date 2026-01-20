import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShoppingCart, DollarSign, Eye } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getCreatorStats } from '../utils/supabase';

interface CreatorData {
  partner: {
    name: string;
    code: string;
    commission_rate: number;
    clicks: number;
  };
  stats: {
    totalClicks: number;
    totalSales: number;
    totalRevenuePaise: number;
    earningsPaise: number;
  };
}

export default function CreatorStatsPage() {
  const navigate = useNavigate();
  const { secretKey } = useParams<{ secretKey: string }>();
  const [data, setData] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      if (!secretKey) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[DEBUG] CreatorStatsPage - Loading stats for:', secretKey);
        const result = await getCreatorStats(secretKey);
        
        console.log('[DEBUG] CreatorStatsPage - Result:', result);
        
        if (!result) {
          console.log('[DEBUG] CreatorStatsPage - Result was null, setting notFound');
          setNotFound(true);
        } else {
          console.log('[DEBUG] CreatorStatsPage - Setting data:', result);
          setData(result);
        }
      } catch (err: any) {
        console.error('Failed to load creator stats:', err);
        console.log('[DEBUG] CreatorStatsPage - Error caught:', err.message);
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [secretKey]);

  const formatCurrency = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const referralLink = data ? `${window.location.origin}/?ref=${data.partner.code}` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-slate-600">Loading your stats...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <Eye className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Creator Not Found</h2>
            <p className="text-slate-600 mb-6">
              The secret key "{secretKey}" doesn't exist or has no tracked data yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Stats</h2>
            <p className="text-slate-600 mb-6">{error || 'Something went wrong'}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
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

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-2">
              {data.partner.name}'s Partner Dashboard
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Live tracking for your referral link
            </p>
            <div className="bg-white rounded-2xl border-2 border-slate-200 px-6 py-4 inline-block max-w-2xl">
              <code className="text-slate-900 font-mono text-sm md:text-base break-all">
                {referralLink}
              </code>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Clicks */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Total Clicks
                </h3>
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">
                {data.stats.totalClicks.toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-slate-500">
                People who visited with your link
              </p>
            </div>

            {/* Total Sales */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Total Sales
                </h3>
                <ShoppingCart className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">
                {data.stats.totalSales}
              </div>
              <p className="text-sm text-slate-500">
                Completed orders from your referrals
              </p>
            </div>

            {/* Your Earnings */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Your Earnings
                </h3>
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-4xl font-black text-purple-600 mb-2">
                {formatCurrency(data.stats.earningsPaise)}
              </div>
              <p className="text-sm text-slate-500">
                At {data.partner.commission_rate}% commission rate
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-slate-900" />
              <h2 className="text-2xl font-bold text-slate-900">Revenue Breakdown</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-semibold">Total Sales Amount</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(data.stats.totalRevenuePaise)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-semibold">Commission Rate</span>
                <span className="text-lg font-bold text-slate-900">
                  {data.partner.commission_rate}%
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                <span className="text-slate-900 font-bold">Your Commission</span>
                <span className="text-2xl font-black text-purple-600">
                  {formatCurrency(data.stats.earningsPaise)}
                </span>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>How it works:</strong> Your earnings = Total Sales Amount × {data.partner.commission_rate}% commission rate
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Share?</h3>
            <p className="text-slate-300 mb-6">
              Copy your referral link and start earning! Every purchase through your link gives you {data.partner.commission_rate}% commission.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('Referral link copied to clipboard!');
              }}
              className="px-8 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-all"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
