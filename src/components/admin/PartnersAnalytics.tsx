import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPartnerStats } from '../../utils/supabase';

interface PartnerStat {
  partner_code: string;
  partner_name: string;
  partner_id: string | null;
  upi_id: string;
  commission_rate: number;
  total_sales: number;
  total_revenue: number;
  commission_owed: number;
}

export default function PartnersAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PartnerStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getPartnerStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load partner stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = stats.reduce((sum, stat) => sum + stat.total_sales, 0);
  const totalRevenue = stats.reduce((sum, stat) => sum + stat.total_revenue, 0);
  const totalCommission = stats.reduce((sum, stat) => sum + stat.commission_owed, 0);

  const formatCurrency = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalSales}</div>
          <div className="text-sm text-slate-600 mt-1">Total Referral Sales</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-slate-600 mt-1">Total Referral Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalCommission)}</div>
          <div className="text-sm text-slate-600 mt-1">Total Commission Owed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Partner Revenue Breakdown</h2>
        <button
          onClick={() => navigate('/admin/partners')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Manage Partners
        </button>
      </div>

      {/* Partners Table */}
      {loading && (
        <div className="p-8 text-center text-slate-600">
          Loading partner analytics...
        </div>
      )}

      {!loading && stats.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No partner sales data yet</p>
          <button
            onClick={() => navigate('/admin/partners')}
            className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
          >
            Add Your First Partner
          </button>
        </div>
      )}

      {!loading && stats.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  UPI ID
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {stats.map((stat, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-slate-50 transition-colors ${
                    !stat.partner_id ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {stat.partner_name}
                    </div>
                    {!stat.partner_id && (
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Not registered
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {stat.partner_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm">
                    {stat.upi_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-900 font-bold">
                      {stat.total_sales}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">
                    {formatCurrency(stat.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {stat.commission_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {formatCurrency(stat.commission_owed)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-left font-bold">
                  TOTAL
                </td>
                <td className="px-6 py-4 text-center font-bold">
                  {totalSales}
                </td>
                <td className="px-6 py-4 text-right font-bold">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-lg font-bold">
                  {formatCurrency(totalCommission)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Payout Note */}
      {stats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-2">💡 Payout Tracking</h3>
          <p className="text-sm text-slate-700 mb-3">
            Review the commission amounts above for your Sunday payouts. Use the UPI IDs to send payments directly.
          </p>
          <p className="text-xs text-slate-600">
            <strong>Note:</strong> Partners marked with ⚠️ have referral codes in orders but aren't registered yet. 
            Add them in the Partners Management page to track their commissions properly.
          </p>
        </div>
      )}
    </div>
  );
}
