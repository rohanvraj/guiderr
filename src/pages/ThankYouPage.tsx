import { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ebooksData from '../data/ebooks.json';
import { getOrderByRazorpayId, getOrderItems, getOrderByPublicToken, Order, OrderItem } from '../utils/supabase';

interface PurchasedEbook {
  id: string;
  title: string;
  author: string;
  downloadLink: string;
}

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestOrderData, setGuestOrderData] = useState<any>(null);

  // ============================================================================
  // TEMPORARY: Supabase Connection Test (Remove after verification)
  // ============================================================================
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ Supabase env vars missing');
          console.error('  - VITE_SUPABASE_URL:', supabaseUrl ? '✓ set' : '✗ missing');
          console.error('  - VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ set' : '✗ missing');
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test query: Fetch 1 ebook from the table
        console.log('🔄 Testing Supabase connection...');
        const { data, error: queryError } = await supabase
          .from('ebooks')
          .select('*')
          .limit(1);

        if (queryError) {
          console.error('❌ Supabase query failed:', queryError);
        } else {
          console.log('✅ Supabase connection successful!');
          console.log('   Sample ebook data:', data);
        }
      } catch (err) {
        console.error('❌ Supabase connection error:', err);
      }
    };

    testSupabaseConnection();
  }, []); // Runs once on component mount
  // ============================================================================
  // END TEMPORARY TEST
  // ============================================================================

  // Priority 1: Check for public_token parameter (from CheckoutFlow - new secure token method)
  const publicToken = searchParams.get('token');
  
  // Priority 2: Check for order_id parameter (from CheckoutFlow - legacy method)
  const orderId = searchParams.get('order_id');
  
  // Priority 3: Check for ebooks parameter (URL query params or Webstore)
  const ebooksParam = searchParams.get('ebooks') || 
                     localStorage.getItem('purchasedEbookIds') || 
                     '';
  const refCode = searchParams.get('ref') || 
                 localStorage.getItem('referralCode');

  // Fetch order data using public token (new secure method)
  useEffect(() => {
    if (!publicToken) {
      return;
    }

    const fetchOrderDataByToken = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const order = await getOrderByPublicToken(publicToken);
        
        // DEBUG: Log what we fetched from the database
        console.log('🔍 Fetched Order by Token:', order);
        console.log('   Token:', publicToken);
        console.log('   Notes (Google Drive link):', order?.notes);
        
        if (!order) {
          console.error('❌ Order not found for token:', publicToken);
          setError('Order not found. Please check your link and try again.');
          setLoading(false);
          return;
        }

        console.log('✅ Order found! Setting guest order data:', order);
        setGuestOrderData(order);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch order by token:', err);
        setError(err.message || 'Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDataByToken();
  }, [publicToken]);

  // Fetch order data if order_id is provided (legacy method for backward compatibility)
  useEffect(() => {
    if (!orderId || publicToken) {
      // Skip if we have a token (new method takes priority)
      return;
    }

    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const order = await getOrderByRazorpayId(orderId);
        
        if (!order) {
          setError('Order not found in system');
          setLoading(false);
          return;
        }

        setOrderData(order);

        // Fetch order items
        const items = await getOrderItems(order.id);
        setOrderItems(items);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, publicToken]);

  // Parse ebook IDs from comma-separated string (for URL params or localStorage)
  const ebookIds = useMemo(() => {
    return ebooksParam
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }, [ebooksParam]);

  // Match ebook IDs to ebook data (used when no order_id)
  const purchasedEbooksFromParams = useMemo(() => {
    return ebookIds
      .map((id) => {
        const ebook = ebooksData.ebooks.find((e) => e.id === id);
        if (!ebook) return null;
        return {
          id: ebook.id,
          title: ebook.title,
          author: ebook.author,
          downloadLink: ebook.downloadLink,
        };
      })
      .filter((ebook) => ebook !== null) as PurchasedEbook[];
  }, [ebookIds]);

  // Convert order items to ebook data
  const purchasedEbooksFromOrder = useMemo(() => {
    return orderItems
      .map((item) => {
        const ebook = ebooksData.ebooks.find((e) => e.id === item.product_id);
        if (!ebook) return null;
        return {
          id: ebook.id,
          title: ebook.title,
          author: ebook.author,
          downloadLink: ebook.downloadLink,
        };
      })
      .filter((ebook) => ebook !== null) as PurchasedEbook[];
  }, [orderItems]);

  // For token-based guest checkout, show a simple download link from notes
  const guestDownloadLink = useMemo(() => {
    if (guestOrderData && guestOrderData.notes) {
      console.log('✅ Guest download link found:', guestOrderData.notes);
      return guestOrderData.notes;
    }
    console.log('⚠️ No guest download link. guestOrderData:', guestOrderData);
    return null;
  }, [guestOrderData]);

  // Use order-based ebooks if available, otherwise fall back to params
  const purchasedEbooks = orderId && orderData ? purchasedEbooksFromOrder : purchasedEbooksFromParams;

  // Clean up localStorage after component mounts (thank you page viewed)
  useEffect(() => {
    if (ebooksParam && !searchParams.get('ebooks')) {
      // Data came from localStorage (Razorpay redirect), clear it after display
      localStorage.removeItem('purchasedEbookIds');
      localStorage.removeItem('referralCode');
    }
  }, [ebooksParam, searchParams]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="inline-block mb-6">
              <div className="animate-spin">
                <CheckCircle className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <p className="text-lg text-slate-600 font-semibold mb-2">
              Loading your order details...
            </p>
            <p className="text-sm text-slate-500">
              Please wait while we retrieve your purchased ebooks.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error state
  // NOTE: guestOrderData with notes is valid! Don't show error if we have it
  if (error || (orderId && !orderData) || (publicToken && !guestOrderData && !loading)) {
    console.log('❌ Error state triggered:', { error, orderId, orderData, publicToken, guestOrderData, loading });
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md bg-white rounded-2xl p-8 border-2 border-red-100">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Unable to Load Order
            </h2>
            <p className="text-slate-600 mb-6">
              {error || 'We could not find your order in our system.'}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">This sometimes happens if:</span>
              </p>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li>• Your payment is still being processed</li>
                <li>• There was a network delay</li>
                <li>• Your browser blocked loading the page</li>
              </ul>
              <div className="border-t border-slate-200 pt-6 mt-6">
                <p className="text-sm text-slate-600 mb-4">
                  Please contact our support team and we'll help immediately:
                </p>
                <a
                  href="mailto:support@guiderr.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
                >
                  support@guiderr.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle case where no ebooks are provided AND no guest download link
  // NOTE: If we have guestOrderData with notes, we should show success! Don't block here
 if (purchasedEbooks.length === 0 && !guestDownloadLink && !loading && !publicToken) {
    console.log('⚠️ No purchase data: purchasedEbooks empty, no guest link, no token');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md bg-white rounded-2xl p-8 border-2 border-amber-100">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No Purchase Data Found
            </h2>
            <p className="text-slate-600 mb-6">
              We couldn't find any ebook information in this link. This can happen if you're visiting this page directly.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all w-full justify-center"
              >
                <ArrowRight className="w-5 h-5" />
                Back to Store
              </button>
              <a
                href="mailto:support@guiderr.com"
                className="block text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Need help? Contact support
              </a>
            </div>
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
          {/* Success Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30"></div>
                <CheckCircle className="w-24 h-24 text-green-500 relative" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              Purchase Successful!
            </h1>

            <p className="text-xl text-slate-600 mb-2">
              Thank you for your purchase! 🎉
            </p>

            {guestDownloadLink ? (
  <p className="text-lg text-slate-700 font-semibold">
    Your content is ready for access below.
  </p>
) : (
  <p className="text-lg text-slate-700 font-semibold">
    You've purchased {purchasedEbooks.length}{' '}
    {purchasedEbooks.length === 1 ? 'ebook' : 'ebooks'}
  </p>
)}
            {refCode && (
              <p className="text-slate-600 mt-3">
                Bought via <span className="font-semibold text-slate-900 capitalize">{refCode}</span>
              </p>
            )}
          </div>

          {/* Special rendering for guest checkout with public token */}
          {guestDownloadLink && guestOrderData ? (
            <>
              {/* Guest Order Summary */}
              <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 mb-8 border border-slate-100 animate-fade-in-up">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-4">
                  Order Details
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-slate-700 font-medium">Buyer Name:</span>
                    <span className="text-slate-900 font-semibold">{guestOrderData.buyer_name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-700 font-medium">Amount Paid:</span>
                    <span className="text-slate-900 font-semibold">
                      ₹{(guestOrderData.total_amount_paise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-700 font-medium">Order Date:</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(guestOrderData.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guest Checkout Download Link */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl shadow-lg p-8 sm:p-12 mb-8 animate-fade-in-up">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-slate-900">
                      Access Your Purchase
                    </h2>
                  </div>
                  <p className="text-slate-600">
                    Click below to access your purchased content:
                  </p>
                </div>

                <a
  href={guestDownloadLink}
  target="_blank"
  rel="noopener noreferrer"
  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all duration-200 text-lg shadow-md hover:shadow-lg"
>
  <Download className="w-5 h-5" />
  Download Your eBook Now
</a>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">📝 Note:</span> This link is for your personal use. Please do not share with others.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Purchase Summary Card */}
              <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 mb-8 border border-slate-100 animate-fade-in-up">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-6">
                  Purchased Ebooks ({purchasedEbooks.length})
                </p>

                <div className="space-y-3">
                  {purchasedEbooks.map((ebook) => (
                    <div
                      key={ebook.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <h3 className="font-semibold text-slate-900">{ebook.title}</h3>
                      <p className="text-slate-600 text-sm">By {ebook.author}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Links Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl shadow-lg p-8 sm:p-12 mb-8 animate-fade-in-up">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-slate-900">
                      Download Your Ebooks
                    </h2>
                  </div>
                  <p className="text-slate-600">
                    Click the button below to access your purchased ebook(s):
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {purchasedEbooks.map((ebook) => (
                    <a
                      key={ebook.id}
                      href={ebook.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl p-4 border border-emerald-100 hover:border-emerald-400 transition-colors flex items-center justify-between hover:shadow-md"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {ebook.title}
                        </h3>
                        <p className="text-slate-600 text-sm">By {ebook.author}</p>
                      </div>
                      <button
                        className="ml-4 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(ebook.downloadLink, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Download
                      </button>
                    </a>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">📝 Note:</span> These links are for your personal use. Please do not share with others.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8 animate-fade-in-up">
            <div className="flex gap-4">
              <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">What to Expect</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>✓ Instant access to your content via download links</li>
                  <li>✓ Lifetime access to all purchased content</li>
                  <li>✓ Future updates and improvements included</li>
                  <li>✓ Email support for any technical issues</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-slate-100 rounded-xl p-6 mb-8 border border-slate-200">
            <div className="flex gap-3 mb-3">
              <ExternalLink className="w-5 h-5 text-slate-700 flex-shrink-0 mt-1" />
              <h3 className="font-semibold text-slate-900">Questions or Issues?</h3>
            </div>
            <p className="text-sm text-slate-700 mb-3">
              If you experience any issues downloading or accessing your content, our support team is here to help.
            </p>
            <a
              href="mailto:support@guiderr.com"
              className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:text-slate-700 transition-colors"
            >
              support@guiderr.com →
            </a>
          </div>

          {/* Continue Shopping Button */}
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
