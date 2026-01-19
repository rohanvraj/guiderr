import { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ebooksData from '../data/ebooks.json';

interface PurchasedEbook {
  id: string;
  title: string;
  author: string;
  downloadLink: string;
}

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse query parameters OR fall back to localStorage (for Razorpay Webstore redirects)
  const ebooksParam = searchParams.get('ebooks') || 
                     localStorage.getItem('purchasedEbookIds') || 
                     '';
  const refCode = searchParams.get('ref') || 
                 localStorage.getItem('referralCode');

  // Parse ebook IDs from comma-separated string
  const ebookIds = useMemo(() => {
    return ebooksParam
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }, [ebooksParam]);

  // Match ebook IDs to ebook data
  const purchasedEbooks = useMemo(() => {
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

  // Clean up localStorage after component mounts (thank you page viewed)
  useEffect(() => {
    if (ebooksParam && !searchParams.get('ebooks')) {
      // Data came from localStorage (Razorpay redirect), clear it after display
      localStorage.removeItem('purchasedEbookIds');
      localStorage.removeItem('referralCode');
    }
  }, [ebooksParam, searchParams]);

  // Handle case where no ebooks are provided
  if (ebookIds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <p className="text-lg text-slate-600 font-semibold mb-6">
              No ebooks specified in order
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              Back to Store
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

            <p className="text-lg text-slate-700 font-semibold">
              You've purchased {purchasedEbooks.length}{' '}
              {purchasedEbooks.length === 1 ? 'ebook' : 'ebooks'}
            </p>

            {refCode && (
              <p className="text-slate-600 mt-3">
                Bought via <span className="font-semibold text-slate-900 capitalize">{refCode}</span>
              </p>
            )}
          </div>

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

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8 animate-fade-in-up">
            <div className="flex gap-4">
              <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">What to Expect</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>✓ Instant access to your ebook(s) via the download links above</li>
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
              If you experience any issues downloading or accessing your ebooks, our support team is here to help.
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
