import { Link } from 'react-router-dom';

// Maps blog post category strings (from frontmatter) → URL slugs.
// Lifestyle, Business, Automotive don't have dedicated CategoryPage routes
// so they link to the filtered /guides listing instead.
const CATEGORY_TO_SLUG: Record<string, string> = {
  Finance:       '/finance',
  Investing:     '/investing',
  Motorcycles:   '/motorcycles',
  Travel:        '/travel',
  Tech:          '/gadget-tech',
  'Home & Living': '/home-living',
  Business:      '/guides?category=Business',
  Lifestyle:     '/guides?category=Lifestyle',
  Automotive:    '/guides?category=Automotive',
};

interface ArticleFooterProps {
  category?: string;
}

export default function ArticleFooter({ category }: ArticleFooterProps) {
  const categorySlug = category ? CATEGORY_TO_SLUG[category] : undefined;
  const categoryLabel = category === 'Finance' ? 'Personal Finance' : category;

  return (
    <section aria-label="Article next steps" className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-6">
        Where to go next
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        {/* Card 1 — Start Here */}
        <Link
          to="/start-here"
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
            New here?
          </span>
          <span className="text-base font-bold text-slate-900">Start Here →</span>
          <span className="text-sm text-slate-500 leading-snug">
            Your decision-map for Money, Wheels &amp; Life.
          </span>
        </Link>

        {/* Card 2 — Ebook Vault */}
        <Link
          to="/#featured"
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-900 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
            Intelligence Vault
          </span>
          <span className="text-base font-bold text-white">Browse Ebooks →</span>
          <span className="text-sm text-slate-400 leading-snug">
            Premium frameworks from ₹299.
          </span>
        </Link>

        {/* Card 3 — Category hub (or All Guides fallback) */}
        {categorySlug ? (
          <Link
            to={categorySlug}
            className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
              Go deeper
            </span>
            <span className="text-base font-bold text-slate-900">
              Master {categoryLabel} →
            </span>
            <span className="text-sm text-slate-500 leading-snug">
              All ebooks and guides in this category.
            </span>
          </Link>
        ) : (
          <Link
            to="/guides"
            className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-600 transition-colors">
              Explore more
            </span>
            <span className="text-base font-bold text-slate-900">All Guides →</span>
            <span className="text-sm text-slate-500 leading-snug">
              Browse all free articles.
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
