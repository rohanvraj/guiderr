import { Link } from 'react-router-dom';

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

interface ArticleFooterProps {
  category?: string;
}

export default function ArticleFooter({ category }: ArticleFooterProps) {
  const blogUrl = category ? (CATEGORY_BLOG_URL[category] ?? '/guides') : '/guides';
  const displayLabel = category ? (CATEGORY_DISPLAY[category] ?? category) : 'All Topics';

  return (
    <section aria-label="Article next steps" className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 mb-6">
        Where to go next
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        {/* Window 1 — Topical Retention */}
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

        {/* Window 2 — Revenue: Intelligence Vault */}
        <Link
          to="/library"
          className="flex flex-col gap-1.5 rounded-2xl border border-purple-100 bg-slate-900 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group no-underline"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-300 group-hover:text-purple-200 transition-colors">
            Intelligence Vault
          </span>
          <span className="text-base font-bold text-white">Browse Ebooks →</span>
          <span className="text-sm text-purple-200 leading-snug">
            Download premium blueprints and checklists from ₹299.
          </span>
        </Link>

        {/* Window 3 — Authority: Featured Stories */}
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
