import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, Product } from '../utils/supabase';
import { optimizeCloudinaryUrl } from '../utils/cloudinary';

// Maps frontmatter category → filtered blog URL.
const CATEGORY_BLOG_URL: Record<string, string> = {
  Finance:     '/guides?category=Finance',
  Investing:   '/investing',
  Automotive:  '/guides?category=Automotive',
  Motorcycles: '/guides?category=Automotive',
  Travel:      '/guides?category=Travel',
  Tech:        '/guides?category=Tech',
  Lifestyle:   '/guides?category=Lifestyle',
  Business:    '/guides?category=Business',
};

// Human-readable label overrides.
const CATEGORY_DISPLAY: Record<string, string> = {
  Finance: 'Personal Finance',
};

// Maps frontmatter category → products table category (for matchmaking).
const CATEGORY_PRODUCT_MAP: Record<string, string[]> = {
  Finance:     ['Finance', 'Personal Finance'],
  Investing:   ['Finance', 'Investing', 'Personal Finance'],
  Automotive:  ['Motorcycles', 'Automotive'],
  Motorcycles: ['Motorcycles', 'Automotive'],
  Travel:      ['Travel'],
  Tech:        ['Gadget & Tech', 'Tech'],
  Lifestyle:   ['Lifestyle', 'Beauty & Wellness', 'Home & Living'],
  Business:    ['Business'],
};

interface ArticleFooterProps {
  category?: string;
}

export default function ArticleFooter({ category }: ArticleFooterProps) {
  const blogUrl = category ? (CATEGORY_BLOG_URL[category] ?? '/guides') : '/guides';
  const displayLabel = category ? (CATEGORY_DISPLAY[category] ?? category) : 'All Topics';

  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllProducts()
      .then((products) => {
        if (cancelled || products.length === 0) return;

        const targetCategories = category
          ? (CATEGORY_PRODUCT_MAP[category] ?? [])
          : [];

        // Find product whose category matches the article's niche
        let match: Product | null = null;
        if (targetCategories.length > 0) {
          match = products.find((p) =>
            targetCategories.some(
              (tc) => p.category?.toLowerCase() === tc.toLowerCase()
            )
          ) ?? null;
        }

        // Fallback: most recently added product (sorted desc by created_at)
        if (!match) match = products[0];

        if (!cancelled) setMatchedProduct(match);
      })
      .catch(() => {
        // Silently fail — footer degrades to static /library link
      });

    return () => { cancelled = true; };
  }, [category]);

  return (
    <section aria-label="Article next steps" className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-6">
        Where to go next
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        {/* Window 1 — Topical Retention (already working) */}
        <Link
          to={blogUrl}
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
            Continue reading
          </span>
          <span className="text-base font-bold text-slate-900">{displayLabel} Articles →</span>
          <span className="text-sm text-slate-500 leading-snug">
            More guides from the {displayLabel} desk.
          </span>
        </Link>

        {/* Window 2 — Revenue: Dynamic Matchmaking */}
        {matchedProduct ? (
          <Link
            to="/library"
            className="group flex flex-col gap-2 rounded-2xl border border-white/20 bg-[#7178AB] p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 no-underline overflow-hidden relative"
          >
            {/* Ghost ₹ drift on hover — pure CSS, no Framer Motion */}
            <span
              aria-hidden
              className="absolute -right-3 -bottom-3 text-[72px] font-black text-white/8 leading-none select-none pointer-events-none transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
            >
              ₹
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60 group-hover:text-white/80 transition-colors">
              Intelligence Vault
            </span>

            {matchedProduct.cover_image_url && (
              <img
                src={optimizeCloudinaryUrl(matchedProduct.cover_image_url, { width: 120 })}
                alt={matchedProduct.name}
                className="w-10 h-14 object-cover rounded-md shadow-md shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <span className="text-sm font-bold text-white leading-snug line-clamp-2">
              {matchedProduct.name} →
            </span>
            <span className="text-xs text-white/70 leading-snug">
              ₹{matchedProduct.price_in_rupees.toLocaleString('en-IN')} · Premium{' '}
              {matchedProduct.category || 'Blueprint'}
            </span>
          </Link>
        ) : (
          /* Fallback while loading / no products */
          <Link
            to="/library"
            className="flex flex-col gap-1.5 rounded-2xl border border-white/20 bg-[#7178AB] p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60 group-hover:text-white/80 transition-colors">
              Intelligence Vault
            </span>
            <span className="text-base font-bold text-white">Browse Ebooks →</span>
            <span className="text-sm text-white/70 leading-snug">
              Download premium blueprints and checklists from ₹299.
            </span>
          </Link>
        )}

        {/* Window 3 — Authority: Featured Stories (already working) */}
        <Link
          to="/featured"
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
            Featured Stories
          </span>
          <span className="text-base font-bold text-slate-900">Creator Spotlights →</span>
          <span className="text-sm text-slate-500 leading-snug">
            Insights from the startups and creators moving India forward.
          </span>
        </Link>
      </div>
    </section>
  );
}
