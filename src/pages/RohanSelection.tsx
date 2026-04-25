import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EbookModal from '../components/EbookModal';
import { getAllProducts, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { INVENTORY, InventoryItem } from '../data/inventory';
import { Ebook } from '../types/ebook';

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// Category slug → human-readable label
const CATEGORY_LABELS: Record<string, string> = {
  laptops: 'LAPTOPS',
  'vlogging-cameras': 'CAMERAS',
  investing: 'INVESTING',
  finance: 'FINANCE',
  motorcycles: 'MOTORCYCLES',
  travel: 'TRAVEL',
};

function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').toUpperCase();
}

// ── Affiliate card ───────────────────────────────────────────────────────────

function AffiliateCard({ item }: { item: InventoryItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Affiliate badge */}
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest bg-black/50 text-white/70 rounded-full px-2 py-0.5">
          Ad
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {item.displayCategory}
        </p>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
          {item.name}
        </h3>
        <p className="text-xs text-white/60 leading-snug line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
          <span className="text-base font-extrabold text-white">{item.price}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7178AB] group-hover:text-white transition-colors">
            CHECK OFFER →
          </span>
        </div>
      </div>
    </a>
  );
}

// ── Ebook card ───────────────────────────────────────────────────────────────

function EbookCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (e: Ebook) => void;
}) {
  return (
    <button
      onClick={() => onOpen(toEbook(product))}
      className="group text-left flex flex-col bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black/20">
        <img
          src={optimizeCloudinaryUrl(product.cover_image_url || '', { width: 400 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
          }}
        />
        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-[#7178AB]/80 text-white rounded-full px-2 py-0.5">
          Brief
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1">
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>
        <p className="text-xs text-white/60">by {product.author || 'Guiderr'}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <span className="text-base font-extrabold text-white">
            ₹{product.price_in_rupees.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7178AB] group-hover:text-white transition-colors">
            BUY →
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RohanSelection() {
  const { category } = useParams<{ category?: string }>();
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenEbook = (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setSearchParams({ ebook: ebook.id }, { replace: true });
  };
  const handleCloseEbook = () => {
    setSelectedEbook(null);
    setSearchParams({}, { replace: true });
  };

  // Ebooks from Supabase (zero extra DB hits — reuses Library query cache key)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['library-all-products'],
    queryFn: getAllProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Ghost word: category name or "SELECTION"
  const ghostWord = category ? categoryLabel(category) : 'SELECTION';

  // Filtered affiliate items
  const filteredInventory = useMemo<InventoryItem[]>(() => {
    if (!category) return INVENTORY;
    return INVENTORY.filter((item) => item.category === category);
  }, [category]);

  // Filtered ebooks — map category slug to DB category string
  const SLUG_TO_DB_CATEGORY: Record<string, string> = {
    investing: 'Investing',
    finance: 'Finance',
    motorcycles: 'Motorcycles',
    travel: 'Travel',
    tech: 'Tech',
    lifestyle: 'Lifestyle',
  };
  const filteredEbooks = useMemo<Product[]>(() => {
    if (!category) return products;
    const dbCat = SLUG_TO_DB_CATEGORY[category];
    if (!dbCat) return [];
    return products.filter((p) => p.category === dbCat);
  }, [category, products]);

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = category
      ? `${categoryLabel(category)} — Rohan Selection | Guiderr`
      : 'Rohan Selection | Guiderr — Curated Picks';
    return () => { document.title = prev; };
  }, [category]);

  // Category tabs — unique slugs from inventory + known ebook slugs
  const allCategorySlugs = useMemo(() => {
    const fromInventory = [...new Set(INVENTORY.map((i) => i.category))];
    const fromEbooks = [...new Set(
      products
        .map((p) => Object.entries(SLUG_TO_DB_CATEGORY).find(([, v]) => v === p.category)?.[0])
        .filter(Boolean) as string[]
    )];
    return [...new Set([...fromInventory, ...fromEbooks])];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const hasContent = filteredInventory.length > 0 || filteredEbooks.length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#7178AB' }}>
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Page header with ghost word ── */}
        <div className="group relative mb-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-0 select-none font-black uppercase leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:translate-x-8"
            style={{ fontSize: 'clamp(3.5rem, 11vw, 7.5rem)', color: '#ffffff', opacity: 0.08 }}
          >
            {ghostWord}
          </span>

          <div className="relative z-10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60 mb-5">
              Curated by Rohan
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.06] mb-4">
              {category ? categoryLabel(category) : 'The Selection.'}
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
              {category
                ? `Hand-picked ${categoryLabel(category).toLowerCase()} — gear I personally use or recommend.`
                : 'Every product I recommend. Gear, briefs, and books — across all channels.'}
            </p>
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            to="/rohan-selection"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !category
                ? 'bg-white text-slate-900'
                : 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
            }`}
          >
            All
          </Link>
          {allCategorySlugs.map((slug) => (
            <Link
              key={slug}
              to={`/rohan-selection/${slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                category === slug
                  ? 'bg-white text-slate-900'
                  : 'bg-white/15 border border-white/25 text-white hover:bg-white/25'
              }`}
            >
              {categoryLabel(slug).charAt(0) + categoryLabel(slug).slice(1).toLowerCase()}
            </Link>
          ))}
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !hasContent && (
          <div className="rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-sm p-14 text-center">
            <p className="text-white/70 text-lg">
              Nothing here yet — check back soon!
            </p>
          </div>
        )}

        {/* ── Intelligence Briefs (Ebooks) section ── */}
        {!isLoading && filteredEbooks.length > 0 && (
          <section className="mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-5">
              Intelligence Briefs
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredEbooks.map((p) => (
                <EbookCard key={p.id} product={p} onOpen={handleOpenEbook} />
              ))}
            </div>
          </section>
        )}

        {/* ── Affiliate gear section ── */}
        {!isLoading && filteredInventory.length > 0 && (
          <section className="mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-5">
              Recommended Gear
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredInventory.map((item) => (
                <AffiliateCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Affiliate disclosure ── */}
        <p className="text-xs text-white/40 text-center mt-8">
          Some links are affiliate links. We earn a small commission at no extra cost to you.{' '}
          <Link to="/affiliate-disclosure" className="underline underline-offset-2 hover:text-white/70 transition-colors">
            Full disclosure →
          </Link>
        </p>
      </main>

      {/* EbookModal portalled to body to escape background-color inheritance */}
      {selectedEbook && createPortal(
        <EbookModal ebook={selectedEbook} onClose={handleCloseEbook} />,
        document.body
      )}

      <Footer />
    </div>
  );
}
