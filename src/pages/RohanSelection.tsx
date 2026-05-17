import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// Map route slug → DB category string.
// Only add a pairing here when ebooks for that category actually exist in the DB.
// Unmapped slugs (e.g. credit-cards, tech, lifestyle) will show zero ebooks — intentional.
const SLUG_TO_DB_CATEGORY: Record<string, string> = {
  investing: 'Investing',
  'personal-finance': 'Finance',
  'riding-gear': 'Motorcycles',
};

// Category slug → human-readable display label (Title Case)
const CATEGORY_LABELS: Record<string, string> = {
  tech: 'Tech',
  investing: 'Investing',
  'personal-finance': 'Personal Finance',
  'riding-gear': 'Riding Gear',
  lifestyle: 'Lifestyle',
  'credit-cards': 'Credit Cards',
  motorcycles: 'Motorcycles',
  finance: 'Finance',
  travel: 'Travel',
};

function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Unified grid item: either an ebook or an affiliate product
type GridItem =
  | { kind: 'ebook'; product: Product }
  | { kind: 'affiliate'; item: InventoryItem };

// ── Affiliate card (white-background aesthetic) ───────────────────────────────

function AffiliateCard({ item }: { item: InventoryItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={optimizeCloudinaryUrl(item.imageID, { width: 400, quality: 'auto:eco' })}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-widest bg-black/40 text-white rounded-full px-2 py-0.5">
          Ad
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {item.displayCategory}
        </p>
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
          {item.name}
        </h3>
        <p className="text-xs text-slate-500 leading-snug line-clamp-2">
          {item.description}
        </p>
        <div className="mt-1 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7178AB] group-hover:text-slate-900 transition-colors">
            CHECK PRICE →
          </span>
        </div>
      </div>
    </a>
  );
}

// ── Ebook card (white-background aesthetic) ────────────────────────────────────

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
      className="group text-left flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <img
          src={optimizeCloudinaryUrl(product.cover_image_url || '', { width: 400 })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
          }}
        />
        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-[#7178AB] text-white rounded-full px-2 py-0.5">
          Brief
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500">by {product.author || 'Guiderr'}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <span className="text-base font-extrabold text-slate-900">
            ₹{product.price_in_rupees.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7178AB] group-hover:text-slate-900 transition-colors">
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
  const [searchQuery, setSearchQuery] = useState('');
  const isClosingRef = useRef(false);

  // Reset search when the user switches category pills
  useEffect(() => {
    setSearchQuery('');
  }, [category]);

  const deferredQuery = useDeferredValue(searchQuery);

  const handleOpenEbook = (ebook: Ebook) => {
    isClosingRef.current = false;
    setSelectedEbook(ebook);
    setSearchParams({ ebook: ebook.id }, { replace: true });
  };
  const handleCloseEbook = () => {
    isClosingRef.current = true;
    setSelectedEbook(null);
    setSearchParams({}, { replace: true });
  };

  // Ebooks — reuses existing React Query cache (zero extra DB hits)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['library-all-products'],
    queryFn: getAllProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Deep-link: auto-open modal when ?ebook=<id> is in the URL (e.g. shared links).
  // isClosingRef prevents re-opening during a close when the two state updates
  // (selectedEbook → null, searchParams → {}) haven't both flushed yet.
  useEffect(() => {
    if (isClosingRef.current) {
      isClosingRef.current = false;
      return;
    }
    const ebookSlug = searchParams.get('ebook');
    if (!ebookSlug || products.length === 0 || selectedEbook) return;
    const match = products.find((p) => p.id === ebookSlug);
    if (match) setSelectedEbook(toEbook(match));
  }, [products, searchParams, selectedEbook]);

  // Ghost word
  const ghostWord = category ? categoryLabel(category).toUpperCase() : 'SELECTION';

  // Unified hybrid grid — blend ebooks + affiliates in one array
  const gridItems = useMemo<GridItem[]>(() => {
    const affiliates: GridItem[] = (
      category ? INVENTORY.filter((i) => i.category === category) : INVENTORY
    ).map((item) => ({ kind: 'affiliate', item }));

    const dbCat = category ? SLUG_TO_DB_CATEGORY[category] : null;
    // If a category is active but has no DB mapping, return [] — never fall back
    // to the full product list (that caused briefs bleeding into unrelated categories).
    const ebooks: GridItem[] = (
      dbCat ? products.filter((p) => p.category === dbCat) : category ? [] : products
    ).map((product) => ({ kind: 'ebook', product }));

    // Ebooks first, then affiliates within each category view
    return [...ebooks, ...affiliates];
  }, [category, products]);

  // Client-side search filter — runs on the deferred value to keep typing snappy
  const filteredItems = useMemo<GridItem[]>(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return gridItems;
    return gridItems.filter((gi) => {
      if (gi.kind === 'ebook') {
        return (
          gi.product.name.toLowerCase().includes(q) ||
          (gi.product.description ?? '').toLowerCase().includes(q)
        );
      }
      return (
        gi.item.name.toLowerCase().includes(q) ||
        gi.item.description.toLowerCase().includes(q)
      );
    });
  }, [gridItems, deferredQuery]);

  // Category pills — union of inventory slugs + ebook slugs
  const allCategorySlugs = useMemo<string[]>(() => {
    const fromInventory = [...new Set(INVENTORY.map((i) => i.category))];
    const fromEbooks = [
      ...new Set(
        products
          .map(
            (p) =>
              Object.entries(SLUG_TO_DB_CATEGORY).find(([, v]) => v === p.category)?.[0]
          )
          .filter((s): s is string => Boolean(s))
      ),
    ];
    return [...new Set([...fromInventory, ...fromEbooks])];
  }, [products]);

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = category
      ? `${categoryLabel(category)} — Rohan Selection | Guiderr`
      : 'Rohan Selection | Guiderr — Curated Picks';
    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalWasPresent = !!canonical;
    const prevHref = canonical?.href ?? '';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = category
      ? `https://www.guiderr.in/rohan-selection/${category}`
      : 'https://www.guiderr.in/rohan-selection';
    return () => {
      document.title = prev;
      if (canonicalWasPresent && canonical) canonical.href = prevHref;
      else canonical?.remove();
    };
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28">

        {/* ── Page header with ghost word ── */}
        <div className="group relative mb-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-0 select-none font-black uppercase leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:translate-x-8"
            style={{ fontSize: 'clamp(3.5rem, 11vw, 7.5rem)', color: '#475569', opacity: 0.05 }}
          >
            {ghostWord}
          </span>

          <div className="relative z-10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 mb-5">
              Curated by Rohan
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.06] mb-4">
              {category ? categoryLabel(category) : 'The Selection.'}
            </h1>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
              {category
                ? `Hand-picked ${categoryLabel(category).toLowerCase()} — resources I personally use or recommend.`
                : 'Every resource I recommend — across investing, tech, gear, and modern life.'}
            </p>
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            to="/rohan-selection"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !category
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
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
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {categoryLabel(slug)}
            </Link>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="mb-8">
          <div className="relative w-full sm:max-w-sm">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear and briefs..."
              aria-label="Search products"
              className="w-full h-10 pl-4 pr-9 border-2 border-slate-900 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-lg outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors text-base leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty — no items in category ── */}
        {!isLoading && gridItems.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-14 text-center">
            <p className="text-slate-500 text-lg">Nothing here yet — check back soon!</p>
          </div>
        )}

        {/* ── Empty — search returned no results ── */}
        {!isLoading && gridItems.length > 0 && filteredItems.length === 0 && (
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-14 text-center">
            <p className="text-slate-900 font-bold text-lg mb-2">No results for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-slate-500 text-sm">
              Try a different keyword, or{' '}
              <button
                onClick={() => setSearchQuery('')}
                className="underline underline-offset-2 hover:text-slate-900 transition-colors"
              >
                clear the search
              </button>
              {category && (
                <>
                  {' '}to browse all{' '}
                  <Link to="/rohan-selection" className="underline underline-offset-2 hover:text-slate-900 transition-colors">
                    categories
                  </Link>
                </>
              )}.
            </p>
          </div>
        )}

        {/* ── Unified Hybrid Grid ── */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredItems.map((gi) =>
              gi.kind === 'ebook' ? (
                <EbookCard key={gi.product.id} product={gi.product} onOpen={handleOpenEbook} />
              ) : (
                <AffiliateCard key={gi.item.id} item={gi.item} />
              )
            )}
          </div>
        )}

        {/* ── Affiliate disclosure ── */}
        <p className="text-xs text-slate-400 text-center mt-12">
          Some links are affiliate links. We earn a small commission at no extra cost to you.{' '}
          <Link
            to="/affiliate-disclosure"
            className="underline underline-offset-2 hover:text-slate-600 transition-colors"
          >
            Full disclosure →
          </Link>
        </p>
      </main>

      {/* EbookModal portalled to body — escapes any parent CSS scope */}
      {selectedEbook &&
        createPortal(
          <EbookModal ebook={selectedEbook} onClose={handleCloseEbook} />,
          document.body
        )}

      <Footer />
    </div>
  );
}
