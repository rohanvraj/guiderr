import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EbookModal from '../components/EbookModal';
import { getAllProducts, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { Ebook } from '../types/ebook';

// Maps raw DB category values → user-facing display labels.
// The raw value is always used for filtering; only the rendered text changes.
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  Finance: 'Personal Finance',
};

function toEbook(p: Product): Ebook {
  return {
    id: p.id,
    title: p.name,
    author: p.author || 'Guiderr',
    price: p.price_in_rupees,
    cover: p.cover_image_url || '/covers/placeholder.svg',
    coverImage: p.cover_image_url,
    pdf: '',
    category: p.category || '',
    synopsis: p.description || p.name,
  };
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (e: Ebook) => void;
}) {
  return (
    <button
      onClick={() => onOpen(toEbook(product))}
      className="group text-left w-full bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white/10">
        <img
          src={optimizeCloudinaryUrl(product.cover_image_url || '', { width: 400 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
          }}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-bold text-white leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-white/60 mb-2">by {product.author || 'Guiderr'}</p>
        <p className="text-base font-bold text-white">
          ₹{product.price_in_rupees.toLocaleString('en-IN')}
        </p>
      </div>
    </button>
  );
}

export default function Library() {
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    const prev = document.title;
    document.title = 'Library | Guiderr — Intelligence Vault';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) {
      meta.content =
        'Download premium ebooks, blueprints, and checklists on Motorcycles, Personal Finance, Travel and more. From ₹99.';
    }
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['library-all-products'],
    queryFn: getAllProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Derive unique categories from live data — alphabetical, no hardcoding.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    products.forEach((p) => { if (p.category) seen.add(p.category); });
    return ['All', ...Array.from(seen).sort()];
  }, [products]);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const handleOpen = (ebook: Ebook) => setSelectedEbook(ebook);
  const handleClose = () => setSelectedEbook(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2f2f2f' }}>
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">
        {/* ── Page header ── */}
        <div className="group relative mb-12">
          {/* Ghost "LIBRARY" — white at 8% opacity, CSS transition only */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-0 select-none font-black uppercase leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:translate-x-8"
            style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', color: '#ffffff', opacity: 0.08 }}
          >
            LIBRARY
          </span>

          <div className="relative z-10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60 mb-5">
              The latest
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.06] mb-4">
              Premium Blueprints.<br className="hidden sm:block" /> From ₹99.
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
              Ebooks, checklists, and frameworks for smarter decisions on motorcycles, money, and modern life.
            </p>
          </div>
        </div>

        {/* ── Category filter pills — matches /guides design ── */}
        {!isLoading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-white text-slate-900'
                    : 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
                }`}
              >
                {CATEGORY_DISPLAY_MAP[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Product grid ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-sm p-14 text-center">
            <p className="text-white/70 text-lg leading-relaxed">
              {activeCategory === 'All'
                ? 'New titles launching this week. Check back soon.'
                : `No ${CATEGORY_DISPLAY_MAP[activeCategory] ?? activeCategory} titles yet. More coming soon!`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={handleOpen} />
            ))}
          </div>
        )}

        <div className="pt-16 text-center">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            ← Free Guides
          </Link>
        </div>
      </main>

      {selectedEbook && <EbookModal ebook={selectedEbook} onClose={handleClose} />}

      <Footer />
    </div>
  );
}
