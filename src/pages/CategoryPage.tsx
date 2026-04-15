import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { getCategoryById } from '../utils/ebooks';
import { getProductsByCategory } from '../utils/supabase';
import { Ebook } from '../types/ebook';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EbookModal from '../components/EbookModal';

// ── Category authority statements ────────────────────────────────────────────
// Static, zero DB calls. One sentence that signals editorial authority and intent.
const CATEGORY_MISSIONS: Record<string, string> = {
  finance:       'Mastering Indian cash flow, credit optimisation, and long-term wealth systems.',
  motorcycles:   'Decision frameworks for the modern Indian rider — from city commutes to Himalayan expeditions.',
  travel:        'Travel smarter, spend less, and experience more with India\'s shifting travel landscape.',
  'gadget-tech': 'Curated intelligence on gear that earns its keep — no filler, no sponsored rankings.',
  business:      'Frameworks for founders, freelancers, and side-hustlers building in India\'s new economy.',
  'home-living': 'Smart home decisions that pay for themselves — space, comfort, and long-term value.',
};

/**
 * Converts an ebook title to a URL-safe slug.
 * "Beginner's Motorcycle Guide!" → "beginners-motorcycle-guide"
 * Used for ?ebook= deep-link params — case-insensitive, punctuation-stripped.
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function EbookCard({
  ebook,
  index,
  onOpen,
}: {
  ebook: Ebook;
  index: number;
  onOpen: (ebook: Ebook) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 ${
        isVisible && imageLoaded ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: isVisible && imageLoaded ? `${index * 50}ms` : '0ms' }}
      onClick={() => onOpen(ebook)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={optimizeCloudinaryUrl(ebook.cover, { width: 400 })}
          alt={ebook.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
            setImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-2 sm:p-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 line-clamp-2 leading-tight group-hover:text-slate-700 transition-colors">
          {ebook.title}
        </h3>
        <p className="text-[10px] sm:text-xs text-slate-600 mb-1 line-clamp-1">by {ebook.author}</p>
        <div className="text-sm sm:text-base font-bold text-slate-900">
          ₹{ebook.price.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  // ── Modal state lifted here so URL can be synced ──────────────────────────
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);

  const categoryData = category ? getCategoryById(category) : undefined;

  // Map category slug to PascalCase for Supabase lookup
  const categoryMapping: Record<string, string> = {
    'motorcycles': 'Motorcycles',
    'finance': 'Finance',
    'travel': 'Travel',
    'pets': 'Pets',
    'beauty-wellness': 'Beauty & Wellness',
    'art': 'Art',
    'business': 'Business',
    'gadget-tech': 'Gadget & Tech',
    'home-living': 'Home & Living',
  };

  // React Query caches by ['products', category] — navigating back won't re-fetch within staleTime.
  const { data: ebooks = [], isLoading: loading } = useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const categoryName = categoryMapping[category!] || category!;
      const products = await getProductsByCategory(categoryName);
      return products.map((product): Ebook => ({
        id: product.id,
        title: product.name,
        author: product.author || 'Guiderr',
        price: product.price_in_rupees,
        cover: product.cover_image_url || '/covers/placeholder.svg',
        pdf: product.delivery_link,
        category: category!,
        synopsis: product.name,
        downloadLink: product.delivery_link,
      }));
    },
    enabled: !!category && !!categoryData,
  });

  // ON LOAD: if URL contains ?ebook=[slug], auto-open that ebook's modal.
  // Runs after ebooks are fetched (ebooks.length > 0 guard prevents false negatives).
  // Uses the cached React Query data — zero extra API calls.
  useEffect(() => {
    if (ebooks.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const ebookParam = params.get('ebook');
    if (!ebookParam) return;
    // Case-insensitive slug match — robust against minor title variations
    const match = ebooks.find((e) => toSlug(e.title) === ebookParam);
    if (match) setSelectedEbook(match);
  }, [ebooks]);

  // ON SELECTION: write ?ebook=[slug] to URL, preserving any ?ref= partner code.
  const handleOpen = (ebook: Ebook) => {
    setSelectedEbook(ebook);
    const params = new URLSearchParams(window.location.search);
    params.set('ebook', toSlug(ebook.title));
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  // ON CLOSE: remove ?ebook= from URL, preserving any ?ref= partner code.
  const handleClose = () => {
    setSelectedEbook(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('ebook');
    const remaining = params.toString();
    window.history.replaceState(
      null,
      '',
      remaining ? `${window.location.pathname}?${remaining}` : window.location.pathname
    );
  };

  if (!category || !categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Category Not Found</h1>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
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
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="mb-12 sm:mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              {categoryData.name}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mb-3">
              {categoryData.description}
            </p>
            {/* Mission statement — authority signal, always static */}
            {CATEGORY_MISSIONS[category] && (
              <p className="text-sm font-medium text-teal-700 border-l-2 border-teal-400 pl-3 max-w-2xl mb-6">
                {CATEGORY_MISSIONS[category]}
              </p>
            )}
            {/* Start Here CTA — visible guide for new visitors */}
            <Link
              to="/start-here"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              New here? Start Here →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-slate-400 text-lg">Loading ebooks...</div>
            </div>
          ) : ebooks.length === 0 ? (
            // ── Empty category state (Day 9 audit) ────────────────────────────────────
            // Shows a professional "Coming Soon" with guide navigation so users never
            // hit a dead-end page. Zero new Supabase calls — static links only.
            <div className="text-center py-16 max-w-md mx-auto">
              <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Ebooks Coming Soon</h3>
              <p className="text-slate-600 text-lg mb-8">
                We're putting the finishing touches on titles in this category. Check back soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/guides"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all"
                >
                  Browse Free Guides →
                </Link>
                <Link
                  to="/start-here"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-full hover:bg-slate-50 transition-all"
                >
                  New here? Start Here →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {ebooks.map((ebook, index) => (
                <EbookCard key={ebook.id} ebook={ebook} index={index} onOpen={handleOpen} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Single page-level modal — opened/closed via URL-synced state */}
      {selectedEbook && (
        <EbookModal ebook={selectedEbook} onClose={handleClose} />
      )}

      <Footer />
    </div>
  );
}
