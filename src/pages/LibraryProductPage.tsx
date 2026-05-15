import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProductById, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';
import { toEbook } from '../utils/productToEbook';
import { useCart } from '../context/CartContext';

// ─── Markdown custom renderers ───────────────────────────────────────────────
// Blockquotes become styled dark callout boxes.
// Admin can write: > **INSIGHT:** body text
const MarkdownComponents = {
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-5 rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-sm leading-relaxed text-slate-700 not-italic">
      {children}
    </div>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 leading-relaxed text-slate-700">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 space-y-1 pl-5 list-disc marker:text-slate-400">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 space-y-1 pl-5 list-decimal marker:text-slate-400">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-slate-700 leading-relaxed">{children}</li>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-6 mb-2 text-lg font-bold text-slate-900">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-5 mb-2 text-base font-semibold text-slate-800">{children}</h3>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LibraryProductPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { addToCart, setIsCartOpen } = useCart();

  // Seed from the library grid cache if available — zero extra DB hit.
  const cachedProducts = queryClient.getQueryData<Product[]>(['library-all-products']);
  const cachedProduct = cachedProducts?.find((p) => p.id === id);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    initialData: cachedProduct,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // SEO meta
  useEffect(() => {
    if (!product) return;
    const prev = document.title;
    document.title = `${product.name} | Guiderr`;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? '';
    if (meta) {
      meta.content = (product.description || product.name).slice(0, 155);
    }
    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
    };
  }, [product]);

  // ── Sticky mobile "Buy Now" bar ──────────────────────────────────────────
  // Show the sticky bar only once the hero button scrolls out of view.
  const heroBuyRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const btn = heroBuyRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, [product]); // re-attach after product loads

  const handleBuy = () => {
    if (!product) return;
    addToCart(toEbook(product));
    setIsCartOpen(true);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-900 px-4">
          <p className="text-lg font-semibold">Product not found.</p>
          <Link to="/library" className="text-slate-500 hover:text-slate-900 text-sm underline">
            ← Back to Library
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverSrc = optimizeCloudinaryUrl(product.cover_image_url || '', { width: 600 });
  const price = `₹${product.price_in_rupees.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/*
        Desktop: single above-the-fold rectangle — 2-col grid, left = cover, right = all details.
        Mobile: stacked, cover on top, details below, sticky bar handles repeat CTA.
      */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 sm:pb-16">

        {/* ── Back navigation ── */}
        <div className="mb-6">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Intelligence Vault
          </Link>
        </div>

        {/* ── Product rectangle: Cover (left) | Details (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 lg:gap-0 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">

          {/* ── LEFT: Cover ── */}
          <div className="bg-slate-50 lg:self-start lg:border-r border-slate-100">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden">
              <img
                src={coverSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/covers/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: All details ── */}
          <div className="flex flex-col px-7 py-7 lg:py-8 lg:px-9 gap-0">

            {/* Category pill */}
            {product.category && (
              <span className="self-start mb-4 px-3 py-0.5 rounded-full bg-slate-100 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug mb-1">
              {product.name}
            </h1>

            {/* Author */}
            <p className="text-sm text-slate-400 mb-4">
              by {product.author || 'Guiderr Editorial'}
            </p>

            {/* ── Separator 1 ── */}
            <div className="border-t border-slate-100 mb-4" />

            {/* Synopsis */}
            {product.description && (
              <div className="flex-1 overflow-y-auto text-[14px] mb-4 pr-1
                              [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
                <ReactMarkdown components={MarkdownComponents}>
                  {product.description}
                </ReactMarkdown>
              </div>
            )}

            {/* ── Separator 2 ── */}
            <div className="border-t border-slate-100 mb-5" />

            {/* Buy Now — primary action, price embedded, watched by IntersectionObserver */}
            <button
              ref={heroBuyRef}
              onClick={handleBuy}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              <ShoppingBag className="w-4 h-4" />
              Buy Now — {price}
            </button>

            {/* Trust signals */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
              {[
                'Instant PDF delivery',
                'Secured by Razorpay',
                'Read on any device',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>

            {/* Back link */}
            <Link
              to="/library"
              className="mt-4 text-center text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              ← Browse more titles
            </Link>
          </div>
        </div>
      </main>

      {/* ── Sticky mobile Buy bar — CSS transition, only visible on sm and below ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4 pt-3 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
          <button
            onClick={handleBuy}
            className="pointer-events-auto w-full flex items-center justify-center gap-2.5 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl active:scale-[0.98] transition-all duration-150 text-base"
          >
            <ShoppingBag className="w-5 h-5" />
            Buy Now — {price}
          </button>
        </div>

      <Footer />
    </div>
  );
}
